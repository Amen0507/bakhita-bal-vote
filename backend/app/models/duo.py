"""Pairs competing for the most elegant duo election."""

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.vote import Vote


class Duo(Base):
    __tablename__ = "duos"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    duo_name: Mapped[str | None] = mapped_column(String, nullable=True)
    cavalier_first_name: Mapped[str] = mapped_column(String, nullable=False)
    cavalier_last_name: Mapped[str] = mapped_column(String, nullable=False)
    cavalier_photo_url: Mapped[str | None] = mapped_column(String, nullable=True)
    cavaliere_first_name: Mapped[str] = mapped_column(String, nullable=False)
    cavaliere_last_name: Mapped[str] = mapped_column(String, nullable=False)
    cavaliere_photo_url: Mapped[str | None] = mapped_column(String, nullable=True)
    is_manual_entry: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    votes: Mapped[list["Vote"]] = relationship(back_populates="duo")
