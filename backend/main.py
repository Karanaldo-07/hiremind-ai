from typing import Any

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from backend.services.job_analyzer import analyze_job_description
from backend.services.resume_parser import MAX_FILE_SIZE, extract_resume_text
from backend.services.resume_structurer import structure_resume

app = FastAPI(
    title="HireMind AI API",
    description="Backend API for resume intelligence, job matching, and interview preparation.",
    version="0.4.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class JobDescriptionRequest(BaseModel):
    text: str = Field(..., min_length=30, max_length=30000)


@app.get("/")
def root():
    return {
        "name": "HireMind AI API",
        "status": "running",
        "version": "0.4.0",
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/api/v1/resumes/upload")
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="A resume file is required.")

    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File is too large. Maximum supported size is 5 MB.")

    try:
        text = extract_resume_text(file.filename, file_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=422, detail="The resume could not be parsed. Please check that the file is a valid PDF or DOCX.") from exc

    profile = structure_resume(text)

    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "text_length": len(text),
        "text": text,
        "profile": profile,
    }


@app.post("/api/v1/jobs/analyze")
def analyze_job(request: JobDescriptionRequest) -> dict[str, Any]:
    return {"job": analyze_job_description(request.text)}
