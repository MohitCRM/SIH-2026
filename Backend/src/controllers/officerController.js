const Application = require('../models/Application');
const User = require('../models/User');

exports.getPendingApplications = async (req, res) => {
    try {
        // In a real application, you would filter by the officer's instituteId or state.
        // For the hackathon demo, we fetch all applications that are 'SUBMITTED' 
        // (meaning the student finished stage 4).
        const applications = await Application.find({ status: 'SUBMITTED' })
            .populate('applicantId', 'basicDetails.fullName aadhaarNumber contact')
            .populate('schemeId', 'name');

        res.status(200).json(applications);
    } catch (error) {
        console.error("Error fetching applications:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.getApplicationDetails = async (req, res) => {
    try {
        const { applicationId } = req.params;

        // Fetch everything so the frontend can display the data side-by-side with documents
        const application = await Application.findOne({ applicationId })
            .populate('applicantId')
            .populate('schemeId');

        if (!application) {
            return res.status(404).json({ error: "Application not found" });
        }

        res.status(200).json(application);
    } catch (error) {
        console.error("Error fetching application details:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.verifyApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { action, remarks, officerId } = req.body; 
        // Expected action: 'APPROVE', 'REJECT', 'MARK_DEFECTIVE'

        const application = await Application.findOne({ applicationId });
        if (!application) {
            return res.status(404).json({ error: "Application not found" });
        }

        if (action === 'APPROVE') {
            application.status = 'NODAL_APPROVED'; // Moves to the Ministry level
        } else if (action === 'MARK_DEFECTIVE') {
            application.status = 'DEFICIENCY_FOUND'; // Sent back to the student
        } else if (action === 'REJECT') {
             // If we want to permanently reject
             application.status = 'DEFICIENCY_FOUND'; 
        } else {
             return res.status(400).json({ error: "Invalid action. Use APPROVE or MARK_DEFECTIVE" });
        }

        // Mark the individual documents as manually verified by the human officer
        application.documents.forEach(doc => {
            if (doc.verificationStatus === 'OCR_PASSED') {
                doc.verificationStatus = 'MANUAL_VERIFIED';
            }
        });

        // Add a clear audit trail entry showing the officer took action
        application.auditTrail.push({
            action: `NODAL_OFFICER_${action}`,
            performedBy: officerId,
            remarks: remarks || `Application marked as ${action}`
        });

        await application.save();

        res.status(200).json({
            message: `Application ${action} successfully.`,
            applicationId: application.applicationId,
            status: application.status
        });

    } catch (error) {
        console.error("Error verifying application:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
