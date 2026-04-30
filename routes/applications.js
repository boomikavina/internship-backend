require("dotenv").config();
const express     = require("express");
const router      = express.Router();
const jwt         = require("jsonwebtoken");
const Application = require("../models/Application");
const Student     = require("../models/Student");
const User        = require("../models/User");
const Internship  = require("../models/Internship");

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Student applies for internship
router.post("/apply", authMiddleware, async (req, res) => {
  try {
    const { internshipId } = req.body;

    // Check if already applied
    const existing = await Application.findOne({
      studentId:    req.user.id,
      internshipId: internshipId
    });

    if (existing) {
      return res.status(400).json({ message: "Already applied for this internship!" });
    }

    // Get student profile and user
    const profile = await Student.findOne({ userId: req.user.id });
    const user    = await User.findById(req.user.id);

    // Create application
    const application = new Application({
      studentId:    req.user.id,
      internshipId: internshipId,
      studentName:  user?.name       || "",
      studentEmail: user?.email      || "",
      college:      profile?.college || "",
      degree:       profile?.degree  || "",
      skills:       profile?.skills  || [],
      resume:       profile?.resume  || "",
      status:       "pending"
    });

    await application.save();
    console.log("Application saved for student:", req.user.id);

    res.status(201).json({
      message: "Application submitted successfully!",
      application
    });

  } catch (err) {
    console.log("Apply error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// Student sees ALL their applications
router.get("/my-applications", authMiddleware, async (req, res) => {
  try {
    const applications = await Application.find({ studentId: req.user.id })
      .populate({
        path: "internshipId",
        strictPopulate: false
      })
      .sort({ appliedAt: -1 });

    console.log("Total applications found:", applications.length);
    res.json({ applications });

  } catch (err) {
    console.log("My applications error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// Company sees applications for their internships
router.get("/company-applications", authMiddleware, async (req, res) => {
  try {
    // Get all internships posted by this company
    const internships   = await Internship.find({ postedBy: req.user.id });
    const internshipIds = internships.map(function(i) { return i._id; });

    console.log("Company internships:", internshipIds.length);

    // Get all applications for those internships
    const applications = await Application.find({
      internshipId: { $in: internshipIds }
    }).sort({ appliedAt: -1 });

    console.log("Company applications found:", applications.length);
    res.json({ applications });

  } catch (err) {
    console.log("Company applications error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// Company accepts or rejects application
router.put("/status/:id", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["accepted", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status: status },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    console.log("Application status updated to:", status);
    res.json({
      message:     "Application " + status + "!",
      application
    });

  } catch (err) {
    console.log("Status update error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// Get application count for student
router.get("/count", authMiddleware, async (req, res) => {
  try {
    const total    = await Application.countDocuments({ studentId: req.user.id });
    const accepted = await Application.countDocuments({ studentId: req.user.id, status: "accepted" });
    const pending  = await Application.countDocuments({ studentId: req.user.id, status: "pending" });
    const rejected = await Application.countDocuments({ studentId: req.user.id, status: "rejected" });

    res.json({ total, accepted, pending, rejected });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
