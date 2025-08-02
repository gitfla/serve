# Serve

This app mocks a conversation among writers, allowing users to take part as well.

## Description

It uses writers' body of work and semantic similarity to construct a conversation flow.

## Getting Started

### Executing program

* In order to run this app locally,  navigate to `client/`, and run:
```
npm run dev
```
* Then in another terminal navigate to `server/`, and run:
```
npm run dev
```
The enviroment variables need to be modified in `.env` and `.env.yaml` files to point to the correct database and GCS storage.

### Deploying PCA backend

`docker build -t pca-service .   `

```
gcloud builds submit pca-service \
--tag southamerica-east1-docker.pkg.dev/serve-353822/pca-service-repo/pca-service
```

```
gcloud run deploy pca-service \
--image=southamerica-east1-docker.pkg.dev/serve-353822/pca-service-repo/pca-service \
--platform=managed \
--region=southamerica-east1 \
--allow-unauthenticated
```

## Authors

Contributors names and contact info

Flavio Fiszman
flaviofiszman@gmail.com