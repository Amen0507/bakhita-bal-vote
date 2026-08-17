from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin, get_db
from app.services.vote_service import get_vote_results
from app.models.user import User

router = APIRouter()

@router.get("/results")
def read_vote_results(db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    """
    Get the current vote results.
    """
    return get_vote_results(db=db)
