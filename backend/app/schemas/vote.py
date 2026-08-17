import uuid

from pydantic import BaseModel, Field


class VoteCodeVerification(BaseModel):
    code: str = Field(min_length=6, max_length=6)


class BallotCreate(VoteCodeVerification):
    """One anonymous ballot containing the three mandatory selections."""

    roi_candidate_id: uuid.UUID
    reine_candidate_id: uuid.UUID
    duo_id: uuid.UUID


class BallotResponse(BaseModel):
    message: str


class VoteCodeIssueResponse(BaseModel):
    code: str
    voter_number: int
