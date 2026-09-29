# Scholarship Eligibility Checker

A standalone Python library and FastAPI service for checking structured application facts against a versioned pre-matric ST scholarship ruleset. It does not rank applicants, make scholarship awards, or depend on the document-reader package.

## Install and run

Python 3.10+:

```powershell
cd eligibility-checker
python -m pip install .
uvicorn eligibility_checker.app:app --host 127.0.0.1 --port 8001
```

API docs: `http://127.0.0.1:8001/docs`

Health: `GET http://127.0.0.1:8001/health`

Eligibility endpoint: `POST http://127.0.0.1:8001/api/v1/eligibility-checks`

For browser-based prototype calls from a different origin, copy `.env.example` to `.env` and set `ELIGIBILITY_CORS_ORIGINS` to a comma-separated allowlist. Server-to-server calls need no CORS configuration.

To run with Docker, build from this directory with `docker build -t sih-eligibility-checker .`, then run `docker run --rm -p 8001:8001 sih-eligibility-checker`.

## Use as a Python library

```python
from eligibility_checker import evaluate_case

result = evaluate_case({
    "ruleset_version": "prematric_st_2021_26",
    "facts": {
        "current_class": {
            "value": "IX",
            "source": "reviewer_verification",
            "review_status": "approved"
        }
    }
})
```

The result includes one outcome per rule. Missing facts naturally produce `needs_review`, so callers can build a UI around the returned reasons and then resubmit when required facts are available.

## Connect the PDF extractor

The extractor's `POST /api/v1/extract` response can be passed in the `reader_output` property. The checker reads its document inventory without importing extractor code or making another Sarvam call. Also pass `facts` and a typed `documents` inventory:

```json
{
  "schema_version": "1.0",
  "ruleset_version": "prematric_st_2021_26",
  "reader_output": {
    "schema_version": "1.0",
    "documents": [
      {
        "document_id": "doc-st",
        "filename": "st-certificate.pdf",
        "document_type": "scheduled_tribe_certificate",
        "page_count": 1,
        "fields": {
          "applicant.category_or_tribe": {
            "value": "Example Tribe",
            "source": {"page": 1, "source_label": "Tribe", "evidence_text": "Example Tribe"}
          }
        },
        "warnings": []
      }
    ],
    "shared_fields": [],
    "warnings": []
  },
  "facts": {
    "st_certificate_valid_for_domicile": {
      "value": true,
      "source": "official_verification",
      "review_status": "approved",
      "evidence": [{"document_id": "doc-st", "filename": "st-certificate.pdf", "page": 1}]
    },
    "current_class": {"value": "IX", "source": "reviewer_verification", "review_status": "approved"}
  },
  "documents": [
    {"document_id": "doc-st", "filename": "st-certificate.pdf", "document_type": "st_certificate", "review_status": "approved"}
  ]
}
```

The reader currently extracts document values; it does not verify them or provide all facts needed by the scholarship rules. The prototype must therefore map verified application/portal facts into `facts`. The `documents` list carries reviewer-checked document classifications. Reader-recognized documents alone remain unverified and cannot make a requirement pass.

## Fact contract

`facts` is a map keyed by the following exact names. Unknown keys are rejected with HTTP 422, which catches integration typos.

| Key | Expected value | Meaning |
|---|---|---|
| `st_certificate_valid_for_domicile` | Boolean | Competent verification that ST status applies to the domicile State/UT |
| `current_class` | `IX`, `X`, `9`, or `10` | Current class, not just the last class shown on an old marksheet |
| `study_in_india` | Boolean | Studies are in India |
| `school_recognized` | Boolean | School meets the Government/recognized-school condition |
| `family_income_annual_inr` | Non-negative number | Annual family income computed per the guideline |
| `aadhaar_number_provided` | Boolean | Whether an Aadhaar number is provided; do not send the number itself |
| `orphan_supported_by_guardian` | Boolean | Verified orphan/guardian exception for the income rule |
| `receives_other_scholarship` | Boolean | Whether the student receives another scholarship |
| `previously_awarded_for_same_class` | Boolean | Whether scholarship was already awarded for this same class |
| `scheduled_bank_account` | Boolean | Account is in a Scheduled Bank |
| `bank_account_active` | Boolean | Account is active |
| `bank_account_holder_is_student_or_parent` | Boolean | Account holder is the student or parent |
| `bank_account_aadhaar_linked` | Boolean | Account is Aadhaar-linked |
| `bank_account_mobile_linked` | Boolean | Account is mobile-linked |

Each fact has `value`, `source`, optional `review_status`, and optional `evidence[]`. `source` is one of `document_extraction`, `applicant_declaration`, `reviewer_verification`, or `official_verification`. Facts are accepted as verified only when supplied by reviewer/official verification, or when a document-extracted fact has review status `approved` or `corrected`. Applicant-entered values alone remain unverified. Only send a verification outcome for bank/Aadhaar checks; do not send full Aadhaar or bank account numbers.

Document types accepted by the completeness checks include `domicile_certificate`, `st_certificate` / `scheduled_tribe_certificate`, `income_certificate`, and `passport_photo` / `photograph`. Each item includes `document_type`, optional `document_id` and `filename`, and `review_status` (`pending_review`, `approved`, or `corrected`). Aadhaar is checked as a provided number fact, not a document upload requirement. The disability certificate supports an additional allowance when claimed; it is not a base eligibility gate.

## Response semantics

- `eligible`: every configured eligibility check and listed document check passed using verified inputs. This is screening only, not an award decision.
- `ineligible`: at least one verified rule failed; other unresolved checks remain individually visible.
- `needs_review`: no verified failure was found, but one or more required facts/documents are missing, unverified, conflicting, or unreadable.

Every result includes `ruleset_version`, `ruleset_notice`, individual `checks` with reasons and evidence, and `warnings`. The checker does not decide which conflicting document value is correct.

## Ruleset and production boundary

`prematric_st_2021_26` implements the attached Ministry of Tribal Affairs guidelines for 2021-22 through 2025-26. The Ministry currently lists scheme financial activity for 2026-27, but that does not by itself establish the applicable current eligibility rules. Confirm the current State/UT rules before using this ruleset operationally. [MoTA's 2026-27 scheme summary](https://tribal.nic.in/PFMS_SentionDtSchemewise2627.aspx) · [Guideline PDF](https://tribal.nic.in/downloads/guidelines/pre-matric/guidelines-Pre-matric-17-Oct-2022.pdf)

The service is stateless and does not persist applicant data, authenticate certificates, call Aadhaar/bank systems, rank applicants, or make award decisions. It has no authentication. Deploy behind the prototype's authenticated backend; only trusted backend code should mark facts or documents as reviewer/official verified. Configure CORS narrowly if the browser calls this service directly.
