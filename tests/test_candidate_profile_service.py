from pathlib import Path

from app.services.document_parser_service import extract_text
from app.services.job_profile_service import generate_job_profile

jd_text = extract_text(
    Path("storage/job_descriptions/eaf014bf-a691-4412-9da2-21844730eae9/job_description.pdf")
)

profile = generate_job_profile(jd_text)

print(profile.model_dump_json(indent=2))