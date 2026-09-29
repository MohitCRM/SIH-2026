"""Standalone rule-based scholarship eligibility checker."""

from .engine import RULESET_VERSION, evaluate_case
from .models import EligibilityRequest, EligibilityResponse, Fact, DocumentReference

__all__ = [
    "RULESET_VERSION",
    "evaluate_case",
    "EligibilityRequest",
    "EligibilityResponse",
    "Fact",
    "DocumentReference",
]
