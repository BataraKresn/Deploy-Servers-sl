from fastapi import APIRouter, HTTPException, Response
import os
from app.core.config import LOG_DIR

router = APIRouter()

@router.get("/logs")
async def list_logs():
    try:
        return sorted([f for f in os.listdir(LOG_DIR) if f.endswith(".log")], reverse=True)
    except:
        return []

@router.get("/logs/{log_file}")
async def get_log(log_file: str):
    path = os.path.join(LOG_DIR, log_file)
    if not os.path.exists(path) or ".." in log_file:
        raise HTTPException(status_code=404, detail="Log not found")
    with open(path) as f:
        return Response(f.read(), media_type="text/plain")
