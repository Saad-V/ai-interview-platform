import uuid
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class ConversationTurnCreate(BaseModel):
    interview_session_id: uuid.UUID
    turn_number: int
    exchange_json: dict
    evaluation_json: dict | None = None

    model_config = ConfigDict(from_attributes=True)

class ConversationTurnResponse(BaseModel):
    id: uuid.UUID
    interview_session_id: uuid.UUID
    turn_number: int
    exchange_json: dict
    evaluation_json: dict | None = None

    model_config = ConfigDict(from_attributes=True)