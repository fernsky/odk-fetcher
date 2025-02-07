#!/bin/bash

# Configuration
DOCKER_USERNAME="isresearch"
IMAGE_NAME="odk-fetcher"
VERSION=$(cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[[:space:]]')

# Login to Docker Hub (you should have DOCKER_PASSWORD set as environment variable)

# Build the production image
echo "Building production image..."
docker build -f Dockerfile.prod -t "$DOCKER_USERNAME/$IMAGE_NAME:latest" -t "$DOCKER_USERNAME/$IMAGE_NAME:$VERSION" .

# Push the images
echo "Pushing images to Docker Hub..."
docker push "$DOCKER_USERNAME/$IMAGE_NAME:latest"
docker push "$DOCKER_USERNAME/$IMAGE_NAME:$VERSION"

echo "Done! Images pushed to Docker Hub"
