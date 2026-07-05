from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base_model import BaseModel

if TYPE_CHECKING:
    from app.models.interview_session import InterviewSession

class Resume(BaseModel):
    __tablename__ = 'resumes'
    interview_session_id: Mapped[uuid.UUID] = mapped_column(ForeignKey('interview_sessions.id', ondelete="CASCADE"), unique=True, nullable=False)
    original_filename: Mapped[str] = mapped_column(nullable=False)
    storage_path: Mapped[str] = mapped_column(nullable=False)
    storage_provider: Mapped[str] = mapped_column(nullable=False)
    mime_type: Mapped[str] = mapped_column(nullable=False)
    file_size: Mapped[int] = mapped_column(nullable=False)
    interview_session: Mapped["InterviewSession"] = relationship(back_populates="resume")