"""Persistence operations for the global settings singleton."""

from sqlalchemy.orm import Session

from app.models import SystemSettings
from app.schemas.system_settings import SystemSettingsUpdate


def get_settings(db: Session) -> SystemSettings | None:
    """Return the singleton settings row, if it has been initialized."""

    return db.get(SystemSettings, 1)


def update_settings(db: Session, settings_in: SystemSettingsUpdate) -> SystemSettings | None:
    """Partially update the singleton settings row."""

    settings = get_settings(db)
    if settings is None:
        return None

    for field, value in settings_in.model_dump(exclude_unset=True).items():
        setattr(settings, field, value)
    db.commit()
    db.refresh(settings)
    return settings
