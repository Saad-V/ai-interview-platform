import uuid

from app.models.candidate_profile import CandidateProfile
from app.schemas.candidate_profile import CandidateProfileCreate
from sqlalchemy.orm import Session


class CandidateProfileRepository:
    def create(
        self,
        db: Session,
        candidate_profile: CandidateProfileCreate,
    ) -> CandidateProfile:
        candidate_profile_model = CandidateProfile(
            interview_session_id=candidate_profile.interview_session_id,
            profile_json=candidate_profile.profile_json,
        )
        db.add(candidate_profile_model)
        try:
            db.commit()
            db.refresh(candidate_profile_model)
        except Exception:
            db.rollback()
            raise
        return candidate_profile_model

    def create_or_update(
        self,
        db: Session,
        candidate_profile: CandidateProfileCreate,
    ) -> CandidateProfile:
        existing = self.get_by_session_id(
            db=db,
            interview_session_id=candidate_profile.interview_session_id,
        )
        if existing:
            existing.profile_json = candidate_profile.profile_json
            try:
                db.commit()
                db.refresh(existing)
            except Exception:
                db.rollback()
                raise
            return existing
        return self.create(db=db, candidate_profile=candidate_profile)

    def get_by_session_id(
        self,
        db: Session,
        interview_session_id: uuid.UUID,
    ) -> CandidateProfile | None:
        return (
            db.query(CandidateProfile)
            .filter(CandidateProfile.interview_session_id == interview_session_id)
            .first()
        )
