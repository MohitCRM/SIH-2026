# Ministry of Tribal Affairs (MoTA) Scholarship Portal - SIH 2026

A modern, highly efficient, and transparent scholarship management portal built for the Ministry of Tribal Affairs (MoTA). This platform streamlines the end-to-end lifecycle of scholarship applications—from student submission to nodal verification and final fund disbursement by the Ministry.

## 🚀 Tech Stack
* **Frontend:** React (Vite), Tailwind CSS, DaisyUI, Lucide Icons
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (via Mongoose) 

---

## 🔄 End-to-End Workflow

The application architecture is divided into three distinct role-based portals. Below is the complete lifecycle of a scholarship application.

### 1. Applicant Portal (The Student)
The student logs into the portal to discover active schemes and apply for them. The application process is designed as a user-friendly, multi-stage wizard.

* **Stage 1 (Identity):** The student inputs their Aadhaar and Bank details, and uploads their Bank Passbook. (In production, this triggers AI OCR for automated data extraction).
* **Stage 2 (Eligibility):** The student uploads essential certificates like Caste (ST/PVTG) and Family Income certificates.
* **Stage 3 (Academic & Scheme Specific):** This stage is fully dynamic. Depending on the configured requirements of the selected scheme, the student enters relevant details (e.g., institute info, qualifying exam marks, research proposals) and uploads corresponding documents like marksheets, bona fide certificates, or fee receipts.
* **Stage 4 (Review & Submit):** The student reviews the system-calculated merit score and signs a declaration.
* **Drafts:** At any point, the student can save the application as a `DRAFT` and return later.
* **Submission:** Once "Final Submit" is clicked, the application status changes to `SUBMITTED`, and it is securely locked from further edits by the student.

### 2. Nodal Officer Portal (The Verifier)
Once an application is submitted, it lands on the dashboard of the assigned Nodal Officer (e.g., at the Institute or State level).

* **Dashboard Tracking:** Officers see macro-metrics of applications pending review and applications processed today.
* **Verification Mode:** Clicking "Verify" opens a highly optimized side-by-side Verification View.
  * **Left Pane:** An embedded iframe document viewer allowing the officer to rapidly cycle through the student's uploaded PDFs/Images.
  * **Right Pane:** The extracted, system-verified data (Aadhaar, Income, Bank Account) for cross-referencing.
* **Actions:** The officer can either:
  1. **Mark Defective:** Sends it back to the student for corrections.
  2. **Approve & Forward:** Changes the status to `NODAL_APPROVED` and pushes it up the chain to the Ministry.

### 3. Ministry Portal (The Administrator)
The top level of the hierarchy. Ministry administrators do not verify individual documents; instead, they manage schemes globally and execute bulk disbursements.

* **Macro Dashboard:** Displays total funds disbursed (₹ Cr), total beneficiaries reached, and DBT success rates.
* **Merit Lists:** For each scheme, the system compiles a Merit List of all `NODAL_APPROVED` applications, automatically ranked by their System Calculated Merit Score.
* **Bulk Disbursement & Sanction Letters:** 
  * The Ministry admin selects the approved candidates from the Merit List.
  * Clicking **"Bulk Approve"** changes the application statuses to `MINISTRY_APPROVED`.
  * The system simultaneously generates an official **Digital Sanction Letter** for each student, embedding a unique **QR Code** pointing to an unauthenticated, public verification endpoint.
* **PFMS (DBT) Simulation:** 
  * Clicking **"Disburse Funds"** simulates a connection to the NPCI/PFMS gateway, moving statuses to `FUND_DISBURSED` and generating realistic audit trails with simulated Transaction Reference IDs.
---


