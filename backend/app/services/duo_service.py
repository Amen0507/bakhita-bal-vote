"""Persistence operations for elegant-duo entries."""

import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Duo
from app.schemas.duo import DuoCreate, DuoUpdate
from app.services.settings_service import get_settings


def get_duos(db: Session) -> list[Duo]:
    """List all duos in creation order."""

    return list(db.scalars(select(Duo).order_by(Duo.created_at)))


def get_duo(db: Session, duo_id: uuid.UUID) -> Duo | None:
    """Find a duo by identifier."""

    return db.get(Duo, duo_id)


def create_duo(db: Session, duo_in: DuoCreate, is_manual_entry: bool = True) -> Duo:
    """Create a duo, with explicit provenance for future public flows."""

    duo = Duo(**duo_in.model_dump(), is_manual_entry=is_manual_entry)
    db.add(duo)
    db.commit()
    db.refresh(duo)
    return duo


def create_public_duo(db: Session, duo_in: DuoCreate) -> Duo:
    """Validate the public duo-registration state and create a public entry."""

    settings = get_settings(db)
    if settings is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La configuration du système est introuvable.",
        )
    if not settings.duo_inscriptions_open:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Les inscriptions pour les Duos sont fermées.",
        )
    return create_duo(db, duo_in, is_manual_entry=False)


def update_duo(db: Session, duo: Duo, duo_in: DuoUpdate) -> Duo:
    """Partially update an existing duo."""

    for field, value in duo_in.model_dump(exclude_unset=True).items():
        setattr(duo, field, value)
    db.commit()
    db.refresh(duo)
    return duo


def delete_duo(db: Session, duo: Duo) -> None:
    """Delete an existing duo."""

    db.delete(duo)
    db.commit()
