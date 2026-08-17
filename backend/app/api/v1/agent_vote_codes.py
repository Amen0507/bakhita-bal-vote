"""Voting-code issuance for reception agents and administrators."""

from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_agent_or_admin
from app.core.database import get_db
from app.models import User
from app.schemas.vote import VoteCodeIssueResponse
from app.services.vote_code_service import issue_vote_code

router = APIRouter(dependencies=[Depends(get_current_agent_or_admin)])


@router.post("/", response_model=VoteCodeIssueResponse, status_code=status.HTTP_201_CREATED)
def create_vote_code(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_agent_or_admin)],
) -> VoteCodeIssueResponse:
    """Issue one code; the identity of the staff member is not stored on the ballot."""
    code, voter_number = issue_vote_code(db)
    return VoteCodeIssueResponse(code=code, voter_number=voter_number)
