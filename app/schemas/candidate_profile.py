from pydantic import BaseModel, ConfigDict
import uuid

class CandidateProfileCreate(BaseModel):
    interview_session_id: uuid.UUID
    profile_json: dict

    model_config = ConfigDict(from_attributes=True)

class CandidateProfileResponse(BaseModel):
    id: uuid.UUID
    interview_session_id: uuid.UUID
    profile_json: dict

    model_config = ConfigDict(from_attributes=True)
    