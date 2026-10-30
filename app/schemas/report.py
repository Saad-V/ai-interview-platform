import uuid

from pydantic import AliasChoices, BaseModel, ConfigDict, Field


class ReportCreate(BaseModel):
    interview_session_id: uuid.UUID
    overall_score: float
    report_json: dict
    pdf_storage_path: str | None = None

    model_config = ConfigDict(from_attributes=True)


class InterviewReportResponse(BaseModel):
    overall_score: float = Field(
        validation_alias=AliasChoices("overall_score", "overall_percentage")
    )
    technical_score: float = Field(
        validation_alias=AliasChoices("technical_score", "technical_percentage")
    )
    communication_score: float = Field(
        validation_alias=AliasChoices(
            "communication_score",
            "communication_percentage",
        )
    )
    strengths: list[str]
    areas_for_improvement: list[str]
    summary: str
    recommendation: str