from pydantic import BaseModel, ConfigDict
from app.core.enums import InterviewDifficulty, InterviewStatus
import uuid
from datetime import datetime

class InterviewSessionCreate(BaseModel):
     planned_duration_minutes: int
     difficulty: InterviewDifficulty

class InterviewSessionResponse(BaseModel):
    id: uuid.UUID
    status: InterviewStatus
    difficulty: InterviewDifficulty
    planned_duration_minutes: int
    created_at: datetime   
    model_config = ConfigDict(from_attributes=True)