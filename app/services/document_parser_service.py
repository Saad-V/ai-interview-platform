import fitz
from docx import Document
from pathlib import Path

def extract_text(file_path: Path) -> str:
    extension = file_path.suffix.lower()
    if extension == ".pdf":
        return _extract_pdf(file_path)
    elif extension == ".docx":
        return _extract_docx(file_path)
    else:
        raise ValueError(f"Unsupported file extension: {extension}")
    
def _extract_pdf(file_path: Path) -> str:
    document = fitz.open(file_path)
    text = []
    for page in document:
        text.append(page.get_text())
    document.close()
    return "\n".join(text)

def _extract_docx(file_path: Path) -> str:
    document = Document(file_path)
    text = []
    for paragraph in document.paragraphs:
        text.append(paragraph.text)
    return "\n".join(text)