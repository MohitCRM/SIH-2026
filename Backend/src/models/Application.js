const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  applicationId: { type: String, required: true, unique: true },
  applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  schemeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Scheme', required: true },
  status: {
    type: String,
    enum: [
      "DRAFT", 
      "STAGE1_SUBMITTED",
      "STAGE2_SUBMITTED",
      "STAGE3_SUBMITTED",
      "SUBMITTED", 
      "AI_VERIFIED", 
      "DEFICIENCY_FOUND", 
      "NODAL_APPROVED", 
      "MINISTRY_APPROVED", 
      "FUND_DISBURSED"
    ],
    default: "DRAFT"
  },
  submittedData: {
    bankDetails: {
      accountNumber: String,
      ifscCode: String
    },
    declaredFamilyIncome: Number,
    instituteName: String,
    courseLevel: String,
    courseName: String,
    qualifyingMarksPercentage: Number
  },
  documents: [{
    documentType: { type: String },
    fileUrl: { type: String },
    verificationStatus: { 
      type: String, 
      enum: ["PENDING", "OCR_PASSED", "OCR_FAILED", "MANUAL_VERIFIED", "REJECTED"],
      default: "PENDING"
    },
    ocrExtractedData: { type: mongoose.Schema.Types.Mixed }
  }],
  systemCalculatedMeritScore: { type: Number },
  auditTrail: [{
    action: { type: String },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    remarks: { type: String }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
