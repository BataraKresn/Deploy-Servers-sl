#!/bin/bash
set -e

# Ensure trigger logs directory exists so backend can mount it
mkdir -p trigger-logs

# Ensure deploy script is executable
chmod +x deploy.sh

# Build and start the containers using Docker Compose
if docker compose version >/dev/null 2>&1; then
  docker compose up --build -d
elif command -v docker-compose >/dev/null 2>&1; then
  docker-compose up --build -d
else
  echo "Docker Compose is not installed. Please install Docker Compose." >&2
  exit 1
fi
