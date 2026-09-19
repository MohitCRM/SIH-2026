const express = require('express');
const router = express.Router();
const ministryController = require('../controllers/ministryController');

// GET /api/ministry/merit-list/:schemeId -> Get the sorted list of applicants
router.get('/merit-list/:schemeId', ministryController.generateMeritList);

// POST /api/ministry/approve-merit-list -> Bulk approve selected applications
router.post('/approve-merit-list', ministryController.bulkApprove);

module.exports = router;
