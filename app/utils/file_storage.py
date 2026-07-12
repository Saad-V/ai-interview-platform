from pathlib import Path
import shutil
import uuid

from fastapi import UploadFile

STORAGE_ROOT = Path("storage")

def save_resume_file(
    session_id: uuid.UUID,
    file: UploadFile,
) -> Path:
    resume_folder = (
    STORAGE_ROOT
    / "resumes"
    / str(session_id)
)
    resume_folder.mkdir(
    parents=True,
    exist_ok=True,
)
    extension = Path(file.filename).suffix.lower()
    resume_path = (
    resume_folder
    / f"resume{extension}"
)
    with resume_path.open("wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer,
        )
    return resume_path


def save_job_description_file(
    session_id: uuid.UUID,
    file: UploadFile,
) -> Path:
    job_description_folder = (
    STORAGE_ROOT
    / "job_descriptions"
    / str(session_id)
)
    job_description_folder.mkdir(
    parents=True,
    exist_ok=True,
)
    extension = Path(file.filename).suffix.lower()
    job_description_path = (
    job_description_folder
    / f"job_description{extension}"
)
    with job_description_path.open("wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer,
        )
    return job_description_path


