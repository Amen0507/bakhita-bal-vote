"""Database operations for administrative users."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password
from app.models import User
from app.schemas.user import UserCreate


def get_user_by_username(db: Session, username: str) -> User | None:
    """Return the user matching ``username``, if it exists."""

    return db.scalar(select(User).where(User.username == username))


def authenticate_user(db: Session, username: str, password: str) -> User | None:
    """Authenticate a user without exposing why credentials are invalid."""

    user = get_user_by_username(db, username)
    if user is None or not verify_password(password, user.password_hash):
        return None
    return user


def create_user(db: Session, user_in: UserCreate) -> User:
    """Persist a user after hashing the supplied password."""

    user = User(
        username=user_in.username,
        password_hash=get_password_hash(user_in.password),
        role=user_in.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
