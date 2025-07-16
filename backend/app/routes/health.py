from fastapi import APIRouter, HTTPException
import subprocess

router = APIRouter()

@router.get("/health")
async def health(target: str = "google.co.id"):
    try:
        ping = subprocess.run(["ping", "-c", "2", target], capture_output=True, text=True)
        ns = subprocess.run(["nslookup", target], capture_output=True, text=True)
        return {"ping_output": ping.stdout, "dns_output": ns.stdout}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))