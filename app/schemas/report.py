import uuid

from pydantic import AliasChoices, BaseModel, ConfigDict, Field


class ReportCreate(BaseModel):
    interview_session_id: uuid.UUID
    overall_score: float
    report_json: dict
    pdf_storage_path: str | None = None

    model_config = ConfigDict(from_attributes=True)


class InterviewReportResponse(BaseModel):
    rubric_version: str | None = None
    overall_score: float | None = Field(
        default=None,
        validation_alias=AliasChoices("overall_score", "overall_percentage")
    )
    technical_score: float | None = Field(
        default=None,
        validation_alias=AliasChoices("technical_score", "technical_percentage")
    )
    communication_score: float | None = Field(
        default=None,
        validation_alias=AliasChoices(
            "communication_score",
            "communication_percentage",
        )
    )
    strengths: list[str] = Field(default_factory=list)
    areas_for_improvement: list[str] = Field(
        default_factory=list,
        validation_alias=AliasChoices(
            "areas_for_improvement",
            "improvements",
            "weaknesses",
        ),
    )
    summary: str = Field(
        default="",
        validation_alias=AliasChoices("summary", "overall_summary"),
    )
    recommendation: str = Field(
        default="",
        validation_alias=AliasChoices("recommendation", "hiring_recommendation"),
    )
    total_awarded_score: int | None = None
    total_maximum_score: int | None = None
    question_count: int | None = None