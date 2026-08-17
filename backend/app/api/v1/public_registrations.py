"""Unauthenticated public registration routes."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.candidate import CandidateCreate, CandidateResponse
from app.schemas.duo import DuoCreate, DuoResponse
from app.schemas.system_settings import SystemSettingsResponse
from app.services.candidate_service import create_public_candidate
from app.services.duo_service import create_public_duo
from app.services.settings_service import get_settings

router = APIRouter()


@router.get("/settings", response_model=SystemSettingsResponse)
def read_public_settings(db: Annotated[Session, Depends(get_db)]) -> SystemSettingsResponse:
    """Expose registration state for public frontend views."""

    settings = get_settings(db)
    if settings is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La configuration du système est introuvable.",
        )
    return settings


@router.post("/candidates", response_model=CandidateResponse, status_code=status.HTTP_201_CREATED)
def register_candidate(
    candidate_in: CandidateCreate, db: Annotated[Session, Depends(get_db)]
) -> CandidateResponse:
    """Submit a public Roi or Reine application."""

    return create_public_candidate(db, candidate_in)


@router.get("/candidates", response_model=list[CandidateResponse])
def list_public_candidates(db: Annotated[Session, Depends(get_db)]) -> list[CandidateResponse]:
    """List public candidates (Roi/Reine)."""
    
    from app.services.candidate_service import get_candidates
    return get_candidates(db)


@router.post("/duos", response_model=DuoResponse, status_code=status.HTTP_201_CREATED)
def register_duo(duo_in: DuoCreate, db: Annotated[Session, Depends(get_db)]) -> DuoResponse:
    """Submit a public duo application."""

    return create_public_duo(db, duo_in)


@router.get("/duos", response_model=list[DuoResponse])
def list_public_duos(db: Annotated[Session, Depends(get_db)]) -> list[DuoResponse]:
    """List public duos."""
    
    from app.services.duo_service import get_duos
    return get_duos(db)
