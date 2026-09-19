const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
  schemeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
  eligibilityRules: {
    maxFamilyIncome: { type: Number }, // Can be null for no limit
    requiredDegrees: [{ type: String }],
    minAge: { type: Number },
    maxAge: { type: Number }
  },
  requiredDocuments: [{
    documentType: { type: String },
    isMandatory: { type: Boolean, default: true },
    requiresOCR: { type: Boolean, default: false }
  }],
  meritWeightage: {
    graduationMarks: { type: Number, default: 0 },
    postGraduationMarks: { type: Number, default: 0 }
  },
  slots: {
    totalSlots: { type: Number },
    reservedSlots: {
      female: { type: Number },
      divyangjan: { type: Number },
      pvtg: { type: Number }
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Scheme', schemeSchema);
