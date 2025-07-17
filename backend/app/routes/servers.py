from fastapi import APIRouter, HTTPException
import json
from app.core.config import SERVERS_FILE
from app.models.deploy import Server

router = APIRouter()

@router.get("/servers", response_model=list[Server])
async def get_servers():
    try:
        with open(SERVERS_FILE, "r") as f:
            servers = json.load(f)
        return [Server(**s) for s in servers.get("servers", [])]
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="servers.json not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
