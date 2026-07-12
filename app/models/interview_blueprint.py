from __future__ import annotations

import uuid
from typing import TYPE_CHECKING
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base_model import BaseModel

if TYPE_CHECKING:
    from app.models.interview_session import InterviewSession

class InterviewBlueprint(BaseModel):
    __tablename__ = "interview_blueprints"
    interview_session_id: Mapped[uuid.UUID] = mapped_column(ForeignKey('interview_sessions.id', ondelete="CASCADE"), unique=True, nullable=False)
    blueprint_json: Mapped[dict] = mapped_column(JSONB, nullable=False)
    model_used: Mapped[str] = mapped_column(nullable=False)
    interview_session: Mapped["InterviewSession"] = relationship(back_populates="interview_blueprint")

