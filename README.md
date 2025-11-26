# Dashboard Rota Segura

## Informações do projeto

URL do dashboard Rota Segura no Vercel:
https://rota-segura-five.vercel.app/

URL do protótipo no Lovable:
https://lovable.dev/projects/68a7882d-c665-42a6-a12c-4930c83c3790

URL de origem dos dados:
https://www.gov.br/prf/pt-br/acesso-a-informacao/dados-abertos/dados-abertos-da-prf

URL do notebook de tratamento de dados:
https://colab.research.google.com/drive/1KR-3eDeomqqjUupViKJqwYGGz02gwxFa?usp=sharing

## Instruções para execução local (docker)

Este projeto utiliza um grande conjunto de dados CSV (acidentes_2017_2025_tratado.csv). Para evitar o armazenamento do CSV original no repositório, o processo de build foi configurado para baixar um ZIP compactado e o extrair para public/data/ no decorrer do build no Vercel.

**Para fazer o deploy local faça:**

1. Fazer o download dos dados tratados e descompactá-lo: https://drive.google.com/file/d/1Y2WLl9sGTGqBGTLahFAgtluyHidtfHu4/view?usp=sharing
2. Clonar esse projeto em sua máquina local.
3. Edite o arquivo Dockerfile.dev e **apague** a seção abaixo:

```
# Download and extract the dataset from Google Drive if it's not present locally.
# Uses `gdown` (installed temporarily) to handle Google Drive download confirmation tokens.
# FILE_ID is taken from the shared link: https://drive.google.com/file/d/FILE_ID/view
ARG DATA_FILE_ID=1Y2WLl9sGTGqBGTLahFAgtluyHidtfHu4
ARG DATA_DOWNLOAD_URL=
ARG DATA_ZIP=public/data/acidentes_2017_2025_tratado.zip
RUN mkdir -p public/data && \
		if [ ! -f "$DATA_ZIP" ]; then \
			echo "Downloading dataset via scripts/download_data.sh..."; \
			apk add --no-cache python3 py3-pip unzip ca-certificates curl && \
			chmod +x ./scripts/download_data.sh && \
					if [ -n "$DATA_DOWNLOAD_URL" ]; then \
						./scripts/download_data.sh "$DATA_DOWNLOAD_URL" "$DATA_ZIP"; \
			else \
						./scripts/download_data.sh "$DATA_FILE_ID" "$DATA_ZIP"; \
			fi; \
		else \
			echo "Dataset zip already present, skipping download."; \
		fi
```

4. Mova o arquivo descompactado no passo 1 para dentro do diretório public/data/
5. No terminal de comando, vá para o diretório do projeto e execute docker compose para subir o container:

``` sh
cd <CAMINHO_DO_PROJETO>
docker compose up --build -d
# As dependencias serão instaladas automaticamente ao subir o container
```

6. Acesse a aplicação no navegador: http://localhost:8080/

## Que tecnologias são usadas neste projeto?

Este projeto é construído com:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
