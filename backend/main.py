from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import deploy, servers, logs, health

app = FastAPI(title="Trigger Deploy API", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(deploy.router, prefix="/api")
app.include_router(servers.router, prefix="/api")
app.include_router(logs.router, prefix="/api")
app.include_router(health.router, prefix="/api")