"""Persistence operations for Roi and Reine candidates."""

import uuid

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Candidate, CandidateCategory
from app.schemas.candidate import CandidateCreate, CandidateUpdate
from app.services.settings_service import get_settings


def get_candidates(db: Session, category: CandidateCategory | None = None) -> list[Candidate]:
    """List candidates, optionally restricted to a category."""

    statement = select(Candidate).order_by(Candidate.created_at)
    if category is not None:
        statement = statement.where(Candidate.category == category)
    return list(db.scalars(statement))


def get_candidate(db: Session, candidate_id: uuid.UUID) -> Candidate | None:
    """Find a candidate by identifier."""

    return db.get(Candidate, candidate_id)


def create_candidate(
    db: Session, candidate_in: CandidateCreate, is_manual_entry: bool = True
) -> Candidate:
    """Create a candidate, with explicit provenance for future public flows."""

    candidate = Candidate(**candidate_in.model_dump(), is_manual_entry=is_manual_entry)
    db.add(candidate)
    db.commit()
    db.refresh(candidate)
    return candidate


def create_public_candidate(db: Session, candidate_in: CandidateCreate) -> Candidate:
    """Validate and create a public candidate without counting manual entries."""

    settings = get_settings(db)
    if settings is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La configuration du système est introuvable.",
        )

    if candidate_in.category == CandidateCategory.ROI:
        inscriptions_open = settings.roi_inscriptions_open
        limit = settings.roi_limit
        closed_message = "Les inscriptions pour la catégorie Roi sont fermées."
        limit_message = "La limite de candidats pour la catégorie Roi est atteinte."
    else:
        inscriptions_open = settings.reine_inscriptions_open
        limit = settings.reine_limit
        closed_message = "Les inscriptions pour la catégorie Reine sont fermées."
        limit_message = "La limite de candidates pour la catégorie Reine est atteinte."

    if not inscriptions_open:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=closed_message)

    public_candidate_count = db.scalar(
        select(func.count(Candidate.id)).where(
            Candidate.category == candidate_in.category,
            Candidate.is_manual_entry.is_(False),
        )
    )
    if public_candidate_count >= limit:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=limit_message)

    return create_candidate(db, candidate_in, is_manual_entry=False)


def update_candidate(
    db: Session, candidate: Candidate, candidate_in: CandidateUpdate
) -> Candidate:
    """Partially update an existing candidate."""

    for field, value in candidate_in.model_dump(exclude_unset=True).items():
        setattr(candidate, field, value)
    db.commit()
    db.refresh(candidate)
    return candidate


def delete_candidate(db: Session, candidate: Candidate) -> None:
    """Delete an existing candidate."""

    db.delete(candidate)
    db.commit()
