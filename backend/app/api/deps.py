"""Reusable FastAPI dependencies for authenticated routes."""

import uuid
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import ALGORITHM
from app.models import User, UserRole
from app.schemas.token import TokenPayload

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login/access-token")

credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


def get_current_user(
    db: Annotated[Session, Depends(get_db)], token: Annotated[str, Depends(oauth2_scheme)]
) -> User:
    """Decode a bearer token and load its user from the database."""

    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        token_data = TokenPayload.model_validate(payload)
        user_id = uuid.UUID(token_data.sub)
    except (JWTError, ValidationError, ValueError):
        raise credentials_exception from None

    user = db.get(User, user_id)
    if user is None:
        raise credentials_exception
    return user


def get_current_admin(current_user: Annotated[User, Depends(get_current_user)]) -> User:
    """Require the current database user to have the ADMIN role."""

    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Administrator access required")
    return current_user


def get_current_agent_or_admin(current_user: Annotated[User, Depends(get_current_user)]) -> User:
    """Allow event staff to issue voting codes without granting admin powers."""

    if current_user.role not in {UserRole.ADMIN, UserRole.AGENT_ACCUEIL}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Agent access required")
    return current_user
