from pathlib import Path

path = Path(r'c:\AiiN\app\api\v1\interview_sessions.py')
text = path.read_text()
old = """@router.post(\"/{session_id}/answer\")\nasync def submit_answer(\n    session_id: uuid.UUID,\n    request: Request,\n    db: Session = Depends(get_db),\n):\n    return submit_answer_service(\n        db=db,\n        interview_session_id=session_id,\n        answer=request.answer,\n    )\n"""
new = """@router.post(\"/{session_id}/answer\")\nasync def submit_answer(\n    session_id: uuid.UUID,\n    request: Request,\n    db: Session = Depends(get_db),\n):\n    answer = None\n\n    content_type = request.headers.get(\"content-type\", \"\")\n    if content_type.startswith(\"application/json\"):\n        try:\n            payload = await request.json()\n            if isinstance(payload, dict):\n                answer = payload.get(\"answer\")\n        except Exception:\n            answer = None\n\n    if answer is None:\n        try:\n            form = await request.form()\n            answer = form.get(\"answer\")\n        except Exception:\n            answer = None\n\n    if answer is None:\n        raise HTTPException(\n            status_code=status.HTTP_400_BAD_REQUEST,\n            detail=\"Answer is required.\",\n        )\n\n    return submit_answer_service(\n        db=db,\n        interview_session_id=session_id,\n        answer=str(answer),\n    )\n"""
if old not in text:
    print('Old block not found. Text snippet:')
    idx = text.find('async def submit_answer')
    print(repr(text[idx:idx+500]))
    raise SystemExit(1)
path.write_text(text.replace(old, new))
print('patched successfully')
