from pydantic import BaseModel

class QuestionResponse(BaseModel):
    turn_number: int
    section_title: str
    question: str

class SubmitAnswerRequest(BaseModel):
    answer: str

class AnswerEvaluationSchema(BaseModel):
    score: int
    strengths: list[str]
    weaknesses: list[str]
    missing_topics: list[str]
    suggested_improvement: str
    feedback: str

class SubmitAnswerResponse(BaseModel):
    interview_completed: bool

    current_question: QuestionResponse | None = None

    report: dict | None = None