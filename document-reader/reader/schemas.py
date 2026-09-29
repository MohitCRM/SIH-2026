from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


class SourceEvidence(BaseModel):
    page: int | None = None
    source_label: str | None = None
    evidence_text: str | None = None


class ExtractedField(BaseModel):
    value: Any
    source: SourceEvidence


class DocumentExtraction(BaseModel):
    document_id: str
    filename: str
    document_type: str
    page_count: int = Field(ge=1)
    extraction_method: Literal["sarvam_doc_ai_extract"] = "sarvam_doc_ai_extract"
    fields: dict[str, ExtractedField]
    warnings: list[str] = Field(default_factory=list)


class FieldOccurrence(BaseModel):
    document_id: str
    filename: str
    value: Any
    source: SourceEvidence


class SharedField(BaseModel):
    canonical_field: str
    values: list[Any]
    occurrences: list[FieldOccurrence]


class ExtractionResponse(BaseModel):
    schema_version: Literal["1.0"] = "1.0"
    documents: list[DocumentExtraction]
    shared_fields: list[SharedField]
    warnings: list[str] = Field(default_factory=list)
