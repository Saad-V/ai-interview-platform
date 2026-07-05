from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import InterviewDifficulty, InterviewStatus
from app.models.base_model import BaseModel

if TYPE_CHECKING:
    from app.models.job_description import JobDescription
    from app.models.resume import Resume
    from app.models.candidate_profile import CandidateProfile
    from app.models.job_profile import JobProfile
    from app.models.report import Report
    from app.models.interview_blueprint import InterviewBlueprint
    from app.models.conversation_turn import ConversationTurn

class InterviewSession(BaseModel):
    __tablename__ = "interview_sessions"

    status: Mapped[InterviewStatus] = mapped_column(
        Enum(InterviewStatus), nullable=False, default=InterviewStatus.CREATED
    )
    difficulty: Mapped[InterviewDifficulty] = mapped_column(
        Enum(InterviewDifficulty), nullable=False
    )
    planned_duration_minutes: Mapped[int] = mapped_column(nullable=False)

    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    resume: Mapped["Resume"] = relationship(back_populates="interview_session", uselist=False, cascade="all, delete-orphan")
    job_description: Mapped["JobDescription"] = relationship(back_populates="interview_session", uselist=False, cascade="all, delete-orphan")
    candidate_profile: Mapped["CandidateProfile"] = relationship(back_populates="interview_session", uselist=False, cascade="all, delete-orphan")
    job_profile: Mapped["JobProfile"] = relationship(back_populates="interview_session", uselist=False, cascade="all, delete-orphan")
    interview_blueprint: Mapped["InterviewBlueprint"] = relationship(back_populates="interview_session", uselist=False, cascade="all, delete-orphan")
    report: Mapped["Report"] = relationship(back_populates="interview_session", uselist=False, cascade="all, delete-orphan")
    conversation_turns: Mapped[list["ConversationTurn"]] = relationship(back_populates="interview_session", cascade="all, delete-orphan")