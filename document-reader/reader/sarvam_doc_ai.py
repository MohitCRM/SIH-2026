from __future__ import annotations

import io
import json
import os
import time
from typing import Any

from sarvamai import SarvamAI
from sarvamai.core.api_error import ApiError

from .registry import DOCUMENT_TYPES, FIELD_DESCRIPTIONS, FIELD_REGISTRY, FIELD_TYPES


class SarvamNotConfigured(RuntimeError):
    pass


class SarvamDocumentAIError(RuntimeError):
    def __init__(self, message: str, status_code: int = 502):
        super().__init__(message)
        self.status_code = status_code


def _property_key(canonical_field: str) -> str:
    return canonical_field.replace(".", "_")


def build_extract_schema() -> tuple[dict[str, Any], dict[str, str]]:
    """Create Sarvam's required, descriptive JSON schema and reverse field map."""
    properties: dict[str, Any] = {
        "document_type": {
            "type": "string",
            "description": "Classify the uploaded single document. Use one of: " + ", ".join(DOCUMENT_TYPES) + ".",
            "enum": DOCUMENT_TYPES,
        }
    }
    reverse_map: dict[str, str] = {}
    for canonical, aliases in FIELD_REGISTRY.items():
        key = _property_key(canonical)
        reverse_map[key] = canonical
        value_schema: dict[str, Any] = {
            "type": FIELD_TYPES.get(canonical, "string"),
            "description": FIELD_DESCRIPTIONS[canonical] + " Recognize these label variants where context supports them: " + ", ".join(aliases) + ". Return the literal document content; use an empty value if absent.",
        }
        if canonical == "education.subject_marks":
            value_schema["items"] = {
                "type": "object",
                "description": "One subject row from the marksheet, with the printed subject and its marks or grade.",
                "properties": {
                    "subject": {"type": "string", "description": "Subject or paper title exactly as printed."},
                    "marks_obtained": {"type": "string", "description": "Marks obtained for this subject exactly as printed."},
                    "maximum_marks": {"type": "string", "description": "Maximum marks for this subject exactly as printed, if present."},
                    "grade": {"type": "string", "description": "Grade or result for this subject, if present."},
                },
            }
        properties[key] = value_schema
        properties[f"{key}__page"] = {"type": "integer", "description": f"One-based PDF page number containing {FIELD_DESCRIPTIONS[canonical]}, or 0 when the page cannot be localized."}
        properties[f"{key}__evidence_text"] = {"type": "string", "description": f"Short exact text supporting {FIELD_DESCRIPTIONS[canonical]}; empty if unavailable."}
        properties[f"{key}__source_label"] = {"type": "string", "description": f"Printed field label associated with {FIELD_DESCRIPTIONS[canonical]}; empty if unavailable."}
    return {"type": "object", "properties": properties}, reverse_map


def _to_plain(value: Any) -> Any:
    if hasattr(value, "model_dump"):
        return value.model_dump(mode="json")
    if hasattr(value, "to_dict"):
        return value.to_dict()
    if isinstance(value, dict):
        return {str(k): _to_plain(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_to_plain(v) for v in value]
    return value


def extract_pdf(filename: str, pdf_bytes: bytes, page_count: int) -> tuple[str, dict[str, Any]]:
    api_key = os.getenv("SARVAM_API_KEY", "").strip()
    if not api_key:
        raise SarvamNotConfigured("SARVAM_API_KEY is not configured. Add a Sarvam API subscription key to the local .env file.")
    schema, _ = build_extract_schema()
    language = os.getenv("SARVAM_LANGUAGE", "en-IN").strip() or "en-IN"
    # Document AI currently documents a 10 requests/minute limit. Polling every
    # eight seconds leaves room for submit/result calls in the same minute.
    poll_interval = max(10, int(os.getenv("SARVAM_POLL_INTERVAL_SECONDS", "10")))
    timeout_seconds = max(30, int(os.getenv("SARVAM_JOB_TIMEOUT_SECONDS", "240")))
    client = SarvamAI(api_subscription_key=api_key)
    try:
        pdf_stream = io.BytesIO(pdf_bytes)
        job = client.doc_ai.extract(
            file=[(filename, pdf_stream, "application/pdf")],
            schema=json.dumps(schema, ensure_ascii=False),
            language=language,
            output_format="json",
        )
        deadline = time.monotonic() + timeout_seconds
        state = str(job.status).lower()
        terminal = {"completed", "partially_completed", "failed", "rejected"}
        while state not in terminal:
            if time.monotonic() >= deadline:
                raise SarvamDocumentAIError(f"Sarvam extraction job {job.job_id} did not finish within {timeout_seconds} seconds.", 504)
            time.sleep(poll_interval)
            status = client.doc_ai.get_status(job_id=job.job_id)
            state = str(status.status).lower()
        if state not in {"completed", "partially_completed"}:
            raise SarvamDocumentAIError(f"Sarvam extraction job ended with status '{state}'.", 422)
        result_response = client.doc_ai.get_results(job_id=job.job_id)
        result = _to_plain(getattr(result_response, "result", result_response))
        if not isinstance(result, dict):
            raise SarvamDocumentAIError("Sarvam returned an unexpected result format; expected a JSON object.", 502)
        if state == "partially_completed":
            result["_reader_warning"] = "Sarvam partially processed this PDF. Review all pages and fields."
        return state, result
    except ApiError as exc:
        status_code = getattr(exc, "status_code", "unknown")
        body = str(getattr(exc, "body", ""))[:600]
        try:
            status_code_int = int(status_code)
        except (TypeError, ValueError):
            status_code_int = 502
        raise SarvamDocumentAIError(f"Sarvam Document AI error (HTTP {status_code_int}): {body or str(exc)[:300]}", status_code_int) from exc
    except SarvamDocumentAIError:
        raise
    except Exception as exc:
        raise SarvamDocumentAIError(f"Sarvam Document AI request failed: {str(exc)[:400]}", 502) from exc
