import uuid

from app.models.job_description import JobDescription
from app.schemas.job_description import JobDescriptionCreate
from sqlalchemy.orm import Session

class JobDescriptionRepository:

    def create(
        self,
        db: Session,
        job_description: JobDescriptionCreate,
    ) -> JobDescription:
        job_description_model = JobDescription(
            interview_session_id=job_description.interview_session_id,
            original_filename=job_description.original_filename,
            storage_path=job_description.storage_path,
            mime_type=job_description.mime_type,
            file_size=job_description.file_size,
            raw_text=job_description.raw_text,
        )
        db.add(job_description_model)
        try:
            db.commit()
            db.refresh(job_description_model)
        except Exception:
            db.rollback()
            raise
        return job_description_model
    
    def get_by_session_id(
            self,
            db: Session,
            interview_session_id: uuid.UUID
    ) -> JobDescription | None:
        return (
            db.query(JobDescription)
            .filter(
                JobDescription.interview_session_id == interview_session_id
            )
            .first()
        )