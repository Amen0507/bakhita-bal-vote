"""Unauthenticated public registration routes."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status, Form, File, UploadFile
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.storage import PhotoUploadError, upload_photo
from app.models.enums import CandidateCategory
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
    db: Annotated[Session, Depends(get_db)],
    request: Request,
    category: Annotated[CandidateCategory, Form()],
    first_name: Annotated[str, Form()],
    last_name: Annotated[str, Form()],
    photo: Annotated[UploadFile | None, File()] = None,
) -> CandidateResponse:
    """Submit a public Roi or Reine application."""

    photo_url = None
    if photo and photo.size and photo.size > 0:
        file_bytes = photo.file.read()
        try:
            photo_url = upload_photo(file_bytes, "bal_vote/candidates", str(request.base_url))
        except PhotoUploadError as error:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(error)) from error

    candidate_in = CandidateCreate(
        category=category,
        first_name=first_name,
        last_name=last_name,
        photo_url=photo_url
    )
    return create_public_candidate(db, candidate_in)


@router.get("/candidates", response_model=list[CandidateResponse])
def list_public_candidates(db: Annotated[Session, Depends(get_db)]) -> list[CandidateResponse]:
    """List public candidates (Roi/Reine)."""
    
    from app.services.candidate_service import get_candidates
    return get_candidates(db)


@router.post("/duos", response_model=DuoResponse, status_code=status.HTTP_201_CREATED)
def register_duo(
    db: Annotated[Session, Depends(get_db)],
    request: Request,
    cavalier_first_name: Annotated[str, Form()],
    cavalier_last_name: Annotated[str, Form()],
    cavaliere_first_name: Annotated[str, Form()],
    cavaliere_last_name: Annotated[str, Form()],
    duo_name: Annotated[str | None, Form()] = None,
    cavalier_photo: Annotated[UploadFile | None, File()] = None,
    cavaliere_photo: Annotated[UploadFile | None, File()] = None,
) -> DuoResponse:
    """Submit a public duo application."""

    cavalier_url = None
    if cavalier_photo and cavalier_photo.size and cavalier_photo.size > 0:
        file_bytes = cavalier_photo.file.read()
        try:
            cavalier_url = upload_photo(file_bytes, "bal_vote/duos/cavalier", str(request.base_url))
        except PhotoUploadError as error:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(error)) from error

    cavaliere_url = None
    if cavaliere_photo and cavaliere_photo.size and cavaliere_photo.size > 0:
        file_bytes = cavaliere_photo.file.read()
        try:
            cavaliere_url = upload_photo(file_bytes, "bal_vote/duos/cavaliere", str(request.base_url))
        except PhotoUploadError as error:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(error)) from error

    duo_in = DuoCreate(
        duo_name=duo_name,
        cavalier_first_name=cavalier_first_name,
        cavalier_last_name=cavalier_last_name,
        cavalier_photo_url=cavalier_url,
        cavaliere_first_name=cavaliere_first_name,
        cavaliere_last_name=cavaliere_last_name,
        cavaliere_photo_url=cavaliere_url
    )
    return create_public_duo(db, duo_in)


@router.get("/duos", response_model=list[DuoResponse])
def list_public_duos(db: Annotated[Session, Depends(get_db)]) -> list[DuoResponse]:
    """List public duos."""
    
    from app.services.duo_service import get_duos
    return get_duos(db)
