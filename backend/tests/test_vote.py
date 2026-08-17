import uuid

from fastapi.testclient import TestClient

from app.core.database import SessionLocal, engine
from app.models.base import Base
import app.models
from app.models.enums import VotingStatus
from app.models.system_settings import SystemSettings
from app.schemas.candidate import CandidateCreate
from app.schemas.duo import DuoCreate
from app.services.candidate_service import create_candidate
from app.services.duo_service import create_duo
from app.services.vote_code_service import issue_vote_code

Base.metadata.create_all(bind=engine)


def setup_settings(db):
    settings = db.get(SystemSettings, 1)
    if settings is None:
        settings = SystemSettings(id=1)
        db.add(settings)
    settings.voting_status = VotingStatus.OPEN
    db.commit()
    return settings


def test_one_code_submits_one_complete_anonymous_ballot():
    client = TestClient(__import__("app.main").main.app)
    db = SessionLocal()
    try:
        settings = setup_settings(db)
        roi = create_candidate(db, CandidateCreate(category="ROI", first_name="Test", last_name="Roi"))
        reine = create_candidate(db, CandidateCreate(category="REINE", first_name="Test", last_name="Reine"))
        duo = create_duo(db, DuoCreate(cavalier_first_name="Jean", cavalier_last_name="Valjean", cavaliere_first_name="Cosette", cavaliere_last_name="Fauchelevent"))
        code, voter_number = issue_vote_code(db)

        assert voter_number >= 1
        assert client.post("/api/v1/public/votes/verify-code", json={"code": code}).status_code == 204

        ballot = {
            "code": code,
            "roi_candidate_id": str(roi.id),
            "reine_candidate_id": str(reine.id),
            "duo_id": str(duo.id),
        }
        response = client.post("/api/v1/public/votes/", json=ballot)
        assert response.status_code == 201
        assert "enregistré" in response.json()["message"].lower()

        reused_code = client.post("/api/v1/public/votes/", json=ballot)
        assert reused_code.status_code == 400
        assert "déjà été utilisé" in reused_code.json()["detail"].lower()

        closed_code, _ = issue_vote_code(db)
        settings.voting_status = VotingStatus.CLOSED
        db.commit()
        closed = client.post("/api/v1/public/votes/verify-code", json={"code": closed_code})
        assert closed.status_code == 400
        assert "fermés" in closed.json()["detail"].lower()

        settings.voting_status = VotingStatus.OPEN
        db.commit()
        invalid_code, _ = issue_vote_code(db)
        invalid_ballot = {**ballot, "code": invalid_code, "roi_candidate_id": str(uuid.uuid4())}
        invalid = client.post("/api/v1/public/votes/", json=invalid_ballot)
        assert invalid.status_code == 400
        assert "invalide" in invalid.json()["detail"].lower()
    finally:
        db.close()


def test_public_results_remain_hidden_until_published():
    client = TestClient(__import__("app.main").main.app)
    db = SessionLocal()
    try:
        settings = setup_settings(db)
        settings.results_published = False
        db.commit()
        assert client.get("/api/v1/public/votes/results").status_code == 403

        settings.results_published = True
        db.commit()
        response = client.get("/api/v1/public/votes/results")
        assert response.status_code == 200
        assert set(response.json()) == {"roi", "reine", "duo"}
    finally:
        db.close()
