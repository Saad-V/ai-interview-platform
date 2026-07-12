import uuid

from sqlalchemy.orm import Session
from app.core.config import settings
from app.ai.llm import generate_structured_output
from app.ai.prompts import (
    INTERVIEW_BLUEPRINT_SYSTEM_PROMPT,
    build_interview_blueprint_prompt,
)
from app.ai.schemas import (
    CandidateProfileSchema,
    JobProfileSchema,
    InterviewBlueprintSchema,
)
from app.core.enums import InterviewDifficulty
from app.models import candidate_profile, job_profile

from app.repositories.interview_blueprint_repository import InterviewBlueprintRepository
from app.schemas.interview_blueprint import InterviewBlueprintCreate

def generate_interview_blueprint(
    candidate_profile: CandidateProfileSchema,
    job_profile: JobProfileSchema,
    duration_minutes: int,
    difficulty: InterviewDifficulty,
) -> InterviewBlueprintSchema:
    
    user_prompt = build_interview_blueprint_prompt(
        candidate_profile=candidate_profile,
        job_profile=job_profile,
        duration_minutes=duration_minutes,
        difficulty=difficulty,
    )
    blueprint = generate_structured_output(
        system_prompt=INTERVIEW_BLUEPRINT_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        response_schema=InterviewBlueprintSchema,
    )

    return blueprint

repository = InterviewBlueprintRepository()

def save_interview_blueprint(
        db: Session,
        interview_session_id: uuid.UUID,
        blueprint: InterviewBlueprintSchema,
):
    blueprint_create = InterviewBlueprintCreate(
        interview_session_id=interview_session_id,
        blueprint_json=blueprint.model_dump(),
        model_used=settings.gemini_model
    )
    return repository.create(db=db, blueprint=blueprint_create)