import uuid
from datetime import datetime, timezone

from sqlalchemy import and_, func, or_
from app.models.interview_session import InterviewSession
from app.models.conversation_turn import ConversationTurn
from app.models.report import Report
from app.core.enums import InterviewStatus
from app.schemas.interview_session import InterviewSessionCreate
from sqlalchemy.orm import Session


class InterviewRepository:

    def create(
        self,
        db: Session,
        interview: InterviewSessionCreate,
        user_id: uuid.UUID,
    ) -> InterviewSession:
        interview_session = InterviewSession(
            difficulty=interview.difficulty,
            planned_duration_minutes=interview.planned_duration_minutes,
            user_id=user_id,
        )
        db.add(interview_session)
        try:
            db.commit()
            db.refresh(interview_session)
        except Exception as e:
            db.rollback()
            raise e
        return interview_session
    
    def update_status(
        self,
        db: Session,
        interview_session_id: str,
        new_status: InterviewStatus,
    ) -> InterviewSession | None:
        interview_session = (
            db.query(InterviewSession)
            .filter(InterviewSession.id == interview_session_id)
            .first()
        )
        if interview_session:
            interview_session.status = new_status
            if new_status == InterviewStatus.COMPLETED:
                interview_session.completed_at = datetime.now(timezone.utc)
            try:
                db.commit()
                db.refresh(interview_session)
            except Exception as e:
                db.rollback()
                raise e
        return interview_session
    
    def get_by_id(
        self,
        db: Session,
        interview_session_id: str,
    ) -> InterviewSession | None:
        return (
            db.query(InterviewSession)
            .filter(InterviewSession.id == interview_session_id)
            .first()
        )

    def get_by_id_for_user(
        self,
        db: Session,
        interview_session_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> InterviewSession | None:
        return (
            db.query(InterviewSession)
            .filter(
                InterviewSession.id == interview_session_id,
                InterviewSession.user_id == user_id,
            )
            .first()
        )

    def get_history_page_for_user(
        self,
        db: Session,
        user_id: uuid.UUID,
        limit: int,
        cursor: uuid.UUID | None,
    ) -> list[tuple[InterviewSession, Report | None, int]] | None:
        query = (
            db.query(
                InterviewSession,
                Report,
                db.query(func.count(ConversationTurn.id))
                .filter(
                    ConversationTurn.interview_session_id == InterviewSession.id
                )
                .correlate(InterviewSession)
                .scalar_subquery()
                .label("turn_count"),
            )
            .outerjoin(
                Report,
                Report.interview_session_id == InterviewSession.id,
            )
            .filter(InterviewSession.user_id == user_id)
        )

        if cursor is not None:
            cursor_session = self.get_by_id_for_user(db, cursor, user_id)
            if cursor_session is None:
                return None
            query = query.filter(
                or_(
                    InterviewSession.created_at < cursor_session.created_at,
                    and_(
                        InterviewSession.created_at == cursor_session.created_at,
                        InterviewSession.id < cursor_session.id,
                    ),
                )
            )

        return (
            query.order_by(
                InterviewSession.created_at.desc(),
                InterviewSession.id.desc(),
            )
            .limit(limit + 1)
            .all()
        )

    def count_turns(
        self,
        db: Session,
        interview_session_id: uuid.UUID,
    ) -> int:
        return (
            db.query(func.count(ConversationTurn.id))
            .filter(
                ConversationTurn.interview_session_id == interview_session_id
            )
            .scalar()
            or 0
        )