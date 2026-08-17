"""Administrator-only CRUD routes for Roi and Reine candidates."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.core.database import get_db
from app.models import CandidateCategory
from app.schemas.candidate import CandidateCreate, CandidateResponse, CandidateUpdate
from app.services.candidate_service import (
    create_candidate,
    delete_candidate,
    get_candidate,
    get_candidates,
    update_candidate,
)

router = APIRouter(dependencies=[Depends(get_current_admin)])


@router.get("/", response_model=list[CandidateResponse])
def list_candidates(
    db: Annotated[Session, Depends(get_db)], category: CandidateCategory | None = None
) -> list[CandidateResponse]:
    """List candidates, optionally filtered by Roi or Reine."""

    return get_candidates(db, category)


@router.post("/", response_model=CandidateResponse, status_code=status.HTTP_201_CREATED)
def add_candidate(
    candidate_in: CandidateCreate, db: Annotated[Session, Depends(get_db)]
) -> CandidateResponse:
    """Create a manual candidate entry regardless of public registration limits."""

    return create_candidate(db, candidate_in, is_manual_entry=True)


@router.get("/{candidate_id}", response_model=CandidateResponse)
def read_candidate(candidate_id: uuid.UUID, db: Annotated[Session, Depends(get_db)]) -> CandidateResponse:
    """Return one candidate."""

    candidate = get_candidate(db, candidate_id)
    if candidate is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found")
    return candidate


@router.patch("/{candidate_id}", response_model=CandidateResponse)
def patch_candidate(
    candidate_id: uuid.UUID,
    candidate_in: CandidateUpdate,
    db: Annotated[Session, Depends(get_db)],
) -> CandidateResponse:
    """Partially update one candidate."""

    candidate = get_candidate(db, candidate_id)
    if candidate is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found")
    return update_candidate(db, candidate, candidate_in)


@router.delete("/{candidate_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_candidate(candidate_id: uuid.UUID, db: Annotated[Session, Depends(get_db)]) -> Response:
    """Delete one candidate."""

    candidate = get_candidate(db, candidate_id)
    if candidate is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found")
    delete_candidate(db, candidate)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
