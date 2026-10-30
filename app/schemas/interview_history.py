import uuid
from datetime import datetime

from pydantic import AliasChoices, BaseModel, Field

from app.core.enums import InterviewDifficulty, InterviewStatus
from app.schemas.report import InterviewReportResponse


class InterviewReportPreview(BaseModel):
    overall_score: float
    summary: str
    recommendation: str


class InterviewSessionHistoryItem(BaseModel):
    id: uuid.UUID
    status: InterviewStatus
    difficulty: InterviewDifficulty
    planned_duration_minutes: int
    created_at: datetime
    completed_at: datetime | None
    turn_count: int
    report_preview: InterviewReportPreview | None


class InterviewSessionHistoryPage(BaseModel):
    items: list[InterviewSessionHistoryItem]
    next_cursor: uuid.UUID | None


class InterviewSessionHistoryDetail(BaseModel):
    id: uuid.UUID
    status: InterviewStatus
    difficulty: InterviewDifficulty
    planned_duration_minutes: int
    created_at: datetime
    completed_at: datetime | None
    turn_count: int
    report: InterviewReportResponse | None


class AnswerEvaluationResponse(BaseModel):
    awarded_score: int | None = None
    maximum_score: int | None = None
    score: float | None = None
    technical_percentage: float | None = None
    communication_percentage: float | None = None
    feedback: str = ""
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    missing_topics: list[str] = Field(default_factory=list)
    suggested_improvement: str = ""


class ConversationTurnHistoryResponse(BaseModel):
    id: uuid.UUID
    interview_session_id: uuid.UUID
    turn_number: int
    created_at: datetime
    completed_at: datetime | None
    section_title: str = "Interview"
    question: str = ""
    candidate_answer: str = Field(
        default="",
        validation_alias=AliasChoices("candidate_answer", "answer", "response"),
    )
    evaluation: AnswerEvaluationResponse | None
