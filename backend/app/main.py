from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.webhook.router import router as webhook_router
from app.api.report import router as report_router
from app.api.memory import router as memory_router
from app.api.analytics import router as analytics_router
from app.api.repos import router as repos_router

app = FastAPI(
    title="VaultCI",
    description="AI Trust Layer for Agentic Coding Pipelines",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for local dev + Vercel
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(webhook_router)
app.include_router(report_router)
app.include_router(memory_router)
app.include_router(analytics_router)
app.include_router(repos_router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "vaultci-backend", "version": "1.0.0"}
