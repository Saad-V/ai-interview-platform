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

    def create_or_update(
        self,
        db: Session,
        job_profile: JobProfileCreate,
    ) -> JobProfile:
        existing = self.get_by_session_id(
            db=db,
            interview_session_id=job_profile.interview_session_id,
        )
        if existing:
            existing.profile_json = job_profile.profile_json
            try:
                db.commit()
                db.refresh(existing)
            except Exception:
                db.rollback()
                raise
            return existing
        return self.create(db=db, job_profile=job_profile)

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
