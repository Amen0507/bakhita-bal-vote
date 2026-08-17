"""Administrator-only CRUD routes for elegant duos."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.core.database import get_db
from app.schemas.duo import DuoCreate, DuoResponse, DuoUpdate
from app.services.duo_service import create_duo, delete_duo, get_duo, get_duos, update_duo

router = APIRouter(dependencies=[Depends(get_current_admin)])


@router.get("/", response_model=list[DuoResponse])
def list_duos(db: Annotated[Session, Depends(get_db)]) -> list[DuoResponse]:
    """List every duo."""

    return get_duos(db)


@router.post("/", response_model=DuoResponse, status_code=status.HTTP_201_CREATED)
def add_duo(duo_in: DuoCreate, db: Annotated[Session, Depends(get_db)]) -> DuoResponse:
    """Create a manual duo entry regardless of public registration state."""

    return create_duo(db, duo_in, is_manual_entry=True)


@router.get("/{duo_id}", response_model=DuoResponse)
def read_duo(duo_id: uuid.UUID, db: Annotated[Session, Depends(get_db)]) -> DuoResponse:
    """Return one duo."""

    duo = get_duo(db, duo_id)
    if duo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Duo not found")
    return duo


@router.patch("/{duo_id}", response_model=DuoResponse)
def patch_duo(
    duo_id: uuid.UUID, duo_in: DuoUpdate, db: Annotated[Session, Depends(get_db)]
) -> DuoResponse:
    """Partially update one duo."""

    duo = get_duo(db, duo_id)
    if duo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Duo not found")
    return update_duo(db, duo, duo_in)


@router.delete("/{duo_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_duo(duo_id: uuid.UUID, db: Annotated[Session, Depends(get_db)]) -> Response:
    """Delete one duo."""

    duo = get_duo(db, duo_id)
    if duo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Duo not found")
    delete_duo(db, duo)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
