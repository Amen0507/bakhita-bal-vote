"""Idempotent initialization of the first administrator and system settings."""

import logging
import secrets

from sqlalchemy import select

from app.core.config import settings
from app.core.database import SessionLocal, engine
from app.core.security import get_password_hash
from app.models import SystemSettings, User, UserRole, VoterNumberSequence

logger = logging.getLogger(__name__)


def initialize_data() -> None:
    """Create required singleton data without modifying existing records."""

    VoterNumberSequence.__table__.create(bind=engine, checkfirst=True)

    with SessionLocal() as db:
        admin = db.scalar(select(User).where(User.role == UserRole.ADMIN))
        if admin is None:
            username_in_use = db.scalar(select(User).where(User.username == settings.first_superuser))
            if username_in_use is not None:
                raise RuntimeError(
                    "Cannot initialize the administrator: FIRST_SUPERUSER is already assigned to another user."
                )
            generated_password = settings.first_superuser_password is None
            password = settings.first_superuser_password or secrets.token_urlsafe(24)
            db.add(
                User(
                    username=settings.first_superuser,
                    password_hash=get_password_hash(password),
                    role=UserRole.ADMIN,
                )
            )
            if generated_password:
                logger.warning(
                    "Created administrator '%s' with generated password: %s",
                    settings.first_superuser,
                    password,
                )

        if db.get(SystemSettings, 1) is None:
            db.add(SystemSettings(id=1))

        if db.get(VoterNumberSequence, 1) is None:
            db.add(VoterNumberSequence(id=1, next_value=1))

        db.commit()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    initialize_data()
