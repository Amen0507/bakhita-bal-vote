"""Align the votes table with the detached ballot model.

Revision ID: 0003_align_votes_schema
Revises: 0002_voter_number_sequence
"""

from collections.abc import Sequence
from datetime import datetime, timezone
import uuid

from alembic import op
import sqlalchemy as sa


revision: str = "0003_align_votes_schema"
down_revision: str | Sequence[str] | None = "0002_voter_number_sequence"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    bind = op.get_bind()
    vote_columns = {column["name"] for column in sa.inspect(bind).get_columns("votes")}
    if "candidate_id" in vote_columns:
        return

    legacy_votes = bind.execute(
        sa.text("SELECT roi_candidate_id, reine_candidate_id, duo_id, created_at FROM votes")
    ).mappings().all()
    op.rename_table("votes", "votes_legacy")
    votes = op.create_table(
        "votes",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("voter_identifier", sa.String(), nullable=False),
        sa.Column("category", sa.Enum("ROI", "REINE", "DUO", name="vote_category_enum", native_enum=False), nullable=False),
        sa.Column("candidate_id", sa.Uuid(), nullable=True),
        sa.Column("duo_id", sa.Uuid(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["candidate_id"], ["candidates.id"]),
        sa.ForeignKeyConstraint(["duo_id"], ["duos.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    for legacy_vote in legacy_votes:
        created_at = legacy_vote["created_at"] or datetime.now(timezone.utc)
        identifier = uuid.uuid4().hex
        bind.execute(votes.insert(), [
            {
                "id": uuid.uuid4(),
                "voter_identifier": identifier,
                "category": "ROI",
                "candidate_id": legacy_vote["roi_candidate_id"],
                "duo_id": None,
                "created_at": created_at,
            },
            {
                "id": uuid.uuid4(),
                "voter_identifier": identifier,
                "category": "REINE",
                "candidate_id": legacy_vote["reine_candidate_id"],
                "duo_id": None,
                "created_at": created_at,
            },
            {
                "id": uuid.uuid4(),
                "voter_identifier": identifier,
                "category": "DUO",
                "candidate_id": None,
                "duo_id": legacy_vote["duo_id"],
                "created_at": created_at,
            },
        ])

    op.drop_table("votes_legacy")


def downgrade() -> None:
    raise NotImplementedError("La migration des bulletins historiques ne peut pas être inversée sans perte de données.")
