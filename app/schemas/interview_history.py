import uuid
from datetime import datetime

from pydantic import BaseModel

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
    awarded_score: int
    maximum_score: int
    technical_percentage: float
    communication_percentage: float
    feedback: str
    strengths: list[str]
    weaknesses: list[str]
    missing_topics: list[str]
    suggested_improvement: str


class ConversationTurnHistoryResponse(BaseModel):
    id: uuid.UUID
    interview_session_id: uuid.UUID
    turn_number: int
    created_at: datetime
    completed_at: datetime | None
    section_title: str
    question: str
    candidate_answer: str
    evaluation: AnswerEvaluationResponse | None
