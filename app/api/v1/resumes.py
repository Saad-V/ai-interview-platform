from fastapi import APIRouter, Depends, File, UploadFile, status
from sqlalchemy.orm import Session
import uuid

from app.db.dependencies import get_db
from app.schemas.resume import ResumeResponse
from app.services.resume_service import create_resume

router = APIRouter(
    prefix="/interview-sessions",
    tags=["Resumes"],
)


@router.post("/{session_id}/resume", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
def upload_resume(
    session_id: uuid.UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    return create_resume(
        db=db,
        interview_session_id=session_id,
        file=file,
    )