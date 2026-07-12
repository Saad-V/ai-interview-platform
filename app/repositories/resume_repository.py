import uuid

from app.models.resume import Resume
from app.schemas.resume import ResumeCreate
from sqlalchemy.orm import Session

class ResumeRepository:

    def create(
        self,
        db: Session,
        resume: ResumeCreate,
    ) -> Resume:
        resume_model = Resume(
            interview_session_id=resume.interview_session_id,
            original_filename=resume.original_filename,
            storage_path=resume.storage_path,
            storage_provider=resume.storage_provider,
            mime_type=resume.mime_type,
            file_size=resume.file_size,
        )
        db.add(resume_model)
        try:
            db.commit()
            db.refresh(resume_model)
        except Exception:
            db.rollback()
            raise
        return resume_model
    
    def get_by_session_id(
            self,
            db: Session,
            interview_session_id: uuid.UUID
    ) -> Resume | None:
        return (
            db.query(Resume)
            .filter(
                Resume.interview_session_id == interview_session_id
            )
            .first()
        )