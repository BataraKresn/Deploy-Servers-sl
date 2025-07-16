#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

# Function for colored logging
log() {
  local type="$1"
  local msg="$2"
  local datetime
  datetime=$(date '+%Y-%m-%d %H:%M:%S')

  case "$type" in
    info)  echo -e "[$datetime] \033[1;34m[INFO]\033[0m  $msg" ;;
    ok)    echo -e "[$datetime] \033[1;32m[SUCCESS]\033[0m $msg" ;;
    warn)  echo -e "[$datetime] \033[1;33m[WARN]\033[0m  $msg" ;;
    error) echo -e "[$datetime] \033[1;31m[ERROR]\033[0m $msg" >&2 ;;
    *)     echo -e "[$datetime] $msg" ;;
  esac
}

log info "Starting setup process..."

# Create log directory
log info "Ensuring trigger log directory exists..."
mkdir -p trigger-logs
log ok "Directory 'trigger-logs' is ready."

# Ensure deploy.sh is executable
if [[ -f "deploy.sh" ]]; then
  chmod +x deploy.sh
  log ok "'deploy.sh' marked as executable."
else
  log warn "'deploy.sh' not found. Skipping chmod."
fi

# Run Docker Compose
log info "Attempting to start Docker containers..."

if command -v docker compose >/dev/null 2>&1; then
  log info "Using Docker Compose V2..."
  docker compose build --no-cache
  docker compose up -d
elif command -v docker-compose >/dev/null 2>&1; then
  log info "Using Docker Compose V1..."
  docker-compose up --build --no-cache -d
else
  log error "Docker Compose is not installed. Please install it first."
  exit 1
fi

log ok "Containers built and started successfully!"
