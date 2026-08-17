"""Pydantic schemas for administrative users."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.enums import UserRole


class UserBase(BaseModel):
    username: str
    role: UserRole


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
