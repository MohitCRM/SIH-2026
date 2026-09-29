from __future__ import annotations

from typing import Any, Callable

from .models import (
    CriterionResult,
    DocumentReference,
    EligibilityRequest,
    EligibilityResponse,
    EvidenceReference,
    Fact,
)


RULESET_VERSION = "prematric_st_2021_26"
RULESET_NOTICE = (
    "Based on the Ministry of Tribal Affairs Pre-Matric ST Scholarship guidelines "
    "covering 2021-22 to 2025-26. Confirm the current State/UT and scheme rules "
    "before using this screening result for an application or award."
)

# These identifiers form the integration contract. UI and upstream systems should
# use these keys for facts that are not inferable from reader output.
DOCUMENT_ALIASES = {
    "domicile": "domicile_certificate",
    "domicile_certificate": "domicile_certificate",
    "residence_certificate": "domicile_certificate",
    "scheduled_tribe_certificate": "st_certificate",
    "st_certificate": "st_certificate",
    "tribe_certificate": "st_certificate",
    "income_certificate": "income_certificate",
    "family_income_certificate": "income_certificate",
    "disability_certificate": "disability_certificate",
    "photograph": "passport_photo",
    "passport_size_photograph": "passport_photo",
    "scanned_passport_photo": "passport_photo",
    "passport_photo": "passport_photo",
    "photo": "passport_photo",
}
REQUIRED_DOCUMENTS = (
    ("domicile_certificate", "Domicile certificate"),
    ("st_certificate", "ST certificate"),
    ("income_certificate", "Family income certificate"),
    ("passport_photo", "Passport-size photograph"),
)


def _normalize_doc_type(value: str) -> str:
    return DOCUMENT_ALIASES.get(value.strip().lower().replace("-", "_").replace(" ", "_"), "")


def _verified(fact: Fact | None) -> bool:
    if fact is None:
        return False
    if fact.review_status in {"unreadable", "conflict"}:
        return False
    if fact.source in {"reviewer_verification", "official_verification"}:
        return True
    return fact.source == "document_extraction" and fact.review_status in {"approved", "corrected"}


def _documents_from_reader(reader: dict[str, Any]) -> list[DocumentReference]:
    """Adapt the stateless reader inventory without importing its package."""
    docs: list[DocumentReference] = []
    for document in reader.get("documents", []) if isinstance(reader.get("documents"), list) else []:
        if not isinstance(document, dict):
            continue
        docs.append(DocumentReference(
            document_id=document.get("document_id"),
            filename=document.get("filename"),
            document_type=str(document.get("document_type", "unknown")),
            review_status="pending_review",
        ))
    return docs


def _criterion(
    key: str,
    label: str,
    facts: dict[str, Fact],
    predicate: Callable[[dict[str, Any]], bool],
    pass_reason: str,
    fail_reason: str,
    conflicts: set[str],
    required: tuple[str, ...],
) -> CriterionResult:
    selected = {name: facts.get(name) for name in required}
    evidence = [ref for fact in selected.values() if fact for ref in fact.evidence]
    if any(name in conflicts for name in required) or any(
        fact is not None and fact.review_status in {"conflict", "unreadable"}
        for fact in selected.values()
    ):
        return CriterionResult(criterion=label, status="needs_review", reason="Conflicting or unreadable evidence needs human review.", evidence=evidence)
    missing = [name for name, fact in selected.items() if fact is None or fact.value is None or fact.value == ""]
    if missing:
        return CriterionResult(criterion=label, status="needs_review", reason="Required fact is missing: " + ", ".join(missing) + ".", evidence=evidence)
    unverified = [name for name, fact in selected.items() if not _verified(fact)]
    if unverified:
        return CriterionResult(criterion=label, status="needs_review", reason="Fact requires reviewer or official verification: " + ", ".join(unverified) + ".", evidence=evidence)
    values = {name: fact.value for name, fact in selected.items() if fact}
    if predicate(values):
        return CriterionResult(criterion=label, status="pass", reason=pass_reason, evidence=evidence)
    return CriterionResult(criterion=label, status="fail", reason=fail_reason, evidence=evidence)


def _document_checks(documents: list[DocumentReference]) -> list[CriterionResult]:
    normalized: dict[str, list[DocumentReference]] = {}
    for document in documents:
        category = _normalize_doc_type(document.document_type)
        if category:
            normalized.setdefault(category, []).append(document)
    results = []
    for category, label in REQUIRED_DOCUMENTS:
        matching = normalized.get(category, [])
        if not matching:
            results.append(CriterionResult(criterion=f"document_{category}", status="needs_review", reason=f"{label} was not identified in the supplied document inventory."))
        elif not any(doc.review_status in {"approved", "corrected"} for doc in matching):
            results.append(CriterionResult(criterion=f"document_{category}", status="needs_review", reason=f"{label} is present but has not been verified by a reviewer."))
        else:
            doc = next(doc for doc in matching if doc.review_status in {"approved", "corrected"})
            results.append(CriterionResult(
                criterion=f"document_{category}", status="pass", reason=f"{label} is present and reviewer-verified.",
                evidence=[EvidenceReference(document_id=doc.document_id, filename=doc.filename)],
            ))
    return results


def _calculate(facts: dict[str, Fact], docs: list[DocumentReference], conflicts: set[str]) -> list[CriterionResult]:
    checks: list[CriterionResult] = []
    checks.append(_criterion(
        "aadhaar_number", "Aadhaar number is provided", facts,
        lambda v: v["aadhaar_number_provided"] is True,
        "Aadhaar number provision is verified.", "Aadhaar number is not provided.", conflicts, ("aadhaar_number_provided",),
    ))
    checks.append(_criterion(
        "st_domicile", "ST certificate applies to the student's domicile State/UT", facts,
        lambda v: v["st_certificate_valid_for_domicile"] is True,
        "ST status is verified for the student's domicile State/UT.",
        "The verified ST certificate does not match the student's domicile State/UT.", conflicts,
        ("st_certificate_valid_for_domicile",),
    ))
    checks.append(_criterion(
        "class_ix_x", "Student is studying in Class IX or X", facts,
        lambda v: str(v["current_class"]).strip().upper() in {"9", "IX", "9TH", "10", "X", "10TH"},
        "Current class is IX or X.", "Current class is outside IX and X.", conflicts, ("current_class",),
    ))
    checks.append(_criterion(
        "study_in_india", "Studies are in India", facts,
        lambda v: v["study_in_india"] is True,
        "Study in India is verified.", "Study outside India does not meet the scheme scope.", conflicts, ("study_in_india",),
    ))
    checks.append(_criterion(
        "recognized_school", "School is eligible under the guideline", facts,
        lambda v: v["school_recognized"] is True,
        "School is verified as Government or government-recognized / Board-recognized.",
        "School is verified as not meeting the stated recognition condition.", conflicts, ("school_recognized",),
    ))
    # Orphans supported by a guardian are exempt from the income cap, but the
    # exemption itself must be verified before applying it.
    orphan = facts.get("orphan_supported_by_guardian")
    income = facts.get("family_income_annual_inr")
    if orphan and orphan.value is True and _verified(orphan):
        checks.append(CriterionResult(criterion="family_income", status="pass", reason="Verified orphan supported by a guardian; the guideline exempts this case from the income criterion.", evidence=list(orphan.evidence)))
    elif income is None or income.value is None or not _verified(income) or income.review_status in {"conflict", "unreadable"}:
        checks.append(_criterion(
            "family_income", "Family income is within ₹2,50,000 per annum", facts,
            lambda v: isinstance(v["family_income_annual_inr"], (int, float)) and not isinstance(v["family_income_annual_inr"], bool) and 0 <= v["family_income_annual_inr"] <= 250000,
            "Verified annual family income is within the guideline limit.",
            "Verified annual family income exceeds ₹2,50,000.", conflicts, ("family_income_annual_inr",),
        ))
    elif isinstance(income.value, bool) or not isinstance(income.value, (int, float)) or income.value < 0:
        checks.append(CriterionResult(criterion="family_income", status="needs_review", reason="Verified income value is not a valid non-negative annual amount in rupees.", evidence=list(income.evidence)))
    elif income.value <= 250000:
        checks.append(CriterionResult(criterion="family_income", status="pass", reason="Verified annual family income is within the guideline limit.", evidence=list(income.evidence)))
    elif orphan is None or not _verified(orphan):
        checks.append(CriterionResult(criterion="family_income", status="needs_review", reason="Income exceeds the limit, but the orphan/guardian exception has not been resolved.", evidence=list(income.evidence) + (list(orphan.evidence) if orphan else [])))
    elif orphan.value is True:
        checks.append(CriterionResult(criterion="family_income", status="pass", reason="Verified orphan supported by a guardian; the guideline exempts this case from the income criterion.", evidence=list(income.evidence) + list(orphan.evidence)))
    elif orphan.value is False:
        checks.append(CriterionResult(criterion="family_income", status="fail", reason="Verified annual family income exceeds ₹2,50,000 and no orphan/guardian exception applies.", evidence=list(income.evidence) + list(orphan.evidence)))
    else:
        checks.append(CriterionResult(criterion="family_income", status="needs_review", reason="Orphan/guardian exception must be a verified yes/no value.", evidence=list(income.evidence) + list(orphan.evidence)))
    checks.append(_criterion(
        "other_scholarship", "Student is not receiving another scholarship", facts,
        lambda v: v["receives_other_scholarship"] is False,
        "Verified that the student is not receiving another scholarship.",
        "Student is verified as receiving another scholarship.", conflicts, ("receives_other_scholarship",),
    ))
    checks.append(_criterion(
        "repeat_class", "Scholarship has not already been awarded twice for the same class", facts,
        lambda v: v["previously_awarded_for_same_class"] is False,
        "No prior scholarship award for this same class was identified.",
        "A scholarship was already awarded for this same class.", conflicts, ("previously_awarded_for_same_class",),
    ))
    bank_fields = (
        "scheduled_bank_account",
        "bank_account_active",
        "bank_account_holder_is_student_or_parent",
        "bank_account_aadhaar_linked",
        "bank_account_mobile_linked",
    )
    checks.append(_criterion(
        "bank_account", "Bank account meets the scheme requirements", facts,
        lambda v: all(v[k] is True for k in bank_fields),
        "Verified active Scheduled Bank account is held by the student or parent and linked with Aadhaar and mobile.",
        "One or more verified bank-account requirements are not met.", conflicts, bank_fields,
    ))
    checks.extend(_document_checks(docs))
    return checks


def evaluate_case(payload: EligibilityRequest | dict[str, Any]) -> dict[str, Any]:
    """Evaluate a case; never converts missing/unverified facts into a failure."""
    request = payload if isinstance(payload, EligibilityRequest) else EligibilityRequest.model_validate(payload)
    facts = dict(request.facts)
    docs = list(request.documents)
    if request.reader_output:
        # LLM-extracted documents establish only that the reader recognized
        # an uploaded document. They are not treated as verified facts/documents.
        docs.extend(_documents_from_reader(request.reader_output))
    checks = _calculate(facts, docs, set())
    statuses = {item.status for item in checks}
    overall = "ineligible" if "fail" in statuses else "needs_review" if "needs_review" in statuses else "eligible"
    warnings = [
        "This is an eligibility screening result, not an award decision or certificate-authentication result.",
        "The attached guideline period ends in 2025-26; confirm current State/UT rules and portal document requirements.",
    ]
    return EligibilityResponse(
        ruleset_version=RULESET_VERSION,
        ruleset_notice=RULESET_NOTICE,
        overall_status=overall,
        checks=checks,
        warnings=warnings,
    ).model_dump(mode="json")
