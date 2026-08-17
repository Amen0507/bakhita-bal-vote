"""Anonymous ballots.

Votes deliberately have no voter or vote-code foreign key.  A future voting
service must atomically consume the code and insert this independent ballot.
It must also validate the Roi/Reine candidate categories before insertion.
"""

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Uuid, String, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.enums import VoteCategory

if TYPE_CHECKING:
    from app.models.candidate import Candidate
    from app.models.duo import Duo


class Vote(Base):
    __tablename__ = "votes"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    voter_identifier: Mapped[str] = mapped_column(String, index=True, nullable=False)
    category: Mapped[VoteCategory] = mapped_column(
        Enum(VoteCategory, name="vote_category_enum", native_enum=False), nullable=False
    )
    candidate_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("candidates.id"), nullable=True)
    duo_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("duos.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    candidate: Mapped["Candidate"] = relationship("Candidate")
    duo: Mapped["Duo"] = relationship("Duo")
