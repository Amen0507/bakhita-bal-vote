"""Portable counter used to allocate anonymous voter numbers."""

from sqlalchemy import Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class VoterNumberSequence(Base):
    """Singleton counter; the next voter number is allocated atomically."""

    __tablename__ = "voter_number_sequence"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    next_value: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
