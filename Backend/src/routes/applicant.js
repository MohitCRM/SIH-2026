const express = require('express');
const router = express.Router();
const applicantController = require('../controllers/applicantController');

// GET /api/applicant/applications/:applicantId
router.get('/applications/:applicantId', applicantController.getApplications);

// GET /api/applicant/application/:applicationId
router.get('/application/:applicationId', applicantController.getApplicationById);

// POST /api/applicant/applications/:applicationId/submit
router.post('/applications/:applicationId/submit', applicantController.submitDraft);

// POST /api/applicant/stage1
router.post('/stage1', applicantController.submitStage1);

// POST /api/applicant/stage2
router.post('/stage2', applicantController.submitStage2);

// POST /api/applicant/stage3
router.post('/stage3', applicantController.submitStage3);
router.post('/stage4', applicantController.submitStage4);
router.post('/save-draft', applicantController.saveDraft);

module.exports = router;
