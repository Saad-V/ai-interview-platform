from __future__ import annotations

from datetime import datetime
import uuid
from typing import TYPE_CHECKING
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base_model import BaseModel

if TYPE_CHECKING:
    from app.models.interview_session import InterviewSession

class ConversationTurn(BaseModel):
    __tablename__ = "conversation_turns"
    __table_args__ = (
        UniqueConstraint("interview_session_id", "turn_number", name="uq_turn_per_session"),
    )
    interview_session_id: Mapped[uuid.UUID] = mapped_column(ForeignKey('interview_sessions.id', ondelete="CASCADE"), nullable=False)
    turn_number: Mapped[int] = mapped_column(nullable=False)
    exchange_json: Mapped[dict] = mapped_column(JSONB, nullable=False)
    evaluation_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    interview_session: Mapped["InterviewSession"] = relationship(back_populates="conversation_turns")
