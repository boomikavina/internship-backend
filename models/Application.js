const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema({
  studentId:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  internshipId:  { type: mongoose.Schema.Types.ObjectId, ref: "Internship", required: true },
  studentName:   { type: String },
  studentEmail:  { type: String },
  college:       { type: String },
  degree:        { type: String },
  skills:        { type: [String], default: [] },
  resume:        { type: String },
  status:        { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  appliedAt:     { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Application", ApplicationSchema);
