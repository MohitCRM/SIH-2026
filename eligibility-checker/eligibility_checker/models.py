from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


ReviewStatus = Literal["pending_review", "approved", "corrected", "unreadable", "conflict"]
FACT_KEYS = {
    "st_certificate_valid_for_domicile",
    "current_class",
    "study_in_india",
    "school_recognized",
    "family_income_annual_inr",
    "aadhaar_number_provided",
    "orphan_supported_by_guardian",
    "receives_other_scholarship",
    "previously_awarded_for_same_class",
    "scheduled_bank_account",
    "bank_account_active",
    "bank_account_holder_is_student_or_parent",
    "bank_account_aadhaar_linked",
    "bank_account_mobile_linked",
}
FactSource = Literal[
    "document_extraction",
    "applicant_declaration",
    "reviewer_verification",
    "official_verification",
]


class EvidenceReference(BaseModel):
    document_id: str | None = None
    filename: str | None = None
    page: int | None = Field(default=None, ge=1)
    source_label: str | None = None
    evidence_text: str | None = None


class Fact(BaseModel):
    """A fact plus its provenance; never pass an untraceable bare value."""

    value: Any = None
    source: FactSource = "applicant_declaration"
    review_status: ReviewStatus = "pending_review"
    evidence: list[EvidenceReference] = Field(default_factory=list)


class DocumentReference(BaseModel):
    document_id: str | None = None
    filename: str | None = None
    document_type: str
    review_status: ReviewStatus = "pending_review"


class EligibilityRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    schema_version: Literal["1.0"] = "1.0"
    ruleset_version: Literal["prematric_st_2021_26"] = "prematric_st_2021_26"
    # Facts needed by checks but not reliably present in the uploaded PDFs.
    facts: dict[str, Fact] = Field(default_factory=dict)
    # Direct output from the stateless document-reader POST /api/v1/extract.
    reader_output: dict[str, Any] | None = None
    # Optional typed document inventory. Types can be supplied by the UI when
    # the reader classifies a document as "other".
    documents: list[DocumentReference] = Field(default_factory=list)

    @model_validator(mode="after")
    def reject_unknown_fact_keys(self) -> "EligibilityRequest":
        unknown = sorted(set(self.facts) - FACT_KEYS)
        if unknown:
            raise ValueError(f"Unknown fact key(s): {', '.join(unknown)}")
        return self


class CriterionResult(BaseModel):
    criterion: str
    status: Literal["pass", "fail", "needs_review"]
    reason: str
    evidence: list[EvidenceReference] = Field(default_factory=list)


class EligibilityResponse(BaseModel):
    schema_version: Literal["1.0"] = "1.0"
    ruleset_version: str
    ruleset_notice: str
    overall_status: Literal["eligible", "ineligible", "needs_review"]
    decision_scope: str = "eligibility_screening_only"
    checks: list[CriterionResult]
    warnings: list[str] = Field(default_factory=list)
