from __future__ import annotations

import uuid

from pydantic import BaseModel, ConfigDict


class ResumeCreate(BaseModel):
    interview_session_id: uuid.UUID
    original_filename: str
    storage_path: str
    storage_provider: str
    mime_type: str
    file_size: int



class ResumeResponse(BaseModel):
    id: uuid.UUID
    interview_session_id: uuid.UUID
    original_filename: str
    storage_path: str
    storage_provider: str
    mime_type: str
    file_size: int
    model_config = ConfigDict(from_attributes=True)
