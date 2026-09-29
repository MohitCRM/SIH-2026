from __future__ import annotations

import os
from typing import Annotated

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from starlette.concurrency import run_in_threadpool

from .sarvam_doc_ai import SarvamDocumentAIError, SarvamNotConfigured
from .service import combine_documents, extract_document, safe_filename


load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

app = FastAPI(
    title="Standalone Document Extraction Module",
    version="1.0.0",
    description=(
        "Accepts PDF documents and returns structured canonical fields with source evidence. "
        "No browser UI, review workflow, sessions, or persistence."
    ),
)

MAX_BYTES = int(os.getenv("MAX_UPLOAD_MB", "20")) * 1024 * 1024


@app.get("/api/v1/health")
def health() -> dict[str, object]:
    return {
        "status": "ok",
        "schema_version": "1.0",
        "provider": "sarvam_doc_ai",
        "provider_configured": bool(os.getenv("SARVAM_API_KEY", "").strip()),
    }


@app.post("/api/v1/extract")
async def extract(files: Annotated[list[UploadFile], File()]) -> dict:
    """Extract one or more PDFs and return structured fields immediately."""
    if not files:
        raise HTTPException(status_code=400, detail="Upload at least one PDF.")
    results: list[dict] = []
    for upload in files:
        filename = safe_filename(upload.filename or "document.pdf")
        if not filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=415, detail=f"{filename}: only PDF files are supported.")
        data = await upload.read(MAX_BYTES + 1)
        await upload.close()
        if len(data) > MAX_BYTES:
            raise HTTPException(status_code=413, detail=f"{filename}: file exceeds upload limit.")
        try:
            result = await run_in_threadpool(extract_document, filename, data)
            results.append(result)
        except SarvamNotConfigured as exc:
            raise HTTPException(status_code=503, detail=str(exc)) from exc
        except SarvamDocumentAIError as exc:
            raise HTTPException(status_code=exc.status_code, detail=f"{filename}: {exc}") from exc
        except ValueError as exc:
            raise HTTPException(status_code=422, detail=f"{filename}: {exc}") from exc
    return combine_documents(results)
