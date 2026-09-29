"""Canonical field names and contextual label aliases.

Aliases are hints for the LLM. Context still matters: e.g. "name" may be the
applicant, parent, institution, or issuing officer.
"""

FIELD_REGISTRY: dict[str, list[str]] = {
    "applicant.name": ["name", "student name", "candidate name", "name of holder", "user"],
    "applicant.phone_number": ["phone number", "ph. number", "mobile", "contact number", "telephone"],
    "applicant.date_of_birth": ["date of birth", "dob", "birth date"],
    "applicant.address": ["address", "residential address", "permanent address"],
    "applicant.category_or_tribe": ["scheduled tribe", "tribe", "community", "caste", "category"],
    "certificate.number": ["certificate number", "certificate no", "serial number", "reference number"],
    "certificate.issuing_authority": ["issuing authority", "issued by", "competent authority"],
    "certificate.issue_date": ["date of issue", "issue date", "issued on"],
    "education.institution": ["institution", "school", "college", "university"],
    "education.examination": ["examination", "exam", "course", "qualification"],
    "education.academic_year": ["academic year", "year of passing", "passing year"],
    "education.roll_number": ["roll number", "roll no", "registration number", "enrollment number"],
    "education.total_marks": ["total marks", "maximum marks", "marks obtained"],
    "education.percentage": ["percentage", "aggregate percentage", "overall percentage"],
    "education.result": ["result", "grade", "division", "pass/fail"],
    "education.subject_marks": ["subject marks", "marks by subject", "subject-wise marks"],
}

DOCUMENT_TYPES = ["marksheet", "scheduled_tribe_certificate", "income_certificate", "identity_document", "other", "unknown"]

FIELD_DESCRIPTIONS: dict[str, str] = {
    "applicant.name": "Full name of the applicant/student/holder, not a parent, institution, or issuing officer.",
    "applicant.phone_number": "Applicant phone or mobile number, preserving country/area code when printed.",
    "applicant.date_of_birth": "Applicant date of birth, exactly as printed.",
    "applicant.address": "Applicant residential or permanent address.",
    "applicant.category_or_tribe": "Scheduled Tribe/community/tribe/category exactly as printed for the applicant.",
    "certificate.number": "Identifier or serial number of the certificate itself.",
    "certificate.issuing_authority": "Authority or official office that issued the certificate.",
    "certificate.issue_date": "Date on which the certificate was issued.",
    "education.institution": "School, college, university, board, or other issuing educational institution.",
    "education.examination": "Examination or qualification named on the marksheet.",
    "education.academic_year": "Academic, examination, or passing year exactly as printed.",
    "education.roll_number": "Student roll, registration, or enrollment number.",
    "education.total_marks": "Marks obtained or maximum total marks; retain the printed label in source evidence.",
    "education.percentage": "Overall aggregate percentage exactly as printed or numerically represented.",
    "education.result": "Overall result, grade, or division exactly as printed.",
    "education.subject_marks": "Subject-wise rows with subject, marks obtained, maximum marks, and grade where present.",
}

FIELD_TYPES: dict[str, str] = {
    "education.subject_marks": "array",
}
