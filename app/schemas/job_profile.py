from pydantic import BaseModel, ConfigDict
import uuid

class JobProfileCreate(BaseModel):
    interview_session_id: uuid.UUID
    profile_json: dict

    model_config = ConfigDict(from_attributes=True)

class JobProfileResponse(BaseModel):
    id: uuid.UUID
    interview_session_id: uuid.UUID
    profile_json: dict

    model_config = ConfigDict(from_attributes=True)