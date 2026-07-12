from pathlib import Path

from app.core.enums import InterviewDifficulty
from app.services.document_parser_service import extract_text
from app.services.candidate_profile_service import generate_candidate_profile
from app.services.job_profile_service import generate_job_profile
from app.services.interview_blueprint_service import generate_interview_blueprint


resume_text = extract_text(
    Path("storage/resumes/eaf014bf-a691-4412-9da2-21844730eae9/resume.pdf")
)

job_description_text = extract_text(
    Path("storage/job_descriptions/eaf014bf-a691-4412-9da2-21844730eae9/job_description.pdf")
)

candidate_profile = generate_candidate_profile(
    resume_text
)

job_profile = generate_job_profile(
    job_description_text
)

blueprint = generate_interview_blueprint(
    candidate_profile=candidate_profile,
    job_profile=job_profile,
    duration_minutes=30,
    difficulty=InterviewDifficulty.MEDIUM,
)

print(
    blueprint.model_dump_json(
        indent=2
    )
)