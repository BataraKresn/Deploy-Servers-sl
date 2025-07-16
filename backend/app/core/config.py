# File: backend/app/core/config.py
import os

BASE_DIR = "/app"
LOG_DIR = os.path.join(BASE_DIR, "logs")
SERVERS_FILE = os.path.join(BASE_DIR, "servers.json")
TMP_DIR = "/tmp/ssh_keys"
TOKEN = os.getenv("DEPLOY_TOKEN", "SATindonesia2025")