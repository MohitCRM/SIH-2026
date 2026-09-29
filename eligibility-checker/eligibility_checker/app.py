from __future__ import annotations

import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .engine import evaluate_case
from .models import EligibilityRequest, EligibilityResponse

load_dotenv()

app = FastAPI(
    title="Standalone Scholarship Eligibility Checker",
    version="1.0.0",
    description=(
        "Rule-based screening for the Ministry of Tribal Affairs pre-matric ST scholarship. "
        "Returns eligibility checks, evidence, and review needs; it does not rank applicants or award scholarships."
    ),
)

allowed_origins = [
    origin.strip()
    for origin in os.getenv("ELIGIBILITY_CORS_ORIGINS", "").split(",")
    if origin.strip()
]
if allowed_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type", "Authorization"],
    )


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "module": "eligibility_checker", "schema_version": "1.0"}


@app.post("/api/v1/eligibility-checks", response_model=EligibilityResponse)
def check_eligibility(request: EligibilityRequest) -> dict:
    return evaluate_case(request)
