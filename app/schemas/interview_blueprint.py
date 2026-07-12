
import uuid
from pydantic import BaseModel, ConfigDict, Field

class InterviewBlueprintCreate(BaseModel):
    interview_session_id: uuid.UUID
    blueprint_json: dict
    model_used: str

class InterviewBlueprintResponse(BaseModel):
    id: uuid.UUID
    interview_session_id: uuid.UUID
    blueprint_json: dict
    model_used: str

    model_config = ConfigDict(from_attributes=True)