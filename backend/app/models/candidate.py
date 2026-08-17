"""Candidates for Roi and Reine elections."""

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, Enum, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.enums import CandidateCategory

if TYPE_CHECKING:
    from app.models.vote import Vote


class Candidate(Base):
    __tablename__ = "candidates"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category: Mapped[CandidateCategory] = mapped_column(
        Enum(CandidateCategory, name="candidate_category", native_enum=False), nullable=False
    )
    first_name: Mapped[str] = mapped_column(String, nullable=False)
    last_name: Mapped[str] = mapped_column(String, nullable=False)
    photo_url: Mapped[str | None] = mapped_column(String, nullable=True)
    is_manual_entry: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    votes: Mapped[list["Vote"]] = relationship(back_populates="candidate")
