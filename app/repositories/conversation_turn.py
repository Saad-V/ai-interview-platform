import uuid

from sqlalchemy.orm import Session

from app.models.conversation_turn import ConversationTurn
from app.schemas.conversation_turn import ConversationTurnCreate


class ConversationTurnRepository:

    def create(
        self,
        db: Session,
        conversation_turn: ConversationTurnCreate,
    ) -> ConversationTurn:

        conversation_turn_model = ConversationTurn(
            interview_session_id=conversation_turn.interview_session_id,
            turn_number=conversation_turn.turn_number,
            exchange_json=conversation_turn.exchange_json,
            evaluation_json=conversation_turn.evaluation_json,
        )

        db.add(conversation_turn_model)

        try:
            db.commit()
            db.refresh(conversation_turn_model)
        except Exception:
            db.rollback()
            raise

        return conversation_turn_model
    
    def get_by_session_id(
    self,
    db: Session,
    interview_session_id: uuid.UUID,
    ) -> list[ConversationTurn]:
        return (
            db.query(ConversationTurn)
            .filter(
                ConversationTurn.interview_session_id == interview_session_id
            )
            .order_by(
                ConversationTurn.turn_number.asc()
            )
            .all()
        )
    
    
    def get_last_turn(
    self,
    db: Session,
    interview_session_id: uuid.UUID,
    ) -> ConversationTurn | None:
        return (
            db.query(ConversationTurn)
            .filter(
                ConversationTurn.interview_session_id == interview_session_id
            )
            .order_by(
                ConversationTurn.turn_number.desc()
            )
            .first()
        )