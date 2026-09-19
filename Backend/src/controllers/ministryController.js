const Application = require('../models/Application');
const Scheme = require('../models/Scheme');
const SanctionLetter = require('../models/SanctionLetter');

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
        const appIdsToUpdate = [];

        applications.forEach((app, index) => {
            appIdsToUpdate.push(app._id);

            // Mask the Aadhaar number (e.g., show only last 4 digits)
            const aadhaar = app.applicantId?.aadhaarNumber || '000000000000';
            const maskedAadhaar = `XXXX-XXXX-${aadhaar.slice(-4)}`;

            // Generate a random transaction ref for the demo
            const randomRef = Math.floor(1000000 + Math.random() * 9000000);

            sanctionLettersToInsert.push({
                sanctionNumber: `MoTA/2026/${app.schemeId._id.toString().slice(-5).toUpperCase()}/${10000 + index}`,
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
                }
            });
        });

        // 1. Bulk insert the new Sanction Letters
        await SanctionLetter.insertMany(sanctionLettersToInsert);

        // 2. Update all provided applications to 'MINISTRY_APPROVED'
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
