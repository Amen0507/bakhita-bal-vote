"""Pydantic schemas for elegant-duo entries."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class DuoCreate(BaseModel):
    duo_name: str | None = None
    cavalier_first_name: str
    cavalier_last_name: str
    cavalier_photo_url: str | None = None
    cavaliere_first_name: str
    cavaliere_last_name: str
    cavaliere_photo_url: str | None = None


class DuoUpdate(BaseModel):
    duo_name: str | None = None
    cavalier_first_name: str | None = None
    cavalier_last_name: str | None = None
    cavalier_photo_url: str | None = None
    cavaliere_first_name: str | None = None
    cavaliere_last_name: str | None = None
    cavaliere_photo_url: str | None = None


class DuoResponse(DuoCreate):
    id: uuid.UUID
    is_manual_entry: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
