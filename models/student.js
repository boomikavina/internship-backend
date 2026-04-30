const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
  // links this profile to a user account
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  college:   { type: String },
  degree:    { type: String },
  cgpa:      { type: String },
  location:  { type: String },
  skills:    { type: [String], default: [] }, // array of skills
  interests: { type: [String], default: [] }, // array of interests
  resume:    { type: String }, // file path of uploaded PDF
}, { timestamps: true });

module.exports = mongoose.model("Student", StudentSchema);