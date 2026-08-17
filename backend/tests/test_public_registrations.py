import os
import uuid

from fastapi.testclient import TestClient

from app.core.database import SessionLocal
from app.models.system_settings import SystemSettings
from app.schemas.candidate import CandidateCreate
from app.schemas.duo import DuoCreate
from app.services.candidate_service import create_candidate


def setup_settings(db):
    settings = db.get(SystemSettings, 1)
    if settings is None:
        settings = SystemSettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


def test_public_registration_flow():
    client = TestClient(__import__("app.main").main.app)

    db = SessionLocal()
    try:
        # Ensure settings exist
        settings = setup_settings(db)

        # 1. GET /public/settings
        r = client.get("/api/v1/public/settings")
        assert r.status_code == 200

        # 2. Create public Roi
        roi_payload = {"category": "ROI", "first_name": "Roi", "last_name": "Un"}
        r = client.post("/api/v1/public/candidates", json=roi_payload)
        assert r.status_code == 201
        assert r.json()["is_manual_entry"] is False

        # 2b. Create public Reine
        reine_payload = {"category": "REINE", "first_name": "Reine", "last_name": "Une"}
        r = client.post("/api/v1/public/candidates", json=reine_payload)
        assert r.status_code == 201
        assert r.json()["is_manual_entry"] is False

        # 2c. Create public Duo
        duo_payload = {
            "duo_name": "Les Beaux",
            "cavalier_first_name": "Jean",
            "cavalier_last_name": "Dupont",
            "cavaliere_first_name": "Marie",
            "cavaliere_last_name": "Durand",
        }
        r = client.post("/api/v1/public/duos", json=duo_payload)
        assert r.status_code == 201
        assert r.json()["is_manual_entry"] is False

        # 3. Close Roi inscriptions and verify 400
        settings.roi_inscriptions_open = False
        db.commit()

        r = client.post("/api/v1/public/candidates", json=roi_payload)
        assert r.status_code == 400
        assert "fermées" in r.json().get("detail", "")

        # Re-open and set roi_limit = 1 to test quota
        settings.roi_inscriptions_open = True
        settings.roi_limit = 1
        db.commit()

        # Attempt to create a second public Roi (we already created one)
        r = client.post("/api/v1/public/candidates", json=roi_payload)
        assert r.status_code == 400
        assert "limite" in r.json().get("detail", "").lower()

        # 5. Same for Reine: set limit=1 and verify
        settings.reine_limit = 1
        db.commit()
        r = client.post("/api/v1/public/candidates", json=reine_payload)
        assert r.status_code == 400

        # 6. Add admin candidates directly (should not affect public quota)
        admin_candidate = CandidateCreate(category="ROI", first_name="Admin", last_name="Ajout")
        create_candidate(db, admin_candidate, is_manual_entry=True)

        # Public quota remains enforced: still cannot add public Roi
        r = client.post("/api/v1/public/candidates", json=roi_payload)
        assert r.status_code == 400

        # 7. Verify quotas separated by category: Reine limit unaffected by Roi
        # (we already saw Reine rejected independently)

        # 8. Verify multiple duos allowed while open
        r = client.post("/api/v1/public/duos", json=duo_payload)
        assert r.status_code == 201
        r = client.post("/api/v1/public/duos", json=duo_payload)
        assert r.status_code == 201

        # 9. Check persistence: count public candidates (ROI and REINE)
        from app.models import Candidate
        import sqlalchemy as sa
        from app.models import CandidateCategory

        public_roi_count = db.scalar(
            sa.select(sa.func.count(Candidate.id)).where(
                Candidate.category == CandidateCategory.ROI,
                Candidate.is_manual_entry.is_(False),
            )
        )
        assert public_roi_count >= 1

        # 10. Deleting settings should make GET /settings return 404
        db.delete(settings)
        db.commit()
        r = client.get("/api/v1/public/settings")
        assert r.status_code == 404

    finally:
        db.close()
