from __future__ import annotations

import uuid

from pydantic import BaseModel, ConfigDict


class JobDescriptionCreate(BaseModel):
    interview_session_id: uuid.UUID
    original_filename: str
    storage_path: str
    mime_type: str
    file_size: int
    raw_text: str | None



class JobDescriptionResponse(BaseModel):
    id: uuid.UUID
    interview_session_id: uuid.UUID
    original_filename: str
    storage_path: str
    mime_type: str
    file_size: int
    raw_text: str | None
    model_config = ConfigDict(from_attributes=True)
