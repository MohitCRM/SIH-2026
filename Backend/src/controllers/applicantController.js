const Application = require('../models/Application');
const User = require('../models/User');
const Scheme = require('../models/Scheme');

exports.getAllSchemes = async (req, res) => {
    try {
        const schemes = await Scheme.find({ status: 'ACTIVE' });
        res.status(200).json(schemes);
    } catch (error) {
        console.error("Error fetching schemes:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

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
        const { applicantId, schemeId, aadhaarUrl, mobileNumber, emailAddress } = req.body;

        const missingFields = [];
        if (!applicantId) missingFields.push("applicantId");
        if (!schemeId) missingFields.push("schemeId");
        if (!aadhaarUrl) missingFields.push("aadhaarUrl");
        if (!mobileNumber) missingFields.push("mobileNumber");
        if (!emailAddress) missingFields.push("emailAddress");

        if (missingFields.length > 0) {
            return res.status(400).json({ error: `Missing required fields for Stage 1: ${missingFields.join(", ")}` });
        }

        // 1. Mock Aadhaar OCR Verification
        console.log(`Running OCR on Aadhaar: ${aadhaarUrl}`);
        const kycPassed = true; // Assuming success for demo
        const kycData = {
            fullName: "Mohit M",
            dob: "2005-01-01",
            gender: "MALE",
            domicileState: "Telangana",
            aadhaarNumber: "123456789012"
        };

        if (!kycPassed) {
            return res.status(400).json({ error: "Aadhaar KYC Verification Failed" });
        }

        // Update User profile with KYC data
        await User.findByIdAndUpdate(applicantId, {
            aadhaarNumber: kycData.aadhaarNumber,
            "basicDetails.fullName": kycData.fullName,
            "basicDetails.dob": kycData.dob,
            "basicDetails.gender": kycData.gender,
            mobileNumber,
            emailAddress
        });

        // Create or Update the Application Draft
        let application = await Application.findOne({ applicantId, schemeId });

        if (!application) {
            application = new Application({
                applicationId: `APP-${Date.now()}`,
                applicantId,
                schemeId,
                status: 'STAGE1_SUBMITTED',
                personalInformation: {
                    applicantName: kycData.fullName,
                    dateOfBirth: kycData.dob,
                    gender: kycData.gender,
                    mobileNumber,
                    emailAddress,
                    domicileState: kycData.domicileState
                },
                financialAndBankingInformation: {
                    aadhaarNumber: kycData.aadhaarNumber
                },
                documents: []
            });
        } else {
            application.status = 'STAGE1_SUBMITTED';
            if (!application.personalInformation) application.personalInformation = {};
            application.personalInformation.applicantName = kycData.fullName;
            application.personalInformation.dateOfBirth = kycData.dob;
            application.personalInformation.gender = kycData.gender;
            application.personalInformation.mobileNumber = mobileNumber;
            application.personalInformation.emailAddress = emailAddress;
            application.personalInformation.domicileState = kycData.domicileState;
            
            if (!application.financialAndBankingInformation) application.financialAndBankingInformation = {};
            application.financialAndBankingInformation.aadhaarNumber = kycData.aadhaarNumber;
        }

        // Add or update the documents
        const docsToAdd = [
            { type: 'AADHAAR_CARD', url: aadhaarUrl }
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

        application.auditTrail.push({
            action: 'STAGE_1_SUBMITTED',
            performedBy: applicantId,
            remarks: 'Aadhaar OCR verified and Basic Profile created.'
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
        const { applicationId, casteCertificateUrl, domicileCertificateUrl, disabilityCertificateUrl } = req.body;

        if (!applicationId || !casteCertificateUrl || !domicileCertificateUrl) {
            return res.status(400).json({ error: "Missing required fields for Stage 2" });
        }

        const application = await Application.findOne({ applicationId }).populate('schemeId');
        if (!application) {
            return res.status(404).json({ error: "Application not found" });
        }

        // 1. Mock OCR Check for Caste Certificate
        console.log(`Running OCR on Caste Certificate: ${casteCertificateUrl}`);
        const extractedCategory = "ST";

        if (extractedCategory !== "ST" && extractedCategory !== "PVTG") {
            return res.status(400).json({ error: "Certificate verification failed. Category is not ST or PVTG." });
        }

        // 2. Mock OCR Check for Domicile Certificate
        console.log(`Running OCR on Domicile Certificate: ${domicileCertificateUrl}`);
        const extractedState = "Delhi";

        // 3. Mock OCR Check for Disability Certificate (Optional)
        let isDivyangjan = false;
        if (disabilityCertificateUrl) {
            console.log(`Running OCR on Disability Certificate: ${disabilityCertificateUrl}`);
            isDivyangjan = true;
        }

        application.status = 'STAGE2_SUBMITTED';
        if (!application.personalInformation) application.personalInformation = {};
        application.personalInformation.category = extractedCategory;
        application.personalInformation.domicileState = extractedState;
        application.personalInformation.isDivyangjan = isDivyangjan;

        // Add or update documents
        const docsToAdd = [
            { type: 'CASTE_CERTIFICATE', url: casteCertificateUrl },
            { type: 'DOMICILE_CERTIFICATE', url: domicileCertificateUrl }
        ];

        if (disabilityCertificateUrl) {
            docsToAdd.push({ type: 'DISABILITY_CERTIFICATE', url: disabilityCertificateUrl });
        }

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
            remarks: `Caste and Domicile Certificates verified.`
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
            incomeCertificateUrl, passbookUrl, panCardUrl, isAadhaarLinkedToBank
        } = req.body;

        if (!applicationId || !incomeCertificateUrl || !passbookUrl || !panCardUrl) {
            return res.status(400).json({ error: "Missing required fields for Stage 3 (Income, Passbook, PAN)" });
        }

        const application = await Application.findOne({ applicationId }).populate('schemeId');
        if (!application) {
            return res.status(404).json({ error: "Application not found" });
        }

        // 1. Mock OCR Check for Income Certificate
        console.log(`Running OCR on Income Certificate: ${incomeCertificateUrl}`);
        const extractedIncome = 450000; // Mock extracted amount
        const maxFamilyIncome = application.schemeId?.eligibilityRules?.maxFamilyIncome;

        if (maxFamilyIncome && extractedIncome > maxFamilyIncome) {
            return res.status(400).json({ error: `Income exceeds the maximum limit of Rs. ${maxFamilyIncome} for this scheme.` });
        }

        // 2. Mock API Fetch for PAN Card (Income Tax Dept Verification)
        console.log(`Running OCR on PAN Card: ${panCardUrl} and verifying with IT Dept API`);
        const extractedPanNumber = "ABCDE1234F"; // Mock PAN extraction

        // 3. Mock OCR Check for Bank Passbook
        console.log(`Running OCR on Bank Passbook: ${passbookUrl}`);
        const extractedAccountNumber = "1234567890";
        const extractedIfscCode = "SBIN0001234";

        // Update application data
        application.status = 'STAGE3_SUBMITTED';
        if (!application.financialAndBankingInformation) application.financialAndBankingInformation = {};
        application.financialAndBankingInformation.familyIncome = extractedIncome;
        application.financialAndBankingInformation.panNumber = extractedPanNumber;
        application.financialAndBankingInformation.bankAccountNumber = extractedAccountNumber;
        application.financialAndBankingInformation.bankIfscCode = extractedIfscCode;
        application.financialAndBankingInformation.isAadhaarLinkedToBank = isAadhaarLinkedToBank;

        // Add or update documents
        const docsToAdd = [
            { type: 'INCOME_CERTIFICATE', url: incomeCertificateUrl },
            { type: 'BANK_PASSBOOK', url: passbookUrl },
            { type: 'PAN_CARD', url: panCardUrl }
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

        application.auditTrail.push({
            action: 'STAGE_3_SUBMITTED',
            performedBy: application.applicantId,
            remarks: `Income and Bank details verified.`
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
        const { applicationId, dynamicData } = req.body;

        if (!applicationId || !dynamicData) {
            return res.status(400).json({ error: "Missing required fields for Stage 4" });
        }

        const application = await Application.findOne({ applicationId });
        if (!application) {
            return res.status(404).json({ error: "Application not found" });
        }

        // Search dynamicData for possible file uploads and move to documents array
        for (const [key, value] of Object.entries(dynamicData)) {
            if (typeof value === 'string' && (value.includes('.pdf') || value.includes('.jpg') || value.includes('mock-s3-url'))) {
                const docType = key.toUpperCase();
                const docIndex = application.documents.findIndex(d => d.documentType === docType);
                
                // TODO: Perform Async OCR processing here
                // const ocrResult = await processOCR(value, docType);
                // 
                // 
                
                if (docIndex >= 0) {
                    application.documents[docIndex].fileUrl = value;
                    application.documents[docIndex].verificationStatus = 'PENDING'; // update this based on OCR
                } else {
                    application.documents.push({
                        documentType: docType,
                        fileUrl: value,
                        verificationStatus: 'PENDING' // update this based on OCR
                    });
                }
            }
        }

        application.schemeSpecificData = { ...application.schemeSpecificData, ...dynamicData };
        application.status = 'STAGE4_SUBMITTED';

        application.auditTrail.push({
            action: 'STAGE_4_SUBMITTED',
            performedBy: application.applicantId,
            remarks: `Scheme specific dynamic fields submitted.`
        });

        await application.save();

        res.status(200).json({
            message: "Stage 4 completed successfully",
            applicationId: application.applicationId,
            status: application.status
        });

    } catch (error) {
        console.error("Error in Stage 4 submission:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.submitFinal = async (req, res) => {
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

exports.deleteDraft = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const application = await Application.findOne({ applicationId });
        if (!application) {
            return res.status(404).json({ error: "Application not found" });
        }
        const draftStatuses = ['DRAFT', 'STAGE1_SUBMITTED', 'STAGE2_SUBMITTED', 'STAGE3_SUBMITTED'];
        if (!draftStatuses.includes(application.status)) {
            return res.status(400).json({ error: "Only drafts can be deleted" });
        }
        await Application.deleteOne({ applicationId });
        res.status(200).json({ message: "Draft deleted successfully" });
    } catch (error) {
        console.error("Error deleting draft:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const Message = require('../models/Message');

exports.getMessages = async (req, res) => {
    try {
        const { applicantId } = req.params;
        const messages = await Message.find({ userId: applicantId }).sort({ createdAt: -1 });
        res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        const { applicantId } = req.params;
        // Delete all applications for this applicant
        await Application.deleteMany({ applicantId });
        // Delete all messages
        await Message.deleteMany({ userId: applicantId });
        // Delete the user
        await User.findByIdAndDelete(applicantId);
        
        res.status(200).json({ message: "Account and all associated data deleted successfully" });
    } catch (error) {
        console.error("Error deleting account:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
