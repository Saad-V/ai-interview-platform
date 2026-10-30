from pydantic import BaseModel

from app.schemas.report import InterviewReportResponse

class QuestionResponse(BaseModel):
    turn_number: int
    section_title: str
    question: str

class SubmitAnswerRequest(BaseModel):
    answer: str

class SubmitAnswerResponse(BaseModel):
    interview_completed: bool

    current_question: QuestionResponse | None = None

    report: InterviewReportResponse | None = None