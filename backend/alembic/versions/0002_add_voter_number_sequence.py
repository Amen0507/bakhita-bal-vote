"""add voter number sequence

Revision ID: 0002_voter_number_sequence
Revises: 0001_initial_schema
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "0002_voter_number_sequence"
down_revision: str | Sequence[str] | None = "0001_initial_schema"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "voter_number_sequence",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("next_value", sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.execute("INSERT INTO voter_number_sequence (id, next_value) VALUES (1, 1)")


def downgrade() -> None:
    op.drop_table("voter_number_sequence")
