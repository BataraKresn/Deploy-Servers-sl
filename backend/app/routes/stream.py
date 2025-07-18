from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import StreamingResponse
import os
import time
from app.core.config import LOG_DIR

router = APIRouter()

@router.get("/stream-log")
async def stream_log(request: Request, file: str):
    path = os.path.join(LOG_DIR, file)
    if not os.path.exists(path) or ".." in file:
        raise HTTPException(status_code=404, detail="Log not found")

    def log_streamer():
        with open(path, "r") as f:
            f.seek(0, os.SEEK_END)  # Start at end of file
            while True:
                line = f.readline()
                if line:
                    yield f"data: {line.strip()}\n\n"
                else:
                    time.sleep(0.5)
                if request.is_disconnected():
                    break
    return StreamingResponse(log_streamer(), media_type="text/event-stream")
