require("dotenv").config();
const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
const path     = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// This line serves uploaded files so frontend can access them
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});

app.use("/api/auth",    require("./routes/auth"));
app.use("/api/student", require("./routes/student"));
app.use("/api/company", require("./routes/company"));
app.use("/api/admin",   require("./routes/admin"));
app.use("/api/applications", require("./routes/applications"));


mongoose.connect("mongodb://127.0.0.1:27017/internshipDB")
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(5000, () => console.log("✅ Server running on port 5000"));
  })
  .catch((err) => {
    console.log("❌ MongoDB failed:", err.message);
  });