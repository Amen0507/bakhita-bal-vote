"""create initial schema

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-08-16
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "0001_initial_schema"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Create the schema defined by the stage-1 SQLAlchemy models."""

    op.create_table(
        "users",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("username", sa.String(), nullable=False),
        sa.Column("password_hash", sa.String(), nullable=False),
        sa.Column("role", sa.Enum("ADMIN", "AGENT_ACCUEIL", name="user_role", native_enum=False), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_username"), "users", ["username"], unique=True)

    op.create_table(
        "voters",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("voter_number", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_voters_voter_number"), "voters", ["voter_number"], unique=True)

    op.create_table(
        "candidates",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("category", sa.Enum("ROI", "REINE", name="candidate_category", native_enum=False), nullable=False),
        sa.Column("first_name", sa.String(), nullable=False),
        sa.Column("last_name", sa.String(), nullable=False),
        sa.Column("photo_url", sa.String(), nullable=True),
        sa.Column("is_manual_entry", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "duos",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("duo_name", sa.String(), nullable=True),
        sa.Column("cavalier_first_name", sa.String(), nullable=False),
        sa.Column("cavalier_last_name", sa.String(), nullable=False),
        sa.Column("cavalier_photo_url", sa.String(), nullable=True),
        sa.Column("cavaliere_first_name", sa.String(), nullable=False),
        sa.Column("cavaliere_last_name", sa.String(), nullable=False),
        sa.Column("cavaliere_photo_url", sa.String(), nullable=True),
        sa.Column("is_manual_entry", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "vote_codes",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("code", sa.String(length=6), nullable=False),
        sa.Column("voter_id", sa.Uuid(), nullable=False),
        sa.Column("status", sa.Enum("ACTIVE", "USED", "REVOKED", name="vote_code_status", native_enum=False), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["voter_id"], ["voters.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_vote_codes_code"), "vote_codes", ["code"], unique=True)

    op.create_table(
        "votes",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("roi_candidate_id", sa.Uuid(), nullable=False),
        sa.Column("reine_candidate_id", sa.Uuid(), nullable=False),
        sa.Column("duo_id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["duo_id"], ["duos.id"]),
        sa.ForeignKeyConstraint(["reine_candidate_id"], ["candidates.id"]),
        sa.ForeignKeyConstraint(["roi_candidate_id"], ["candidates.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "system_settings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("roi_limit", sa.Integer(), nullable=False),
        sa.Column("reine_limit", sa.Integer(), nullable=False),
        sa.Column("roi_inscriptions_open", sa.Boolean(), nullable=False),
        sa.Column("reine_inscriptions_open", sa.Boolean(), nullable=False),
        sa.Column("duo_inscriptions_open", sa.Boolean(), nullable=False),
        sa.Column("voting_status", sa.Enum("CLOSED", "OPEN", name="voting_status", native_enum=False), nullable=False),
        sa.Column("results_published", sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    """Drop tables in reverse dependency order."""

    op.drop_table("system_settings")
    op.drop_table("votes")
    op.drop_index(op.f("ix_vote_codes_code"), table_name="vote_codes")
    op.drop_table("vote_codes")
    op.drop_table("duos")
    op.drop_table("candidates")
    op.drop_index(op.f("ix_voters_voter_number"), table_name="voters")
    op.drop_table("voters")
    op.drop_index(op.f("ix_users_username"), table_name="users")
    op.drop_table("users")
