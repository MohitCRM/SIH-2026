const mongoose = require('mongoose');

const sanctionLetterSchema = new mongoose.Schema({
  sanctionNumber: { type: String, required: true, unique: true }, // e.g., MoTA/2026/A023B/09842
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
  applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  schemeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Scheme', required: true },
  
  // Snapshot details for the letter (so it doesn't change if profile changes)
  studentName: { type: String, required: true },
  instituteName: { type: String, required: true },
  schemeName: { type: String, required: true },
  academicYear: { type: String, default: "2026-2027" },

  financialBreakdown: {
    tuitionFee: { type: Number, default: 0 },
    livingExpensesAllowance: { type: Number, default: 0 },
    booksAndStationeryAllowance: { type: Number, default: 0 },
    computerHardwareAllowance: { type: Number, default: 0 },
    totalSanctionedAmount: { type: Number, default: 0 }
  },

  disbursementAccount: {
    paymentMode: { type: String, default: "Direct Benefit Transfer (DBT via PFMS)" },
    beneficiaryAadhaar: { type: String }, // e.g., XXXX-XXXX-4321
    transactionRefNo: { type: String } // e.g., PFMS/DBT/20260918/8891023
  },

  issueDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['GENERATED', 'DISBURSED'], default: 'GENERATED' }

}, { timestamps: true });

module.exports = mongoose.model('SanctionLetter', sanctionLetterSchema);
