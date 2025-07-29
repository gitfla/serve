#!/bin/bash
set -e

IMAGE_NAME="serve-backend"
REGION="southamerica-east1"
PROJECT_ID="serve-353822"
REPO_NAME="serve-backend-repo"
TAG="latest"

FULL_IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$IMAGE_NAME:$TAG"

# 👇 Step 1: Build for Cloud Run compatible arch
docker build --platform=linux/amd64 -t $IMAGE_NAME -f Dockerfile .

# 👇 Step 2: Tag and push to Artifact Registry
docker tag $IMAGE_NAME $FULL_IMAGE
docker push $FULL_IMAGE

# 👇 Step 3: Read .env file and convert to Cloud Run format
ENV_VARS=$(grep -v '^#' server/vars/.env | xargs | sed 's/ /,/g')

# 👇 Step 4: Deploy to Cloud Run
gcloud run deploy $IMAGE_NAME \
  --image=$FULL_IMAGE \
  --platform=managed \
  --region=$REGION \
  --allow-unauthenticated \
  --set-env-vars "$ENV_VARS"
