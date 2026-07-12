from fastapi import APIRouter, Depends, File, UploadFile, status
from sqlalchemy.orm import Session
import uuid

from app.db.dependencies import get_db
from app.schemas.job_description import JobDescriptionResponse
from app.services.job_description_service import create_job_description

router = APIRouter(
    prefix="/interview-sessions",
    tags=["Job Descriptions"],
)



@router.post("/{session_id}/job-description", response_model=JobDescriptionResponse, status_code=status.HTTP_201_CREATED)
def upload_job_description(
    session_id: uuid.UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    return create_job_description(
        db=db,
        interview_session_id=session_id,
        file=file,
    )