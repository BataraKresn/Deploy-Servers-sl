#!/bin/bash
set -e

# Ensure trigger logs directory exists so backend can mount it
mkdir -p trigger-logs

# Ensure deploy script is executable
chmod +x deploy.sh

# Build and start the containers using Docker Compose
if command -v docker-compose >/dev/null 2>&1; then
  docker-compose up --build -d
else
  docker compose up --build -d
fi
