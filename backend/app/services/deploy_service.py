# File: backend/app/services/deploy_service.py
import os, time, subprocess, uuid, stat, json
from datetime import datetime
from fastapi import HTTPException
from app.core.config import LOG_DIR, SERVERS_FILE, TMP_DIR, TOKEN
from app.models.deploy import DeployRequest

os.makedirs(LOG_DIR, exist_ok=True)
os.makedirs(TMP_DIR, exist_ok=True)

def clean_old_logs(days: int = 7):
    now = time.time()
    cutoff = now - (days * 86400)
    for f in os.listdir(LOG_DIR):
        p = os.path.join(LOG_DIR, f)
        if os.path.isfile(p) and os.path.getmtime(p) < cutoff:
            os.remove(p)

async def trigger_deploy(payload: DeployRequest):
    if payload.token != TOKEN:
        raise HTTPException(status_code=401, detail="Invalid or missing token")

    clean_old_logs()

    try:
        with open(SERVERS_FILE, "r") as f:
            servers = json.load(f).get("servers", [])
            server = next((s for s in servers if s["id"] == payload.serverId), None)
        if not server:
            raise HTTPException(status_code=404, detail="Server not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading server data: {e}")

    log_file = f"deploy-{payload.serverId}-{datetime.now().strftime('%Y%m%d-%H%M%S')}.log"
    log_path = os.path.join(LOG_DIR, log_file)

    # Hybrid logic: use payload key if provided, else fallback to default
    key_file = "/root/.ssh/id_rsa"
    temp_key_created = False

    if payload.privateKey:
        key_file = os.path.join(TMP_DIR, f"ssh_key_{uuid.uuid4()}")
        with open(key_file, "w") as f:
            f.write(payload.privateKey)
        os.chmod(key_file, stat.S_IRUSR | stat.S_IWUSR)
        temp_key_created = True

    try:
        subprocess.Popen([
            "/app/deploy.sh",
            server['user'], server['ip'], server['path'], server['name'], key_file
        ], stdout=open(log_path, "w"), stderr=subprocess.STDOUT, close_fds=True)
        return {"message": "Deployment triggered", "log_file": log_file}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Deploy failed: {e}")
    finally:
        if temp_key_created and os.path.exists(key_file):
            os.remove(key_file)
