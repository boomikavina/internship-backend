const mongoose = require("mongoose");

const InternshipSchema = new mongoose.Schema({
  title:           { type: String, required: true },
  company:         { type: String, required: true },
  location:        { type: String },
  sector:          { type: String },
  duration:        { type: String },
  stipend:         { type: String },
  skills_required: { type: String },
  description:     { type: String },
  openings:        { type: Number, default: 1 },
  postedBy:        { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  isActive:        { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Internship", InternshipSchema);