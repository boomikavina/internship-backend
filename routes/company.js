require("dotenv").config();
const express    = require("express");
const router     = express.Router();
const jwt        = require("jsonwebtoken");
const Internship = require("../models/Internship");

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

// Post internship
router.post("/internship", authMiddleware, async (req, res) => {
  try {
    const {
      title, company, location, sector,
      duration, stipend, skills_required,
      description, openings
    } = req.body;

    const internship = new Internship({
      title, company, location, sector,
      duration, stipend, skills_required,
      description,
      openings:  openings  || 1,
      postedBy:  req.user.id,
      isActive:  true
    });

    await internship.save();
    console.log("Internship posted:", title);
    res.status(201).json({ message: "Internship posted!", internship });

  } catch (err) {
    console.log("Post internship error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// Get company internships
router.get("/internships", authMiddleware, async (req, res) => {
  try {
    const internships = await Internship.find({ postedBy: req.user.id });
    const totalOpenings = internships.reduce(function(sum, i) {
      return sum + (i.openings || 0);
    }, 0);

    res.json({
      internships,
      totalApplications: 0,
      totalOpenings
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete internship
router.delete("/internship/:id", authMiddleware, async (req, res) => {
  try {
    await Internship.findByIdAndDelete(req.params.id);
    res.json({ message: "Internship deleted!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;