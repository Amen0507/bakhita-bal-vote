"""Reusable domain enumerations persisted by the SQLAlchemy models."""

from enum import Enum


class UserRole(str, Enum):
    ADMIN = "ADMIN"
    AGENT_ACCUEIL = "AGENT_ACCUEIL"


class VoteCodeStatus(str, Enum):
    ACTIVE = "ACTIVE"
    USED = "USED"
    REVOKED = "REVOKED"


class CandidateCategory(str, Enum):
    ROI = "ROI"
    REINE = "REINE"


class VotingStatus(str, Enum):
    CLOSED = "CLOSED"
    OPEN = "OPEN"


class VoteCategory(str, Enum):
    ROI = "ROI"
    REINE = "REINE"
    DUO = "DUO"
