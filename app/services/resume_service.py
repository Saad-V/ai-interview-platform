from pathlib import Path
import uuid
from typing import Iterable

from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.models.interview_session import InterviewSession
from app.models.resume import Resume
from app.repositories.resume_repository import ResumeRepository
from app.schemas.resume import ResumeCreate
from app.utils.file_storage import save_resume_file

VALID_RESUME_EXTENSIONS = {".pdf", ".docx"}
MAX_RESUME_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
DEFAULT_STORAGE_PROVIDER = "local"

repository = ResumeRepository()


def _validate_resume_extension(filename: str, allowed_extensions: Iterable[str] = VALID_RESUME_EXTENSIONS) -> str:
    extension = Path(filename).suffix.lower()
    if not extension:
        raise HTTPException(status_code=400, detail="Resume file must have a valid file extension.")
    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Invalid resume extension '{extension}'. "
                f"Allowed extensions: {', '.join(sorted(allowed_extensions))}."
            ),
        )
    return extension


def _validate_resume_file_size(file: UploadFile, max_bytes: int = MAX_RESUME_FILE_SIZE) -> int:
    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)
    if size > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=(
                f"Resume file size exceeds the {max_bytes // (1024 * 1024)} MB limit. "
                f"Uploaded file size is {size} bytes."
            ),
        )
    return size


def create_resume(db: Session, interview_session_id: uuid.UUID, file: UploadFile) -> Resume:

    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is missing.")
    _validate_resume_extension(file.filename)
    file_size = _validate_resume_file_size(file)

    session_exists = db.query(InterviewSession).get(interview_session_id)
    if session_exists is None:
        raise HTTPException(
            status_code=404,
            detail=f"Interview session '{interview_session_id}' not found.",
        )

    storage_path = save_resume_file(interview_session_id, file)

    resume_create = ResumeCreate(
        interview_session_id=interview_session_id,
        original_filename=file.filename,
        storage_path=str(storage_path),
        storage_provider=DEFAULT_STORAGE_PROVIDER,
        mime_type=file.content_type or "application/octet-stream",
        file_size=file_size,
    )

    return repository.create(db, resume_create)
