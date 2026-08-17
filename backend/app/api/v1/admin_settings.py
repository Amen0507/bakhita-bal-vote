"""Administrator-only routes for the global event settings."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.core.database import get_db
from app.schemas.system_settings import SystemSettingsResponse, SystemSettingsUpdate
from app.services.settings_service import get_settings, update_settings

router = APIRouter(dependencies=[Depends(get_current_admin)])


@router.get("/", response_model=SystemSettingsResponse)
def read_settings(db: Annotated[Session, Depends(get_db)]) -> SystemSettingsResponse:
    """Return the global settings singleton."""

    settings = get_settings(db)
    if settings is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="System settings not initialized")
    return settings


@router.patch("/", response_model=SystemSettingsResponse)
def patch_settings(
    settings_in: SystemSettingsUpdate, db: Annotated[Session, Depends(get_db)]
) -> SystemSettingsResponse:
    """Partially update global event settings."""

    settings = update_settings(db, settings_in)
    if settings is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="System settings not initialized")
    return settings
