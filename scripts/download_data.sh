#!/usr/bin/env sh
set -euo pipefail

# Helper to download and extract the accidents dataset from Google Drive.
# Usage: ./scripts/download_data.sh FILE_ID DEST_ZIP
# Example: ./scripts/download_data.sh 1Y2WLl9sGTGqBGTLahFAgtluyHidtfHu4 public/data/acidentes_2017_2025_tratado.csv.zip

SOURCE=${1:-}
DEST_ZIP=${2:-public/data/acidentes_2017_2025_tratado.csv.zip}

if [ -z "$SOURCE" ]; then
  echo "Usage: $0 SOURCE [DEST_ZIP]
Where SOURCE can be either a direct download URL (https://...) or a Google Drive file id." >&2
  exit 2
fi

mkdir -p "$(dirname "$DEST_ZIP")"

if [ -f "$DEST_ZIP" ]; then
  echo "Dataset zip already exists at $DEST_ZIP, skipping download."
  exit 0
fi

echo "Downloading dataset to $DEST_ZIP from Google Drive id=$FILE_ID"
# If SOURCE looks like a URL, download it directly; otherwise treat it as a Google Drive file id
case "$SOURCE" in
  http://*|https://*)
    echo "Detected URL source. Downloading $SOURCE -> $DEST_ZIP"
    # prefer curl, fall back to wget
    if command -v curl >/dev/null 2>&1; then
      curl -fSL "$SOURCE" -o "$DEST_ZIP"
    elif command -v wget >/dev/null 2>&1; then
      wget -O "$DEST_ZIP" "$SOURCE"
    else
      # try python
      if command -v python3 >/dev/null 2>&1; then
        python3 - <<PY
import sys, urllib.request
urllib.request.urlretrieve(sys.argv[1], sys.argv[2])
PY
      else
        echo "No download tool (curl/wget/python) available to fetch URL." >&2
        exit 3
      fi
    fi
    ;;
  *)
    echo "Detected Google Drive file id: $SOURCE"
    # Try to use gdown if available, otherwise install it temporarily via pip
    if command -v gdown >/dev/null 2>&1; then
      gdown --id "$SOURCE" -O "$DEST_ZIP"
    else
      if command -v python3 >/dev/null 2>&1; then
        python3 -m pip install --user --upgrade pip >/dev/null 2>&1 || true
        python3 -m pip install --user gdown >/dev/null 2>&1 || true
        python3 -m gdown --id "$SOURCE" -O "$DEST_ZIP"
      else
        echo "Neither gdown nor python3 available to download the file by id." >&2
        exit 3
      fi
    fi
    ;;
esac

if [ -f "$DEST_ZIP" ]; then
  echo "Unzipping $DEST_ZIP -> $(dirname "$DEST_ZIP")"
  mkdir -p "$(dirname "$DEST_ZIP")"
  command -v unzip >/dev/null 2>&1 || (echo "unzip not found; attempting to continue if environment provides unzip" >&2)
  unzip -o "$DEST_ZIP" -d "$(dirname "$DEST_ZIP")" || true
  echo "Download and extraction complete."
else
  echo "Download failed: $DEST_ZIP not found." >&2
  exit 4
fi
