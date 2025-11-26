# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/68a7882d-c665-42a6-a12c-4930c83c3790

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/68a7882d-c665-42a6-a12c-4930c83c3790) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Dataset and Docker build

This project uses a large CSV dataset (acidentes_2017_2025_tratado.csv). To avoid storing the raw CSV in the repository history the build process downloads a compressed ZIP and extracts it into `public/data/` during the Docker build.

You can provide the dataset source to the Docker build in one of two ways:

- DATA_DOWNLOAD_URL: a direct URL to the ZIP file (recommended if you host the zip in a blob store, e.g. Vercel Blob). Example Vercel blob URL formats are public HTTPS links such as:

	https://<your-vercel-deployment>-vercel-storage.vercel.app/acidentesPRF/acidentes_2017_2025_tratado.zip

	(Replace the hostname/path with the blob URL for your deployment. The script accepts any direct HTTPS URL that returns the ZIP file.)

- DATA_FILE_ID: a Google Drive file id (the helper will use gdown). This is the fallback used by default in the Dockerfile.

Build example using a Vercel blob URL:

```bash
docker build -f Dockerfile.dev -t rota-segura-dev \
	--build-arg DATA_DOWNLOAD_URL='https://<your-vercel-blob-url>/acidentes_2017_2025_tratado.zip' .
```

If `DATA_DOWNLOAD_URL` is not provided the Dockerfile will use the `DATA_FILE_ID` ARG (preconfigured to a public Google Drive id) to download the ZIP via `gdown`.

Notes:
- The build step uses `scripts/download_data.sh` to perform the download and extraction. The script accepts either a direct URL or a Google Drive file id.
- If your blob URL requires authentication, we can extend the script and Dockerfile to accept an authorization token (for example via `--build-arg DATA_DOWNLOAD_AUTH='Bearer ...'`) and pass an Authorization header to `curl`.
- For local development you can also run the helper manually instead of Docker:

```bash
# download and extract locally (requires python/gdown or curl)
./scripts/download_data.sh 'https://<your-vercel-blob-url>/acidentes_2017_2025_tratado.zip' public/data/acidentes_2017_2025_tratado.zip
```


**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/68a7882d-c665-42a6-a12c-4930c83c3790) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
