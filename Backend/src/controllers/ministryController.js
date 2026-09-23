const Application = require('../models/Application');
const Scheme = require('../models/Scheme');
const SanctionLetter = require('../models/SanctionLetter');
const Message = require('../models/Message');

exports.generateMeritList = async (req, res) => {
    try {
        const { schemeId } = req.params;

        // Note: schemeId here should be the custom string ID or ObjectId. 
        let scheme;
        try {
            scheme = await Scheme.findById(schemeId);
        } catch (e) {
            scheme = await Scheme.findOne({ schemeId: schemeId });
        }

        if (!scheme) {
            return res.status(404).json({ error: "Scheme not found" });
        }

        // Fetch all Nodal Approved applications for this scheme
        const applications = await Application.find({ schemeId: scheme._id, status: 'NODAL_APPROVED' })
            .populate('applicantId', 'basicDetails contact')
            .sort({ systemCalculatedMeritScore: -1 }); // Sort descending by merit score

        // In a full implementation, you would apply the complex reservation logic here
        // (separating into female, divyangjan, pvtg buckets based on scheme.slots).
        // For the hackathon demo, we'll slice the array based on totalSlots.

        const totalSlots = scheme.slots?.totalSlots || 20; // Defaulting to 20 like NOS scheme

        const selectedCandidates = applications.slice(0, totalSlots);
        const waitlistedCandidates = applications.slice(totalSlots);

        res.status(200).json({
            schemeName: scheme.name,
            totalSlotsAvailable: totalSlots,
            totalEligible: applications.length,
            selected: selectedCandidates, // The ones the Ministry should review and click 'Approve'
            waitlisted: waitlistedCandidates
        });

    } catch (error) {
        console.error("Error generating merit list:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const QRCode = require('qrcode');

exports.bulkApprove = async (req, res) => {
    try {
        const { applicationIds, ministryUserId } = req.body;

        if (!applicationIds || !Array.isArray(applicationIds)) {
            return res.status(400).json({ error: "Please provide an array of applicationIds to approve." });
        }

        // Fetch applications to get their ObjectIds and related data for the sanction letters
        const applications = await Application.find({ applicationId: { $in: applicationIds }, status: 'NODAL_APPROVED' })
            .populate('applicantId', 'basicDetails aadhaarNumber')
            .populate('schemeId', 'name');

        if (applications.length === 0) {
            return res.status(400).json({ error: "No eligible NODAL_APPROVED applications found for the provided IDs." });
        }

        const sanctionLettersToInsert = [];
        const messagesToInsert = [];
        const appIdsToUpdate = [];
        const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        for (let i = 0; i < applications.length; i++) {
            const app = applications[i];
            appIdsToUpdate.push(app._id);

            // Mask the Aadhaar number (e.g., show only last 4 digits)
            const aadhaar = app.applicantId?.aadhaarNumber || '000000000000';
            const maskedAadhaar = `XXXX-XXXX-${aadhaar.slice(-4)}`;

            // Generate a random transaction ref for the demo
            const randomRef = Math.floor(1000000 + Math.random() * 9000000);
            
            const sanctionNumber = `MoTA/2026/${app.schemeId._id.toString().slice(-5).toUpperCase()}/${10000 + i}`;
            
            // Generate QR Code containing the verification URL
            const verifyUrl = `${frontendBaseUrl}/verify-sanction/${encodeURIComponent(sanctionNumber)}`;
            let qrCodeUrl = "";
            try {
                qrCodeUrl = await QRCode.toDataURL(verifyUrl);
            } catch (err) {
                console.error("Failed to generate QR Code for", sanctionNumber, err);
            }

            sanctionLettersToInsert.push({
                sanctionNumber: sanctionNumber,
                applicationId: app._id,
                applicantId: app.applicantId._id,
                schemeId: app.schemeId._id,
                studentName: app.applicantId?.basicDetails?.fullName || "Student Name",
                instituteName: app.submittedData?.instituteName || "Indian Institute of Technology",
                schemeName: app.schemeId?.name || "Top Class Education Scheme for ST Students",
                academicYear: "2026-2027",
                financialBreakdown: {
                    tuitionFee: 120000,
                    livingExpensesAllowance: 36000,
                    booksAndStationeryAllowance: 5000,
                    computerHardwareAllowance: 45000,
                    totalSanctionedAmount: 206000
                },
                disbursementAccount: {
                    paymentMode: "Direct Benefit Transfer (DBT via PFMS)",
                    beneficiaryAadhaar: maskedAadhaar,
                    transactionRefNo: `PFMS/DBT/20260918/${randomRef}`
                },
                qrCodeUrl: qrCodeUrl
            });
            
            // Generate notification message for the applicant
            messagesToInsert.push({
                userId: app.applicantId._id,
                title: "Sanction Letter Generated",
                body: `Congratulations! Your application for ${app.schemeId?.name || 'the scheme'} has been approved by the Ministry and your digital Sanction Letter has been generated.`,
                actionUrl: `/verify-sanction/${encodeURIComponent(sanctionNumber)}`
            });
        }

        // 1. Bulk insert the new Sanction Letters
        await SanctionLetter.insertMany(sanctionLettersToInsert);
        
        // 2. Bulk insert the messages
        await Message.insertMany(messagesToInsert);

        // 3. Update all provided applications to 'MINISTRY_APPROVED'
        const result = await Application.updateMany(
            { _id: { $in: appIdsToUpdate } },
            {
                $set: { status: 'MINISTRY_APPROVED' },
                $push: {
                    auditTrail: {
                        action: 'MINISTRY_APPROVED',
                        performedBy: ministryUserId, // Ministry Admin's ID
                        remarks: 'Ministry approved based on merit list and Sanction Letter generated.'
                    }
                }
            }
        );

        res.status(200).json({
            message: `Successfully approved ${result.modifiedCount} applications and generated digital sanction letters.`,
            modifiedCount: result.modifiedCount
        });

    } catch (error) {
        console.error("Error in bulk approval:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.verifySanction = async (req, res) => {
    try {
        const { sanctionNumber } = req.params;
        const letter = await SanctionLetter.findOne({ sanctionNumber })
            .select('-disbursementAccount.transactionRefNo'); // hide sensitive internal references publicly

        if (!letter) {
            return res.status(404).json({ error: "Invalid or forged sanction letter." });
        }

        res.status(200).json(letter);
    } catch (error) {
        console.error("Error verifying sanction:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.disburseFunds = async (req, res) => {
    try {
        const { applicationIds, ministryUserId } = req.body;

        if (!applicationIds || !Array.isArray(applicationIds)) {
            return res.status(400).json({ error: "Please provide an array of applicationIds to disburse funds to." });
        }

        const applications = await Application.find({ applicationId: { $in: applicationIds }, status: 'MINISTRY_APPROVED' });

        if (applications.length === 0) {
            return res.status(400).json({ error: "No eligible MINISTRY_APPROVED applications found." });
        }

        const appIdsToUpdate = applications.map(app => app._id);

        // --- HACKATHON PFMS SIMULATION ---
        // Simulate a 2-second delay to mimic contacting PFMS/NPCI gateway
        await new Promise(resolve => setTimeout(resolve, 2000));
        const pfmsRef = `PFMS/DBT/LIVE/${Date.now()}`;
        
        // Update Applications
        const result = await Application.updateMany(
            { _id: { $in: appIdsToUpdate } },
            {
                $set: { status: 'FUND_DISBURSED' },
                $push: {
                    auditTrail: {
                        action: 'FUND_DISBURSED',
                        performedBy: ministryUserId,
                        remarks: `Funds successfully disbursed via PFMS. Ref: ${pfmsRef}`
                    }
                }
            }
        );

        // Update Sanction Letters
        await SanctionLetter.updateMany(
            { applicationId: { $in: appIdsToUpdate } },
            { $set: { status: 'DISBURSED' } }
        );

        res.status(200).json({
            message: `Successfully disbursed funds to ${result.modifiedCount} applications.`,
            transactionRef: pfmsRef
        });

    } catch (error) {
        console.error("Error disbursing funds:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
