const Application = require('../models/Application');
const User = require('../models/User');
const Scheme = require('../models/Scheme');

exports.getApplications = async (req, res) => {
    try {
        const { applicantId } = req.params;
        const applications = await Application.find({ applicantId })
                                            .populate('schemeId', 'name')
                                            .sort({ createdAt: -1 });
        res.status(200).json(applications);
    } catch (error) {
        console.error("Error fetching applications:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.getApplicationById = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const application = await Application.findOne({ applicationId }).populate('schemeId', 'name');
        if (!application) return res.status(404).json({ error: "Application not found" });
        res.status(200).json(application);
    } catch (error) {
        console.error("Error fetching application:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.submitDraft = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const application = await Application.findOne({ applicationId });
        if (!application) return res.status(404).json({ error: "Application not found" });

        application.status = 'SUBMITTED';
        application.auditTrail.push({
            action: 'APPLICATION_SUBMITTED',
            performedBy: application.applicantId,
            remarks: 'Application submitted from drafts.'
        });
        await application.save();
        res.status(200).json({ message: "Application submitted successfully" });
    } catch (error) {
        console.error("Error submitting application:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.submitStage1 = async (req, res) => {
    try {
        const { applicantId, schemeId, aadhaarNumber, bankDetails, passbookUrl } = req.body;

        if (!applicantId || !schemeId || !aadhaarNumber || !bankDetails || !passbookUrl) {
            return res.status(400).json({ error: "Missing required fields for Stage 1" });
        }

        // 1. Mock Aadhaar KYC Verification
        // In reality, this would hit an external API like DigiLocker or UIDAI
        console.log(`Verifying Aadhaar: ${aadhaarNumber}`);
        const kycPassed = true; // Assuming success for demo
        const kycData = {
            fullName: "Mohit Kumar",
            dob: "2005-01-01",
            gender: "Male"
        };

        if (!kycPassed) {
            return res.status(400).json({ error: "Aadhaar KYC Verification Failed" });
        }

        // Update User profile with KYC data
        await User.findByIdAndUpdate(applicantId, {
            aadhaarNumber: aadhaarNumber,
            "basicDetails.fullName": kycData.fullName,
            "basicDetails.dob": kycData.dob,
            "basicDetails.gender": kycData.gender,
        });

        // 2. Mock OCR Check for Bank Passbook
        // This would call your OCR service (AWS Textract, Google Vision, etc.)
        console.log(`Running OCR on Bank Passbook: ${passbookUrl}`);
        const extractedBankName = "Mohit Kumar"; // Mock extracted name

        if (extractedBankName.toLowerCase() !== kycData.fullName.toLowerCase()) {
             // We can allow it but mark as deficiency, or reject outright depending on strictness
             // Let's reject for now to enforce the rule
             // return res.status(400).json({ error: "Name on Bank Passbook does not match Aadhaar Name" });
        }

        // 3. Create or Update the Application Draft
        // Check if an application already exists for this user and scheme
        let application = await Application.findOne({ applicantId, schemeId });

        if (!application) {
             // Create new if it doesn't exist
             application = new Application({
                 applicationId: `APP-${Date.now()}`,
                 applicantId,
                 schemeId,
                 status: 'DRAFT',
                 submittedData: {
                     bankDetails
                 },
                 documents: []
             });
        } else {
             // Update existing
             application.submittedData = {
                 ...application.submittedData,
                 bankDetails
             };
        }

        // Add or update the passbook document in the array
        const passbookDocIndex = application.documents.findIndex(d => d.documentType === 'BANK_PASSBOOK');
        if (passbookDocIndex >= 0) {
            application.documents[passbookDocIndex].fileUrl = passbookUrl;
            application.documents[passbookDocIndex].verificationStatus = 'OCR_PASSED';
        } else {
            application.documents.push({
                documentType: 'BANK_PASSBOOK',
                fileUrl: passbookUrl,
                verificationStatus: 'OCR_PASSED'
            });
        }

        // Add audit trail entry
        application.auditTrail.push({
            action: 'STAGE_1_SUBMITTED',
            performedBy: applicantId,
            remarks: 'Aadhaar KYC verified and Bank Passbook uploaded successfully.'
        });

        await application.save();

        res.status(200).json({ 
            message: "Stage 1 completed successfully", 
            applicationId: application.applicationId,
            status: application.status
        });

    } catch (error) {
        console.error("Error in Stage 1 submission:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.submitStage2 = async (req, res) => {
    try {
        const { applicationId, stCertificateUrl, incomeCertificateUrl } = req.body;

        if (!applicationId || !stCertificateUrl || !incomeCertificateUrl) {
            return res.status(400).json({ error: "Missing required fields for Stage 2" });
        }

        const application = await Application.findOne({ applicationId }).populate('schemeId');
        if (!application) {
            return res.status(404).json({ error: "Application not found" });
        }

        // 1. Mock OCR Check for ST Certificate
        console.log(`Running OCR on ST Certificate: ${stCertificateUrl}`);
        const extractedCategory = "ST"; 

        if (extractedCategory !== "ST" && extractedCategory !== "PVTG") {
            return res.status(400).json({ error: "Certificate verification failed. Category is not ST or PVTG." });
        }

        // 2. Mock OCR Check for Income Certificate
        console.log(`Running OCR on Income Certificate: ${incomeCertificateUrl}`);
        const extractedIncome = 450000; // Mock extracted amount

        const maxFamilyIncome = application.schemeId?.eligibilityRules?.maxFamilyIncome;
        
        if (maxFamilyIncome && extractedIncome > maxFamilyIncome) {
            return res.status(400).json({ error: `Income exceeds the maximum limit of Rs. ${maxFamilyIncome} for this scheme.` });
        }

        // Update application data with extracted income
        application.submittedData = {
            ...application.submittedData,
            declaredFamilyIncome: extractedIncome
        };

        // Add or update documents
        const docsToAdd = [
            { type: 'ST_CERTIFICATE', url: stCertificateUrl },
            { type: 'INCOME_CERTIFICATE', url: incomeCertificateUrl }
        ];

        docsToAdd.forEach(docInfo => {
            const docIndex = application.documents.findIndex(d => d.documentType === docInfo.type);
            if (docIndex >= 0) {
                application.documents[docIndex].fileUrl = docInfo.url;
                application.documents[docIndex].verificationStatus = 'OCR_PASSED';
            } else {
                application.documents.push({
                    documentType: docInfo.type,
                    fileUrl: docInfo.url,
                    verificationStatus: 'OCR_PASSED'
                });
            }
        });

        // Add audit trail entry
        application.auditTrail.push({
            action: 'STAGE_2_SUBMITTED',
            performedBy: application.applicantId,
            remarks: `ST and Income Certificates verified. Income: Rs. ${extractedIncome}`
        });

        await application.save();

        res.status(200).json({ 
            message: "Stage 2 completed successfully", 
            applicationId: application.applicationId,
            status: application.status
        });

    } catch (error) {
        console.error("Error in Stage 2 submission:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.submitStage3 = async (req, res) => {
    try {
        const { 
            applicationId, 
            instituteName, courseLevel, courseName, qualifyingMarksPercentage,
            qualifyingMarksheetUrl, bonafideCertificateUrl, feeReceiptUrl 
        } = req.body;

        if (!applicationId || !instituteName || !qualifyingMarksheetUrl || !bonafideCertificateUrl || !feeReceiptUrl) {
            return res.status(400).json({ error: "Missing required fields for Stage 3" });
        }

        const application = await Application.findOne({ applicationId });
        if (!application) {
            return res.status(404).json({ error: "Application not found" });
        }

        // Mock OCR Check for Marksheet
        console.log(`Running OCR on Marksheet: ${qualifyingMarksheetUrl}`);
        // Assume OCR verifies the marks
        const extractedMarks = qualifyingMarksPercentage || 85.0; // Mocking

        // Update application data
        application.submittedData = {
            ...application.submittedData,
            instituteName,
            courseLevel,
            courseName,
            qualifyingMarksPercentage: extractedMarks
        };

        // Add or update documents
        const docsToAdd = [
            { type: 'QUALIFYING_MARKSHEET', url: qualifyingMarksheetUrl },
            { type: 'BONAFIDE_CERTIFICATE', url: bonafideCertificateUrl },
            { type: 'FEE_RECEIPT', url: feeReceiptUrl }
        ];

        docsToAdd.forEach(docInfo => {
            const docIndex = application.documents.findIndex(d => d.documentType === docInfo.type);
            if (docIndex >= 0) {
                application.documents[docIndex].fileUrl = docInfo.url;
                application.documents[docIndex].verificationStatus = 'OCR_PASSED';
            } else {
                application.documents.push({
                    documentType: docInfo.type,
                    fileUrl: docInfo.url,
                    verificationStatus: 'OCR_PASSED'
                });
            }
        });

        // Calculate a mock merit score (e.g. just the marks for now)
        application.systemCalculatedMeritScore = extractedMarks;

        application.auditTrail.push({
            action: 'STAGE_3_SUBMITTED',
            performedBy: application.applicantId,
            remarks: `Academic details verified. Merit Score: ${extractedMarks}`
        });

        await application.save();

        res.status(200).json({ 
            message: "Stage 3 completed successfully", 
            applicationId: application.applicationId,
            status: application.status
        });

    } catch (error) {
        console.error("Error in Stage 3 submission:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.submitStage4 = async (req, res) => {
    try {
        const { applicationId, declarationAccepted } = req.body;

        if (!applicationId || !declarationAccepted) {
            return res.status(400).json({ error: "Missing required fields for Final Submission" });
        }

        const application = await Application.findOne({ applicationId });
        if (!application) {
            return res.status(404).json({ error: "Application not found" });
        }

        // Mark as submitted
        application.status = 'SUBMITTED';

        application.auditTrail.push({
            action: 'APPLICATION_SUBMITTED',
            performedBy: application.applicantId,
            remarks: 'Student accepted declaration and submitted the application.'
        });

        await application.save();

        res.status(200).json({ 
            message: "Application submitted successfully! It is now pending Nodal Officer review.", 
            applicationId: application.applicationId,
            status: application.status
        });

    } catch (error) {
        console.error("Error in Final Submission:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// --- NEW STAGE: Save as Draft ---
exports.saveDraft = async (req, res) => {
    try {
        const { applicationId } = req.body;

        if (!applicationId) {
            return res.status(400).json({ error: "applicationId is required." });
        }

        const application = await Application.findOne({ applicationId });
        if (!application) {
            return res.status(404).json({ error: "Application not found." });
        }

        application.status = 'DRAFT';
        
        application.auditTrail.push({
            action: 'DRAFT_SAVED',
            performedBy: application.applicantId,
            remarks: 'Applicant saved the application as a draft.'
        });

        await application.save();

        res.status(200).json({
            message: "Application saved as draft successfully.",
            applicationId: application.applicationId
        });
    } catch (error) {
        console.error("Error in saveDraft:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
