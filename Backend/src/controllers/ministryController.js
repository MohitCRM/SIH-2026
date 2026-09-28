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
                instituteName: app.schemeSpecificData?.instituteName || "Indian Institute of Technology",
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

exports.extractSchemeDetails = async (req, res) => {
    try {
        const { documentUrl } = req.body;
        if (!documentUrl) {
            return res.status(400).json({ error: "No document provided for extraction" });
        }

        // Simulating Agent extraction
        console.log(`[AI AGENT] Parsing Scheme Guidelines from: ${documentUrl}`);
        
        // Mock output from LLM analyzing the PDF
        const extractedData = {
            name: "New AI Extracted Scheme",
            description: "Automatically parsed from scheme guidelines document.",
            eligibilityRules: {
                maxFamilyIncome: 500000,
                minAge: 18,
                maxAge: 35
            },
            dynamicFields: [
                { key: "instituteName", label: "Institute Name", type: "text", required: true },
                { key: "courseName", label: "Course Name", type: "text", required: true },
                { key: "marksheet", label: "Previous Year Marksheet", type: "file", required: true },
                { key: "offerLetter", label: "University Offer Letter", type: "file", required: false }
            ]
        };

        res.status(200).json(extractedData);
    } catch (error) {
        console.error("Error in AI extraction:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.createScheme = async (req, res) => {
    try {
        const { name, description, eligibilityRules, dynamicFields } = req.body;
        
        const newSchemeId = `SCHEME_${Date.now()}`;
        
        const newScheme = new Scheme({
            schemeId: newSchemeId,
            name: name || "Untitled Scheme",
            description: description || "",
            eligibilityRules: eligibilityRules || {},
            dynamicFields: dynamicFields || []
        });

        await newScheme.save();
        res.status(201).json({ message: "Scheme created successfully", scheme: newScheme });
    } catch (error) {
        console.error("Error creating scheme:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.getDashboardAnalytics = async (req, res) => {
    try {
        // Aggregate real data from MongoDB
        const totalApplications = await Application.countDocuments();
        
        // Funnel stats
        const pendingAI = await Application.countDocuments({ status: 'SUBMITTED' });
        const pendingManual = await Application.countDocuments({ status: 'AI_VERIFIED' });
        const deficient = await Application.countDocuments({ status: 'DEFICIENCY_FOUND' });
        const readyForMerit = await Application.countDocuments({ status: { $in: ['NODAL_APPROVED', 'MINISTRY_APPROVED'] } });

        // AI efficiency & DBT
        // For hackathon purposes, calculate percentages based on total applications if non-zero
        // If DB is mostly empty, provide realistic mock fallbacks so dashboard isn't blank
        const aiVerifiedCount = await Application.countDocuments({ status: { $in: ['AI_VERIFIED', 'NODAL_APPROVED', 'MINISTRY_APPROVED', 'FUND_DISBURSED'] } });
        const aiRate = totalApplications > 0 ? ((aiVerifiedCount / totalApplications) * 100).toFixed(1) : 87.4;

        const dbtReadyCount = await Application.countDocuments({ 'financialAndBankingInformation.isAadhaarLinkedToBank': true });
        const approvedCount = await Application.countDocuments({ status: { $in: ['NODAL_APPROVED', 'MINISTRY_APPROVED', 'FUND_DISBURSED'] } });
        const dbtRate = approvedCount > 0 ? ((dbtReadyCount / approvedCount) * 100).toFixed(1) : 94.2;

        const dropOffRate = 12.1; // Static mock for now unless we track historical dropoffs

        // Slots / Quota Fulfillment
        const femaleTotal = 5000;
        const femaleFilled = await Application.countDocuments({ 'personalInformation.gender': 'FEMALE', status: { $in: ['NODAL_APPROVED', 'MINISTRY_APPROVED', 'FUND_DISBURSED'] } });
        const femalePct = femaleTotal > 0 ? Math.round((femaleFilled / femaleTotal) * 100) : 88; // fallback to 88

        const pvtgTotal = 2000;
        const pvtgFilled = await Application.countDocuments({ 'personalInformation.category': 'PVTG', status: { $in: ['NODAL_APPROVED', 'MINISTRY_APPROVED', 'FUND_DISBURSED'] } });
        const pvtgPct = pvtgTotal > 0 ? Math.round((pvtgFilled / pvtgTotal) * 100) : 42; // fallback to 42

        const divyangjanTotal = 1000;
        const divyangjanFilled = await Application.countDocuments({ 'personalInformation.isDivyangjan': true, status: { $in: ['NODAL_APPROVED', 'MINISTRY_APPROVED', 'FUND_DISBURSED'] } });
        const divyangjanPct = divyangjanTotal > 0 ? Math.round((divyangjanFilled / divyangjanTotal) * 100) : 95; // fallback to 95

        // Schemes Action Table Data
        // Just fetch active schemes and summarize
        const schemes = await Scheme.find({});
        const schemesData = await Promise.all(schemes.map(async (s) => {
            const pendingMeritCount = await Application.countDocuments({ schemeId: s._id, status: 'NODAL_APPROVED' });
            return {
                id: s._id,
                nameKey: s.name,
                pendingLists: pendingMeritCount,
                totalDisbursed: '₹0.0 Cr' // Assuming no real transactions mapped yet
            };
        }));
        
        // Add fallbacks if DB is empty for UI appeal
        if (schemesData.length === 0) {
            schemesData.push(
                { id: "64a7d3a2b3c4d5e6f7a8b9c0", nameKey: 'Top Class Education for ST Students', pendingLists: 1, totalDisbursed: '₹14.2 Cr' },
                { id: 'nos', nameKey: 'National Overseas Scholarship (NOS)', pendingLists: 0, totalDisbursed: '₹8.5 Cr' },
                { id: 'nfst', nameKey: 'National Fellowship for ST (NFST)', pendingLists: 0, totalDisbursed: '₹22.1 Cr' }
            );
        }

        res.status(200).json({
            macro: {
                aiRate: aiRate,
                dbtRate: dbtRate,
                totalDisbursed: "₹44.8 Cr",
                dropOffRate: dropOffRate
            },
            funnel: {
                totalSubmitted: totalApplications || 45210,
                pendingAI: pendingAI || 2145,
                pendingManual: pendingManual || 8400,
                deficient: deficient || 1820,
                readyForMerit: readyForMerit || 32845
            },
            quotas: {
                female: { filled: femaleFilled || 4400, total: femaleTotal, pct: femalePct },
                pvtg: { filled: pvtgFilled || 840, total: pvtgTotal, pct: pvtgPct },
                divyangjan: { filled: divyangjanFilled || 950, total: divyangjanTotal, pct: divyangjanPct }
            },
            schemes: schemesData
        });

    } catch (error) {
        console.error("Error fetching dashboard analytics:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
