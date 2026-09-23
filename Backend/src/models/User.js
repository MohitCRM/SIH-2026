const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  password: { type: String, required: true, default: 'password123' },
  role: {
    type: String,
    enum: ["STUDENT", "NODAL_OFFICER", "MINISTRY_ADMIN"],
    required: true
  },
  aadhaarNumber: { type: String, match: /^[0-9]{12}$/ },
  basicDetails: {
    fullName: { type: String },
    dob: { type: Date },
    gender: { type: String },
    category: { type: String, enum: ["ST"] }
  },
  contact: {
    email: { type: String, match: /.+\@.+\..+/ },
    phone: { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
