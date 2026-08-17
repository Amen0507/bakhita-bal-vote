from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.vote import BallotCreate, BallotResponse, VoteCodeVerification
from app.services.vote_service import get_public_vote_results, submit_ballot, verify_vote_code

router = APIRouter()

@router.get("/results")
def read_public_results(db: Session = Depends(get_db)):
    """
    Get the public vote results if published.
    """
    return get_public_vote_results(db=db)

@router.post("/verify-code", status_code=status.HTTP_204_NO_CONTENT)
def validate_vote_code(code_in: VoteCodeVerification, db: Session = Depends(get_db)):
    """Check that a code can be used, without consuming it."""
    verify_vote_code(db, code_in.code)


@router.post("/", response_model=BallotResponse, status_code=status.HTTP_201_CREATED)
def submit_vote(ballot_in: BallotCreate, db: Session = Depends(get_db)) -> BallotResponse:
    """Submit one complete Roi, Reine and Duo ballot using one code."""
    submit_ballot(db=db, ballot=ballot_in)
    return BallotResponse(message="Votre bulletin a été enregistré avec succès.")
