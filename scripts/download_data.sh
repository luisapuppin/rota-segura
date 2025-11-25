#!/usr/bin/env sh
set -euo pipefail

# Helper to download and extract the accidents dataset from Google Drive.
# Usage: ./scripts/download_data.sh FILE_ID DEST_ZIP
# Example: ./scripts/download_data.sh 1Y2WLl9sGTGqBGTLahFAgtluyHidtfHu4 public/data/acidentes_2017_2025_tratado.csv.zip

FILE_ID=${1:-}
DEST_ZIP=${2:-public/data/acidentes_2017_2025_tratado.csv.zip}

if [ -z "$FILE_ID" ]; then
  echo "Usage: $0 FILE_ID [DEST_ZIP]"
  exit 2
fi

mkdir -p "$(dirname "$DEST_ZIP")"

if [ -f "$DEST_ZIP" ]; then
  echo "Dataset zip already exists at $DEST_ZIP, skipping download."
  exit 0
fi

echo "Downloading dataset to $DEST_ZIP from Google Drive id=$FILE_ID"

# Try to use gdown if available, otherwise install it temporarily via pip
command -v gdown >/dev/null 2>&1 || GDOWN_MISSING=1 && true

if [ -z "${GDOWN_MISSING:-}" ]; then
  # gdown is present
  gdown --id "$FILE_ID" -O "$DEST_ZIP"
else
  # Try to use python3/pip to run gdown module
  if command -v python3 >/dev/null 2>&1; then
    python3 -m pip install --user --upgrade pip >/dev/null 2>&1 || true
    python3 -m pip install --user gdown >/dev/null 2>&1 || true
    python3 -m gdown --id "$FILE_ID" -O "$DEST_ZIP"
    # note: we don't uninstall user packages here (safer in CI to keep them)
  else
    echo "Neither gdown nor python3 available to download the file."
    exit 3
  fi
fi

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
