"""Global configuration for one bal event."""

from sqlalchemy import Boolean, Enum, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base
from app.models.enums import VotingStatus


class SystemSettings(Base):
    """Singleton-oriented settings row; services must consistently use id=1."""

    __tablename__ = "system_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    roi_limit: Mapped[int] = mapped_column(Integer, default=10, nullable=False)
    reine_limit: Mapped[int] = mapped_column(Integer, default=10, nullable=False)
    roi_inscriptions_open: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    reine_inscriptions_open: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    duo_inscriptions_open: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    voting_status: Mapped[VotingStatus] = mapped_column(
        Enum(VotingStatus, name="voting_status", native_enum=False), default=VotingStatus.CLOSED, nullable=False
    )
    results_published: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
