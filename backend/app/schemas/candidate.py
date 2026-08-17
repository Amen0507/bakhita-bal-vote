"""Pydantic schemas for Roi and Reine candidates."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.enums import CandidateCategory


class CandidateCreate(BaseModel):
    category: CandidateCategory
    first_name: str
    last_name: str
    photo_url: str | None = None


class CandidateUpdate(BaseModel):
    category: CandidateCategory | None = None
    first_name: str | None = None
    last_name: str | None = None
    photo_url: str | None = None


class CandidateResponse(CandidateCreate):
    id: uuid.UUID
    is_manual_entry: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
