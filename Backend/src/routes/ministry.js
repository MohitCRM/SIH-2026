const express = require('express');
const router = express.Router();
const ministryController = require('../controllers/ministryController');

// GET /api/ministry/merit-list/:schemeId -> Get the sorted list of applicants
router.get('/merit-list/:schemeId', ministryController.generateMeritList);

// POST /api/ministry/approve-merit-list -> Bulk approve selected applications
router.post('/approve-merit-list', ministryController.bulkApprove);

// GET /api/ministry/verify-sanction/:sanctionNumber -> Public verification of sanction letter
router.get('/verify-sanction/:sanctionNumber', ministryController.verifySanction);

// POST /api/ministry/disburse-funds -> PFMS Simulation
router.post('/disburse-funds', ministryController.disburseFunds);

// POST /api/ministry/schemes/extract -> AI Mock Extraction
router.post('/schemes/extract', ministryController.extractSchemeDetails);

// POST /api/ministry/schemes -> Create Scheme
router.post('/schemes', ministryController.createScheme);

// GET /api/ministry/dashboard -> Dashboard Analytics
router.get('/dashboard', ministryController.getDashboardAnalytics);

module.exports = router;
