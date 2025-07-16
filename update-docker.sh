#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

# === Konfigurasi ===
LOG_DIR="logs-builder"
BUILD_LOG_TTL_DAYS=7
SERVICES=("frontend" "backend")

# Format timestamp
TIMESTAMP=$(date '+%Y%m%d-%H%M%S')

# Fungsi log warna
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

# Cleanup log lama (>7 hari)
if [ ! -d "$LOG_DIR" ]; then
  mkdir -p "$LOG_DIR"
else
  find "$LOG_DIR" -type f -mtime +$BUILD_LOG_TTL_DAYS -exec rm -f {} \;
  log info "🧹 Old logs older than $BUILD_LOG_TTL_DAYS days removed."
fi

# === Fungsi Hitung Hash dan Log Perubahan ===
calculate_hash() {
  local context="$1"
  local exclude_dirs="node_modules|.git|__pycache__|.next|.env|trigger-logs|logs|.venv"
  local include_ext="\.py$|\.ts$|\.tsx$|\.js$|\.json$|\.sh$|\.env$|Dockerfile$"
  find "$context" -type f \
    ! -regex ".*\(${exclude_dirs//|/\\|}\).*" \
    | grep -E "$include_ext" \
    | sort
}

# Loop per service
for service in "${SERVICES[@]}"; do
  log info "🔍 Checking changes for service: $service"
  context_dir="."
  [[ "$service" == "backend" ]] && context_dir="./backend"

  file_list=$(calculate_hash "$context_dir")
  hash_value=$(echo "$file_list" | xargs sha256sum | sha256sum | awk '{print $1}')
  hash_file=".hash-${service}"
  log_file="${LOG_DIR}/build-${service}-${TIMESTAMP}.log"

  echo "$file_list" > "$log_file"
  log info "📦 Total ${file_list}" | wc -l | xargs echo "files found."

  if [[ -f "$hash_file" ]]; then
    prev_hash=$(cat "$hash_file")
  else
    prev_hash=""
  fi

  if [[ "$hash_value" == "$prev_hash" ]]; then
    log ok "✅ No changes detected in $service. Skipping rebuild."
  else
    echo "$hash_value" > "$hash_file"
    log warn "🛠 Changes detected in $service, rebuilding..."

    # === Ringkasan perubahan (diff) ===
    prev_list=$(mktemp)
    curr_list=$(mktemp)
    [[ -f "$log_file.prev" ]] && cp "$log_file.prev" "$prev_list" || touch "$prev_list"
    cp "$log_file" "$log_file.prev"
    cp "$log_file" "$curr_list"

    added=$(comm -13 "$prev_list" "$curr_list")
    removed=$(comm -23 "$prev_list" "$curr_list")
    modified=$(echo "$added" "$removed" | sort | uniq -d)

    {
      echo "=== SUMMARY CHANGES for $service ==="
      [[ -n "$added" ]]   && echo "🟢 Added:" && echo "$added"
      [[ -n "$removed" ]] && echo "🔴 Removed:" && echo "$removed"
      [[ -n "$modified" ]] && echo "🟡 Modified (suspicious):" && echo "$modified"
    } >> "$log_file"

    # === Build ===
    docker compose build --no-cache "$service"
  fi
done

# Jalankan semua container
log info "🚀 Starting all containers..."
docker compose up -d

# Cleanup image lama
log info "🧹 Pruning old images (older than 24h)..."
docker image prune -f --filter "until=24h"

log ok "✅ Build complete with log in $LOG_DIR"
