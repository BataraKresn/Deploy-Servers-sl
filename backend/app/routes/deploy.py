# File: backend/app/routes/deploy.py
from fastapi import APIRouter
from app.models.deploy import DeployRequest
from app.services.deploy_service import trigger_deploy

router = APIRouter()

@router.post("/deploy", status_code=202)
async def deploy(payload: DeployRequest):
    return await trigger_deploy(payload)
