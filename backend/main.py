from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import asyncio
import os
import json
import subprocess
from datetime import datetime, timedelta
import time
import uuid
import stat

# --- Configuration ---
TOKEN = os.getenv("DEPLOY_TOKEN", "SATindonesia2025")
LOG_DIR = "/app/logs"
SERVERS_FILE = "/app/servers.json"
# A secure, temporary directory inside the container for SSH keys
TMP_DIR = "/tmp/ssh_keys"
os.makedirs(LOG_DIR, exist_ok=True)
os.makedirs(TMP_DIR, exist_ok=True)

# --- FastAPI App Initialization ---
app = FastAPI(
    title="Trigger Deploy API",
    description="API to trigger and monitor deployments.",
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for simplicity in Docker env
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---
class DeployRequest(BaseModel):
    token: str
    serverId: str
    privateKey: Optional[str] = None

class Server(BaseModel):
    id: str
    name: str
    alias: str
    user: str
    ip: str
    path: str

# --- Helper Functions ---
def clean_old_logs(days: int = 7):
    """Removes log files older than the specified number of days."""
    now = time.time()
    cutoff = now - (days * 86400)
    try:
        for filename in os.listdir(LOG_DIR):
            path = os.path.join(LOG_DIR, filename)
            if os.path.isfile(path) and os.path.getmtime(path) < cutoff:
                os.remove(path)
                print(f"Removed old log file: {filename}")
    except OSError as e:
        print(f"Error cleaning old logs: {e}")

# --- API Routes ---
@app.get("/api/servers", response_model=list[Server])
async def get_servers():
    """Returns a list of available servers from servers.json."""
    try:
        with open(SERVERS_FILE, "r") as f:
            servers_data = json.load(f)
        return [Server(**s) for s in servers_data.get("servers", [])]
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"{SERVERS_FILE} not found.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load or validate {SERVERS_FILE}: {e}")

@app.post("/api/deploy", status_code=202)
async def deploy_server(payload: DeployRequest):
    """Triggers a deployment script for a given server."""
    if payload.token != TOKEN:
        raise HTTPException(status_code=401, detail="Invalid or missing token")

    clean_old_logs()

    try:
        with open(SERVERS_FILE, "r") as f:
            servers = json.load(f).get("servers", [])
        server_details = next((s for s in servers if s["id"] == payload.serverId), None)
        if not server_details:
            raise HTTPException(status_code=404, detail="Server not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading server data: {e}")

    timestamp = datetime.now().strftime('%Y%m%d-%H%M%S')
    log_filename = f"deploy-{payload.serverId}-{timestamp}.log"
    log_path = os.path.join(LOG_DIR, log_filename)
    
    key_file_path = "none"
    if payload.privateKey:
        # Create a temporary, secure file for the SSH key
        key_filename = f"ssh_key_{uuid.uuid4()}"
        key_file_path = os.path.join(TMP_DIR, key_filename)
        with open(key_file_path, "w") as f:
            f.write(payload.privateKey)
        # Set permissions to 600 (owner read/write only)
        os.chmod(key_file_path, stat.S_IRUSR | stat.S_IWUSR)

    try:
        command = [
            "/app/deploy.sh",
            server_details['user'],
            server_details['ip'],
            server_details['path'],
            server_details['name'],
            key_file_path  # Pass key path to script
        ]
        with open(log_path, "w") as log_file:
            # The script will run in the background. It is responsible for cleaning up the key file.
            subprocess.Popen(command, stdout=log_file, stderr=subprocess.STDOUT, close_fds=True)
        
        return {"message": "Deployment triggered successfully", "log_file": log_filename}
    except Exception as e:
        # If Popen fails, we need to clean up the key file here
        if key_file_path != "none" and os.path.exists(key_file_path):
            os.remove(key_file_path)
        raise HTTPException(status_code=500, detail=f"Failed to start deployment script: {e}")

@app.get("/api/logs")
async def list_logs():
    """Lists all available log files."""
    try:
        logs = sorted([f for f in os.listdir(LOG_DIR) if f.endswith('.log')], reverse=True)
        return logs
    except FileNotFoundError:
        return []

@app.get("/api/logs/{log_file}")
async def get_log_content(log_file: str):
    """Retrieves the full content of a specific log file."""
    filepath = os.path.join(LOG_DIR, log_file)
    if not os.path.exists(filepath) or '..' in log_file:
        raise HTTPException(status_code=404, detail="Log file not found")
    with open(filepath, "r") as f:
        content = f.read()
    return Response(content, media_type="text/plain")

@app.get("/api/stream-log")
async def stream_log_endpoint(file: str):
    """Streams a log file in real-time using Server-Sent Events."""
    log_path = os.path.join(LOG_DIR, file)

    async def log_generator():
        if not os.path.exists(log_path) or '..' in file:
            yield f"data: Log file '{file}' not found.\n\n"
            return

        with open(log_path, "r") as f:
            # Stream existing content
            for line in f:
                yield f"data: {line.strip()}\n\n"
                await asyncio.sleep(0.01)
            
            # Poll for new content
            while True:
                line = f.readline()
                if not line:
                    await asyncio.sleep(0.5)
                    continue
                yield f"data: {line.strip()}\n\n"

    return StreamingResponse(log_generator(), media_type="text/event-stream")

@app.get("/api/health")
async def health_check(target: str = "google.co.id"):
    """Performs a basic network health check (ping and nslookup)."""
    try:
        ping_result = subprocess.run(['ping', '-c', '4', target], capture_output=True, text=True, timeout=10)
        resolve_result = subprocess.run(['nslookup', target], capture_output=True, text=True, timeout=10)
        return {
            "target": target,
            "ping_output": ping_result.stdout or ping_result.stderr,
            "dns_output": resolve_result.stdout or resolve_result.stderr
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
