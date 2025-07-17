from fastapi import APIRouter, HTTPException
import subprocess

router = APIRouter()

@router.get("/health")
async def health(target: str = "google.co.id"):
    try:
        ping = subprocess.run(["ping", "-c", "2", target], capture_output=True, text=True)
        ns = subprocess.run(["nslookup", target], capture_output=True, text=True)
        if ping.returncode != 0:
            raise HTTPException(status_code=400, detail=f"Ping failed:\n{ping.stderr.strip()}")

        return {
            "ping_output": ping.stdout.strip(),
            "dns_output": ns.stdout.strip()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
