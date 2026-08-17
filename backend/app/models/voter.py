"""Anonymous event attendees who receive a vote code."""

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Integer, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.vote_code import VoteCode


class Voter(Base):
    __tablename__ = "voters"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    voter_number: Mapped[int] = mapped_column(Integer, unique=True, index=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    vote_codes: Mapped[list["VoteCode"]] = relationship(back_populates="voter")

# The portable, concurrency-safe allocation of voter_number belongs in a later service.
