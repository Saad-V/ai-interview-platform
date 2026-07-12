from fastapi import FastAPI

from app.api.v1.interview_sessions import router as interview_router
from app.api.v1.resumes import router as resume_router
from app.api.v1.job_descriptions import router as job_description_router

app = FastAPI()


@app.get("/")
def root():
    return {"message": "Hello World"}


app.include_router(
    interview_router,
    prefix="/api/v1",
)

app.include_router(
    resume_router,
    prefix="/api/v1",
)

app.include_router(
    job_description_router,
    prefix="/api/v1",
)