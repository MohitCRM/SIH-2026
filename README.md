# Ministry of Tribal Affairs (MoTA) Scholarship Portal - SIH 2026

A modern, highly efficient, and transparent scholarship management portal built for the Ministry of Tribal Affairs (MoTA). This platform streamlines the end-to-end lifecycle of scholarship applications—from student submission to nodal verification and final fund disbursement by the Ministry.

## 🚀 Tech Stack
* **Frontend:** React (Vite), Tailwind CSS, DaisyUI (Dracula theme for a modern, high-contrast aesthetic), Lucide Icons, react-i18next (multi-language support)
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (via Mongoose) - chosen for its flexible document schema to easily accommodate dynamically changing scholarship scheme requirements.

---

## 🔄 End-to-End Workflow

The application architecture is divided into three distinct role-based portals. Below is the complete lifecycle of a scholarship application.

### 1. Applicant Portal (The Student)
The student logs into the portal to discover active schemes and apply for them. The application process is designed as a user-friendly, multi-stage wizard.

* **Stage 1 (Identity):** The student inputs their Aadhaar and Bank details, and uploads their Bank Passbook. (In production, this triggers AI OCR for automated data extraction).
* **Stage 2 (Eligibility):** The student uploads essential certificates like Caste (ST/PVTG) and Family Income certificates.
* **Stage 3 (Academic):** The student enters their institute details, course info, and qualifying exam marks, then uploads the marksheet, bona fide certificate, and fee receipts.
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
* **Bulk Disbursement:** 
  * The Ministry admin selects the approved candidates from the Merit List.
  * Clicking **"Bulk Approve & Disburse"** changes the application statuses to `MINISTRY_APPROVED`.
  * This action simultaneously generates official Digital Sanction Letters in the database and triggers the Direct Benefit Transfer (DBT) pipeline to send funds directly to the students' bank accounts.

---

## 🌐 Multi-Language Support (English / हिन्दी)

The entire portal supports English and Hindi, powered by `react-i18next`.

* **Switching languages:** A language toggle (showing full names — "English" / "हिन्दी", not abbreviations) is available in the navbar on every portal, and as a floating control on the role-selection screen.
* **Persistence:** The selected language is saved to `localStorage` and restored automatically on refresh or return visits.
* **Coverage:** All UI text is translated — navigation, dashboards, the full 4-stage applicant wizard (including the Stage 4 declaration), Officer verification dialogs, and Ministry bulk-approval/disbursement dialogs.
* **Design note:** Application status labels (`DRAFT`, `SUBMITTED`, `DEFICIENCY`, `APPROVED`) are intentionally kept in English across both languages, since they double as internal status codes referenced elsewhere in the system.
* **Setup:** After pulling this branch, run `npm install` in `Frontend/vite` to pick up the new `react-i18next`/`i18next` dependencies before starting the dev server.

## 🎨 UI/UX Design System
The entire portal was refactored using **DaisyUI** on top of Tailwind CSS. We implemented a unified, sleek, modern dark theme (Dracula) across all portals. 

Key UI elements include:
* **Drawers:** Fully responsive sidebars for navigation.
* **Stats Components:** Clean, distinct metric cards on all dashboards.
* **Zebra Tables:** High-contrast data tables for managing dense lists of applications.
* **Step Components:** Clear visual progress tracking for the applicant forms.
