require("dotenv").config();
const express = require("express");
const router  = express.Router();
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const User    = require("../models/User");

// Register
router.post("/register", async (req, res) => {
  console.log("Register hit:", req.body); // shows what data came in
  try {
    const { name, email, password, role } = req.body;

    // Check all fields are filled
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email already used
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Save user
    const user = new User({ name, email, password: hashed, role });
    await user.save();

    console.log("✅ User saved:", user.email);
    res.status(201).json({ message: "Account created successfully" });

  } catch (err) {
    console.log("❌ Register error:", err.message); // shows exact error
    res.status(500).json({ message: err.message }); // sends exact error to frontend
  }
});

// Login
router.post("/login", async (req, res) => {
  console.log("Login hit:", req.body);
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "backup_secret",
      { expiresIn: "7d" }
    );

    console.log("✅ Login success:", user.email);
    res.json({ token, role: user.role, name: user.name });

  } catch (err) {
    console.log("❌ Login error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;