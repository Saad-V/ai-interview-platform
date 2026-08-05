import uuid
import traceback
from app.db.session import session_local
from app.services.interview_service import submit_answer

session_id = uuid.UUID('88dd87a9-6624-4c58-91b9-4917960e0700')

with session_local() as db:
    try:
        result = submit_answer(db=db, interview_session_id=session_id, answer='test answer')
        print('RESULT', result)
    except Exception:
        traceback.print_exc()
