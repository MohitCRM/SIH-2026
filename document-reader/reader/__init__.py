"""Standalone PDF-to-structured-data extraction module."""

from .service import extract_document, extract_documents

__all__ = ["extract_document", "extract_documents"]
