"""Pydantic schemas for global event settings."""

from pydantic import BaseModel, ConfigDict

from app.models.enums import VotingStatus


class SystemSettingsUpdate(BaseModel):
    roi_limit: int | None = None
    reine_limit: int | None = None
    roi_inscriptions_open: bool | None = None
    reine_inscriptions_open: bool | None = None
    duo_inscriptions_open: bool | None = None
    voting_status: VotingStatus | None = None
    results_published: bool | None = None


class SystemSettingsResponse(BaseModel):
    id: int
    roi_limit: int
    reine_limit: int
    roi_inscriptions_open: bool
    reine_inscriptions_open: bool
    duo_inscriptions_open: bool
    voting_status: VotingStatus
    results_published: bool

    model_config = ConfigDict(from_attributes=True)
