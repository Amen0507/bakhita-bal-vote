"""One-time voting codes, linked to voters but never to ballots."""

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.enums import VoteCodeStatus

if TYPE_CHECKING:
    from app.models.voter import Voter


class VoteCode(Base):
    __tablename__ = "vote_codes"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code: Mapped[str] = mapped_column(String(6), unique=True, index=True, nullable=False)
    voter_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("voters.id"), nullable=False)
    status: Mapped[VoteCodeStatus] = mapped_column(
        Enum(VoteCodeStatus, name="vote_code_status", native_enum=False), default=VoteCodeStatus.ACTIVE, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    voter: Mapped["Voter"] = relationship(back_populates="vote_codes")
