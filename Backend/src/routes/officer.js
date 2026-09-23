const express = require('express');
const router = express.Router();
const officerController = require('../controllers/officerController');

// GET /api/officer/schemes -> List all schemes allotted to the officer
router.get('/schemes', officerController.getOfficerSchemes);

// GET /api/officer/applications -> List all pending applications
router.get('/applications', officerController.getPendingApplications);

// GET /api/officer/applications/:applicationId -> Get full details for side-by-side view
router.get('/applications/:applicationId', officerController.getApplicationDetails);

// POST /api/officer/applications/:applicationId/verify -> Approve or mark defective
router.post('/applications/:applicationId/verify', officerController.verifyApplication);

module.exports = router;
