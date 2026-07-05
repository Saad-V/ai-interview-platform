from __future__ import annotations

import uuid
from typing import TYPE_CHECKING
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base_model import BaseModel

if TYPE_CHECKING:
    from app.models.interview_session import InterviewSession

class JobProfile(BaseModel):
    __tablename__ = "job_profiles"
    interview_session_id: Mapped[uuid.UUID] = mapped_column(ForeignKey('interview_sessions.id', ondelete="CASCADE"), unique=True, nullable=False)
    profile_json: Mapped[dict] = mapped_column(JSONB, nullable=False)
    interview_session: Mapped["InterviewSession"] = relationship(back_populates="job_profile")
