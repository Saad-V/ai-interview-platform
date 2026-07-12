import uuid

from pydantic import BaseModel, ConfigDict


class ReportCreate(BaseModel):
    interview_session_id: uuid.UUID
    overall_score: float
    report_json: dict
    pdf_storage_path: str | None = None

    model_config = ConfigDict(from_attributes=True)