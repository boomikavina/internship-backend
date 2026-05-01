require("dotenv").config();
const express    = require("express");
const router     = express.Router();
const multer     = require("multer");
const path       = require("path");
const fs         = require("fs");
const Student    = require("../models/student");
const Internship = require("../models/Internship");
const jwt        = require("jsonwebtoken");

// Create uploads folder if it does not exist
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("uploads folder created");
}

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Auth middleware
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token, please login" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token, please login again" });
  }
};

// Save profile
router.post("/profile", authMiddleware, upload.single("resume"), async (req, res) => {
  console.log("Profile save hit:", req.body);
  console.log("File received:", req.file);
  try {
    const { college, degree, cgpa, skills, location, interests } = req.body;

    const profileData = {
      userId:    req.user.id,
      college,
      degree,
      cgpa,
      location,
      skills:    skills    ? skills.split(",").map(s => s.trim())    : [],
      interests: interests ? interests.split(",").map(i => i.trim()) : [],
    };

    if (req.file) {
      profileData.resume = "http://localhost:5000/uploads/" + req.file.filename;
      console.log("Resume saved at:", profileData.resume);
    }

    const profile = await Student.findOneAndUpdate(
      { userId: req.user.id },
      profileData,
      { new: true, upsert: true }
    );

    console.log("Profile saved for user:", req.user.id);
    res.json({
      message:   "Profile saved successfully!",
      profile,
      resumeUrl: profileData.resume || null
    });

  } catch (err) {
    console.log("Profile error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// Get profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const profile = await Student.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all internships for students to browse
router.get("/internships", authMiddleware, async (req, res) => {
  try {
    const internships = await Internship.find({ isActive: true });
    console.log("Internships found:", internships.length);
    res.json({ internships });
  } catch (err) {
    console.log("Internships error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
