from app.models.interview_session import InterviewSession
from app.core.enums import InterviewStatus
from app.schemas.interview_session import InterviewSessionCreate
from sqlalchemy.orm import Session

class InterviewRepository:

    def create(
        self,
        db: Session,
        interview: InterviewSessionCreate,
    ) -> InterviewSession:
        interview_session = InterviewSession(
            difficulty=interview.difficulty,
            planned_duration_minutes=interview.planned_duration_minutes,
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