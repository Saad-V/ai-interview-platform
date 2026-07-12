from pathlib import Path

from app.services.document_parser_service import extract_text

text = extract_text(
    Path(r"storage\resumes\3291f6af-458e-4a60-a717-d18a4336a85d\resume.pdf")
)

print(text[:1000])