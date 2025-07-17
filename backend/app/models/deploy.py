# File: backend/app/models/deploy.py
from pydantic import BaseModel
from typing import Optional

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
