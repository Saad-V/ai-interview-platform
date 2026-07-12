import uuid

from app.models.job_profile import JobProfile
from app.schemas.job_profile import JobProfileCreate
from sqlalchemy.orm import Session


class JobProfileRepository:
    def create(
        self,
        db: Session,
        job_profile: JobProfileCreate,
    ) -> JobProfile:
        job_profile_model = JobProfile(
            interview_session_id=job_profile.interview_session_id,
            profile_json=job_profile.profile_json,
        )
        db.add(job_profile_model)
        try:
            db.commit()
            db.refresh(job_profile_model)
        except Exception:
            db.rollback()
            raise
        return job_profile_model

    def get_by_session_id(
        self,
        db: Session,
        interview_session_id: uuid.UUID,
    ) -> JobProfile | None:
        return (
            db.query(JobProfile)
            .filter(JobProfile.interview_session_id == interview_session_id)
            .first()
        )
