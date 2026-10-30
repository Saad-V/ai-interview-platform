import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.api.dependencies import get_current_user, require_owned_interview_session
from app.models.user import User
from app.schemas.interview_runtime_schema import (
    SubmitAnswerRequest,
    SubmitAnswerResponse,
)
from app.schemas.interview_history import (
    ConversationTurnHistoryResponse,
    InterviewSessionHistoryDetail,
    InterviewSessionHistoryPage,
)
from app.schemas.interview_session import (
    InterviewSessionCreate,
    InterviewSessionResponse,
)
from app.services.interview_service import begin_interview as begin_interview_service
from app.services.interview_service import create_interview
from app.services.interview_service import (
    get_interview_history_detail,
    get_interview_history_page,
    get_interview_turn_history,
)
from app.services.interview_service import start_interview
from app.services.interview_service import submit_answer as submit_answer_service

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
    current_user: User = Depends(get_current_user),
):
    return create_interview(
        db=db,
        interview=interview,
        user_id=current_user.id,
    )


@router.get("/", response_model=InterviewSessionHistoryPage)
def list_interview_sessions(
    limit: int = Query(default=20, ge=1, le=100),
    cursor: uuid.UUID | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_interview_history_page(
        db=db,
        user_id=current_user.id,
        limit=limit,
        cursor=cursor,
    )


@router.get(
    "/{session_id}",
    response_model=InterviewSessionHistoryDetail,
)
def get_interview_session_history(
    session_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_interview_history_detail(
        db=db,
        interview_session_id=session_id,
        user_id=current_user.id,
    )


@router.get(
    "/{session_id}/turns",
    response_model=list[ConversationTurnHistoryResponse],
)
def get_interview_session_turns(
    session_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_interview_turn_history(
        db=db,
        interview_session_id=session_id,
        user_id=current_user.id,
    )


@router.post(
    "/{session_id}/start",
    dependencies=[Depends(require_owned_interview_session)],
)
def start_interview_session(
    session_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    return start_interview(db = db, interview_session_id=session_id)

@router.post(
    "/{session_id}/begin",
    dependencies=[Depends(require_owned_interview_session)],
)
def begin_interview(
    session_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    return begin_interview_service(
        db=db,
        interview_session_id=session_id,
    )

@router.post(
    "/{session_id}/answer",
    response_model=SubmitAnswerResponse,
    dependencies=[Depends(require_owned_interview_session)],
)
def submit_answer(
    session_id: uuid.UUID,
    submit_answer_request: SubmitAnswerRequest,
    db: Session = Depends(get_db),
):
    return submit_answer_service(
        db=db,
        interview_session_id=session_id,
        answer=submit_answer_request.answer,
    )