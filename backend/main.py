from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.middleware import SlowAPIMiddleware
from app.routes import deploy, servers, logs, health, auth

import os

app = FastAPI(
    title="Trigger Deploy API",
    version="1.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)


# ✅ Init Rate Limiter
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)

# ✅ CORS settings (kalau frontend dan backend beda origin)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Register all routers
app.include_router(deploy.router, prefix="/api")
app.include_router(servers.router, prefix="/api")
app.include_router(logs.router, prefix="/api")
app.include_router(health.router, prefix="/api")
app.include_router(auth.router, prefix="/api")