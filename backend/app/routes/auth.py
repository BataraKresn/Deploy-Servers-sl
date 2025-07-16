from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from slowapi.errors import RateLimitExceeded
from slowapi.extension import Limiter
from slowapi.util import get_remote_address
from app.main import limiter  # Import limiter dari main.py
import os

router = APIRouter()

class PasswordPayload(BaseModel):
    password: str

@router.post("/validate-password")
@limiter.limit("5/minute")  # Gunakan dekorator 'limit' dari slowapi
async def validate_password(payload: PasswordPayload, request: Request):
    expected_password = os.getenv("DEPLOY_PASSWORD", "SAT2025")
    if payload.password == expected_password:
        return {"valid": True}
    raise HTTPException(status_code=401, detail="Invalid password")
