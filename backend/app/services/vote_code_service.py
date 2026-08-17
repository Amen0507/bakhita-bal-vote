"""Secure issuance of one-time voting codes for event staff."""

import secrets

from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.models import VoteCode, VoteCodeStatus, Voter, VoterNumberSequence

CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


def issue_vote_code(db: Session) -> tuple[str, int]:
    """Create one anonymous voter and a unique six-character active code."""
    allocated = db.execute(
        update(VoterNumberSequence)
        .where(VoterNumberSequence.id == 1)
        .values(next_value=VoterNumberSequence.next_value + 1)
        .returning(VoterNumberSequence.next_value)
    ).scalar_one_or_none()
    if allocated is None:
        # First local run: initialize the singleton without relying on MAX().
        db.add(VoterNumberSequence(id=1, next_value=2))
        db.flush()
        voter_number = 1
    else:
        voter_number = allocated - 1
    voter = Voter(voter_number=voter_number)
    db.add(voter)
    db.flush()

    for _ in range(10):
        code = "".join(secrets.choice(CODE_ALPHABET) for _ in range(6))
        if db.scalar(select(VoteCode.id).where(VoteCode.code == code)) is None:
            db.add(VoteCode(code=code, voter_id=voter.id, status=VoteCodeStatus.ACTIVE))
            db.commit()
            return code, voter_number

    db.rollback()
    raise RuntimeError("Impossible de générer un code de vote unique.")
