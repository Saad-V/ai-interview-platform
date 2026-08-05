from pathlib import Path

path = Path(r"c:\AiiN\app\api\v1\interview_sessions.py")
text = path.read_text()
old = '''@router.post("/{session_id}/answer")
async def submit_answer(
    session_id: uuid.UUID,
    request: Request,
    db: Session = Depends(get_db),
):
    return submit_answer_service(
        db=db,
        interview_session_id=session_id,
        answer=request.answer,
    )
'''
new = '''@router.post("/{session_id}/answer")
async def submit_answer(
    session_id: uuid.UUID,
    request: Request,
    db: Session = Depends(get_db),
):
    answer = None

    content_type = request.headers.get("content-type", "")
    if content_type.startswith("application/json"):
        try:
            payload = await request.json()
            if isinstance(payload, dict):
                answer = payload.get("answer")
        except Exception:
            answer = None

    if answer is None:
        try:
            form = await request.form()
            answer = form.get("answer")
        except Exception:
            answer = None

    if answer is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Answer is required.",
        )

    return submit_answer_service(
        db=db,
        interview_session_id=session_id,
        answer=str(answer),
    )
'''
if old not in text:
    raise SystemExit('Old block not found')
path.write_text(text.replace(old, new))
print('patched')
