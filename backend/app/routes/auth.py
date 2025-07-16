from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
import os

from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.decorator import limit
from slowapi.extension import Limiter as LimiterDecorator

from app.main import limiter

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


class PasswordPayload(BaseModel):
    password: str


@router.post("/validate-password")
@limiter.limit("5/minute")
async def validate_password(payload: PasswordPayload, request: Request):
    expected_password = os.getenv("DEPLOY_PASSWORD", "SAT2025")
    if payload.password == expected_password:
        return {"valid": True}
    raise HTTPException(status_code=401, detail="Invalid password")
