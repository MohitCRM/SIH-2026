from __future__ import annotations

import json
import os
import uuid
from collections import defaultdict
from typing import Any

import fitz

from .registry import DOCUMENT_TYPES, FIELD_REGISTRY
from .sarvam_doc_ai import extract_pdf
from .schemas import (
    DocumentExtraction,
    ExtractedField,
    FieldOccurrence,
    SharedField,
    SourceEvidence,
    ExtractionResponse,
)


def _optional_page(value: Any, page_count: int) -> int | None:
    try:
        page = int(value)
    except (TypeError, ValueError):
        return None
    return page if 1 <= page <= page_count else None


def safe_filename(filename: str) -> str:
    name = os.path.basename(filename or "document.pdf").replace("\x00", "")
    return name[:180] or "document.pdf"


def extract_document(filename: str, data: bytes) -> dict[str, Any]:
    """Extract one PDF into canonical fields with source evidence.

    This function has no session, review, editing, or UI behavior. The supplied
    filename and bytes are processed in memory and the provider's structured
    output is returned directly in the module's stable JSON shape.
    """
    filename = safe_filename(filename)
    if not filename.lower().endswith(".pdf"):
        raise ValueError("Only PDF files are supported.")
    if not data.startswith(b"%PDF-"):
        raise ValueError("File does not have a valid PDF signature.")
    try:
        document = fitz.open(stream=data, filetype="pdf")
    except Exception as exc:
        raise ValueError("The PDF could not be opened or is damaged.") from exc
    try:
        page_count = document.page_count
        if page_count < 1:
            raise ValueError("The PDF has no pages.")
        configured_limit = int(os.getenv("MAX_PDF_PAGES", "10"))
        max_pages = min(configured_limit, 10)  # Sarvam Document AI hard limit.
        if page_count > max_pages:
            raise ValueError(f"Sarvam Document AI accepts PDFs up to 10 pages; this PDF has {page_count} pages.")

        job_status, extracted = extract_pdf(filename, data, page_count)
        normalized_type = str(extracted.get("document_type", "unknown") or "unknown").strip().lower()
        doc_type = normalized_type if normalized_type in DOCUMENT_TYPES else "other"
        warnings: list[str] = []
        if job_status == "partially_completed":
            warnings.append("Sarvam partially processed this PDF; some extracted fields may be missing.")
        if not extracted.get("document_type"):
            warnings.append("Document type was not returned by Sarvam.")

        fields: dict[str, ExtractedField] = {}
        for canonical in FIELD_REGISTRY:
            key = canonical.replace(".", "_")
            raw_value = extracted.get(key)
            if isinstance(raw_value, dict) and "value" in raw_value:
                raw_value = raw_value.get("value")
            if raw_value is None or raw_value == "":
                continue
            source_label = extracted.get(f"{key}__source_label")
            evidence_text = extracted.get(f"{key}__evidence_text")
            fields[canonical] = ExtractedField(
                value=raw_value,
                source=SourceEvidence(
                    page=_optional_page(extracted.get(f"{key}__page"), page_count),
                    source_label=source_label[:120] if isinstance(source_label, str) and source_label else None,
                    evidence_text=evidence_text[:1000] if isinstance(evidence_text, str) and evidence_text else None,
                ),
            )

        result = DocumentExtraction(
            document_id=str(uuid.uuid4()),
            filename=filename,
            document_type=doc_type,
            page_count=page_count,
            fields=fields,
            warnings=warnings,
        )
        return result.model_dump(mode="json")
    finally:
        document.close()


def _value_key(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, default=str)


def combine_documents(documents: list[dict[str, Any]]) -> dict[str, Any]:
    """Group the same canonical field across documents without dropping sources."""
    groups: dict[str, list[FieldOccurrence]] = defaultdict(list)
    for document in documents:
        for canonical, field in document.get("fields", {}).items():
            groups[canonical].append(FieldOccurrence(
                document_id=document["document_id"],
                filename=document["filename"],
                value=field["value"],
                source=SourceEvidence.model_validate(field.get("source") or {}),
            ))

    shared: list[SharedField] = []
    for canonical, occurrences in sorted(groups.items()):
        distinct: dict[str, Any] = {}
        for occurrence in occurrences:
            distinct.setdefault(_value_key(occurrence.value), occurrence.value)
        shared.append(SharedField(
            canonical_field=canonical,
            values=list(distinct.values()),
            occurrences=occurrences,
        ))
    return ExtractionResponse(documents=documents, shared_fields=shared).model_dump(mode="json")


def extract_documents(files: list[tuple[str, bytes]]) -> dict[str, Any]:
    """Extract one or more PDFs; repeated canonical fields are grouped in output."""
    if not files:
        raise ValueError("Provide at least one PDF.")
    documents = [extract_document(filename, data) for filename, data in files]
    return combine_documents(documents)
