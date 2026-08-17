"""FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import fastapi
import app.api.deps

from app.api.v1.admin_candidates import router as admin_candidates_router
from app.api.v1.admin_duos import router as admin_duos_router
from app.api.v1.admin_settings import router as admin_settings_router
from app.api.v1.auth import router as auth_router
from app.api.v1.public_registrations import router as public_registrations_router
from app.api.v1.public_votes import router as public_votes_router
from app.api.v1.admin_votes import router as admin_votes_router
from app.api.v1.agent_vote_codes import router as agent_vote_codes_router
from app.core.config import settings

from contextlib import asynccontextmanager

from app.initial_data import initialize_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run startup tasks before serving requests."""
    initialize_data()
    yield


app = FastAPI(title=settings.project_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.backend_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(admin_settings_router, prefix="/api/v1/admin/settings", tags=["admin settings"])
app.include_router(admin_candidates_router, prefix="/api/v1/admin/candidates", tags=["admin candidates"])
app.include_router(admin_duos_router, prefix="/api/v1/admin/duos", tags=["admin duos"])
app.include_router(admin_votes_router, prefix="/api/v1/admin/votes", tags=["admin votes"])
app.include_router(agent_vote_codes_router, prefix="/api/v1/agent/vote-codes", tags=["agent vote codes"])
app.include_router(public_registrations_router, prefix="/api/v1/public", tags=["public registrations"])
app.include_router(public_votes_router, prefix="/api/v1/public/votes", tags=["public votes"])


@app.get("/")
def root() -> dict[str, str]:
    """Return a minimal confirmation that the API is reachable."""

    return {"message": "Bal Vote API is running"}


@app.get("/health")
def health() -> dict[str, str]:
    """Return the application health status."""

    return {"status": "ok"}

