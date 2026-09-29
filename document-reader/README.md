# Standalone PDF Document Extraction Module

This module ingests native or scanned PDFs and returns structured JSON fields using Sarvam AI Document AI Extract. It has no browser UI, human-review workflow, applicant editing, persistent session store, or dependency on the scholarship eligibility checker.

## Use as a Python module

Python 3.10+ is required. Install the module's dependencies into your environment:

```powershell
cd document-reader
python -m pip install -r requirements.txt
```

Set `SARVAM_API_KEY` in the environment (or copy `.env.example` to `.env` and set the key there). Then call the public module functions:

```python
from pathlib import Path
from reader import extract_document, extract_documents

# One document
result = extract_document("marksheet.pdf", Path("marksheet.pdf").read_bytes())

# Several documents; repeated canonical fields are grouped with all their sources
bundle = extract_documents([
    ("marksheet.pdf", Path("marksheet.pdf").read_bytes()),
    ("income-certificate.pdf", Path("income-certificate.pdf").read_bytes()),
])
```

## Optional HTTP adapter

Run the stateless API:

```powershell
cd document-reader
python -m pip install -r requirements.txt
uvicorn reader.app:app --host 127.0.0.1 --port 8000
```

API docs: `http://127.0.0.1:8000/docs`.

- `POST /api/v1/extract` — multipart `files`, one or more PDFs; returns extracted data directly.
- `GET /api/v1/health` — provider configuration status. It never returns the configured key.

Example request with curl:

```bash
curl -X POST http://127.0.0.1:8000/api/v1/extract \
  -F "files=@marksheet.pdf;type=application/pdf"
```

## Output contract

Each document has an ID, filename, detected document type, page count, extraction method, warnings, and a `fields` map keyed by canonical field names. Each extracted field contains its value and the page/label/evidence text returned by Sarvam, when available. `shared_fields` groups the same canonical field across documents and preserves every occurrence and its source. Distinct values are kept in the same group, so integrations can see disagreements without the extractor choosing one.

Example fragment:

```json
{
  "schema_version": "1.0",
  "documents": [
    {
      "document_id": "...",
      "filename": "marksheet.pdf",
      "document_type": "marksheet",
      "page_count": 1,
      "extraction_method": "sarvam_doc_ai_extract",
      "fields": {
        "applicant.name": {
          "value": "Kavya Test",
          "source": {
            "page": 1,
            "source_label": "Student Name",
            "evidence_text": "Kavya Test"
          }
        }
      },
      "warnings": []
    }
  ],
  "shared_fields": [
    {
      "canonical_field": "applicant.name",
      "values": ["Kavya Test"],
      "occurrences": [
        {
          "document_id": "...",
          "filename": "marksheet.pdf",
          "value": "Kavya Test",
          "source": {
            "page": 1,
            "source_label": "Student Name",
            "evidence_text": "Kavya Test"
          }
        }
      ]
    }
  ],
  "warnings": []
}
```

Canonical field names and aliases are maintained in `reader/registry.py`. For example, `name`, `student name`, and `user` map to `applicant.name`; phone label variants map to `applicant.phone_number`.

## Limits and data handling

- PDF only; maximum 20 MB and 10 pages per document by default.
- The module processes uploads in memory and does not persist PDFs or extraction results.
- Sarvam receives document bytes for extraction. Use the provider only where its data handling is approved for the documents being processed.
- The extractor returns model-extracted data; it does not authenticate certificates, decide eligibility, or verify values against government/bank systems.
- API errors are returned as HTTP errors. Completed partial provider jobs return available fields plus a warning.
- Configure `SARVAM_LANGUAGE` (default `en-IN`), `SARVAM_POLL_INTERVAL_SECONDS` (default 10), `SARVAM_JOB_TIMEOUT_SECONDS` (default 240), `MAX_UPLOAD_MB` (default 20), and `MAX_PDF_PAGES` (default 10, capped at Sarvam's 10-page limit).
