import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.schemas.interview_session import (
    InterviewSessionCreate,
    InterviewSessionResponse,
)
from app.services.interview_service import begin_interview as begin_interview_service
from app.services.interview_service import create_interview
from app.services.interview_service import start_interview
from app.services.interview_service import submit_answer as submit_answer_service
from app.schemas.interview_runtime_schema import SubmitAnswerRequest

router = APIRouter(
    prefix="/interview-sessions",
    tags=["Interview Sessions"],
)


@router.post(
    "/",
    response_model=InterviewSessionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_interview_endpoint(
    interview: InterviewSessionCreate,
    db: Session = Depends(get_db),
):
    return create_interview(
        db=db,
        interview=interview,
    )

@router.post("/{session_id}/start")
def start_interview_session(
    session_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    return start_interview(db = db, interview_session_id=session_id)

@router.post("/{session_id}/begin")
def begin_interview(
    session_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    return begin_interview_service(
        db=db,
        interview_session_id=session_id,
    )

@router.post("/{session_id}/answer")
def submit_answer(
    session_id: uuid.UUID,
    request: SubmitAnswerRequest,
    db: Session = Depends(get_db),
):
    return submit_answer_service(
        db=db,
        interview_session_id=session_id,
        answer=request.answer,
    )