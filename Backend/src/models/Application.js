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
      "STAGE4_SUBMITTED",
      "SUBMITTED", 
      "AI_VERIFIED", 
      "DEFICIENCY_FOUND", 
      "NODAL_APPROVED", 
      "MINISTRY_APPROVED", 
      "FUND_DISBURSED"
    ],
    default: "DRAFT"
  },
  personalInformation: {
    applicantName: { type: String },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'] },
    mobileNumber: { type: String },
    emailAddress: { type: String },
    domicileState: { type: String },
    category: { type: String, enum: ['ST', 'PVTG', 'GENERAL', 'SC', 'OBC'] },
    isDivyangjan: { type: Boolean, default: false }
  },
  financialAndBankingInformation: {
    familyIncome: { type: Number },
    aadhaarNumber: { type: String },
    bankAccountNumber: { type: String },
    bankIfscCode: { type: String },
    isAadhaarLinkedToBank: { type: Boolean, default: false }
  },
  schemeSpecificData: {
    type: mongoose.Schema.Types.Mixed,
    description: "Dynamic fields specific to the applied scheme"
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
