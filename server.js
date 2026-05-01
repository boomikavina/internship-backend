require("dotenv").config();
const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
const path     = require("path");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});

app.use("/api/auth",    require("./routes/auth"));
app.use("/api/student", require("./routes/student"));
app.use("/api/company", require("./routes/company"));
app.use("/api/admin",   require("./routes/admin"));
app.use("/api/applications", require("./routes/applications"));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log("✅ Server running on port " + PORT));
  })
  .catch((err) => {
    console.log("❌ MongoDB failed:", err.message);
    process.exit(1);
  });