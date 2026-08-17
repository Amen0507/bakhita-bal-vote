"""Anonymous three-category ballot handling backed by one-time vote codes."""

import secrets
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import func, select, update
from sqlalchemy.orm import Session

from app.models import Candidate, CandidateCategory, Duo, SystemSettings, Vote, VoteCode, VoteCodeStatus
from app.models.enums import VoteCategory
from app.schemas.vote import BallotCreate


def _active_code_or_error(db: Session, raw_code: str) -> VoteCode:
    code = raw_code.strip().upper()
    vote_code = db.scalar(select(VoteCode).where(VoteCode.code == code))
    if vote_code is None or vote_code.status != VoteCodeStatus.ACTIVE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ce code de vote est invalide ou a déjà été utilisé.")
    return vote_code


def verify_vote_code(db: Session, raw_code: str) -> None:
    settings = db.get(SystemSettings, 1)
    if settings is None or settings.voting_status.value != "OPEN":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Les votes sont actuellement fermés.")
    _active_code_or_error(db, raw_code)


def _validate_selection(db: Session, ballot: BallotCreate) -> None:
    roi = db.get(Candidate, ballot.roi_candidate_id)
    reine = db.get(Candidate, ballot.reine_candidate_id)
    duo = db.get(Duo, ballot.duo_id)
    if roi is None or roi.category != CandidateCategory.ROI:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Le candidat Roi sélectionné est invalide.")
    if reine is None or reine.category != CandidateCategory.REINE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La candidate Reine sélectionnée est invalide.")
    if duo is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Le Duo sélectionné est invalide.")


def submit_ballot(db: Session, ballot: BallotCreate) -> None:
    """Consume a valid code and save the three detached ballots atomically."""
    verify_vote_code(db, ballot.code)
    _validate_selection(db, ballot)
    vote_code = _active_code_or_error(db, ballot.code)
    consumed = db.execute(
        update(VoteCode)
        .where(VoteCode.id == vote_code.id, VoteCode.status == VoteCodeStatus.ACTIVE)
        .values(status=VoteCodeStatus.USED, used_at=datetime.now(timezone.utc))
    )
    if consumed.rowcount != 1:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ce code de vote a déjà été utilisé.")

    # Server-generated opaque values have no relation to the code or voter.
    db.add_all([
        Vote(voter_identifier=secrets.token_urlsafe(24), category=VoteCategory.ROI, candidate_id=ballot.roi_candidate_id),
        Vote(voter_identifier=secrets.token_urlsafe(24), category=VoteCategory.REINE, candidate_id=ballot.reine_candidate_id),
        Vote(voter_identifier=secrets.token_urlsafe(24), category=VoteCategory.DUO, duo_id=ballot.duo_id),
    ])
    db.commit()


def get_vote_results(db: Session):
    def count_votes(category: VoteCategory, field):
        return db.query(field, func.count(Vote.id).label("votes")).filter(Vote.category == category).group_by(field).all()

    roi_results = count_votes(VoteCategory.ROI, Vote.candidate_id)
    reine_results = count_votes(VoteCategory.REINE, Vote.candidate_id)
    duo_results = count_votes(VoteCategory.DUO, Vote.duo_id)
    return {
        "roi": [{"candidate_id": row.candidate_id, "votes": row.votes} for row in roi_results],
        "reine": [{"candidate_id": row.candidate_id, "votes": row.votes} for row in reine_results],
        "duo": [{"duo_id": row.duo_id, "votes": row.votes} for row in duo_results],
    }


def get_public_vote_results(db: Session):
    settings = db.get(SystemSettings, 1)
    if settings is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Configuration du système introuvable.")
    if not settings.results_published:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Les résultats ne sont pas encore publiés.")
    results = get_vote_results(db)
    for category in results.values():
        category.sort(key=lambda item: item["votes"], reverse=True)
    return results
