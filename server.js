const express = require("express");
const cors = require("cors");
const db = require("./database/db");
const seedDatabase = require("./services/seed");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ SEED DATABASE
seedDatabase();

// ✅ ROOT ROUTE (optional)
app.get("/", (req, res) => {
  res.json({ message: "API is live 🚀" });
});

// ✅ GET ALL PROFILES
app.get("/api/profiles", (req, res) => {
  db.all("SELECT * FROM profiles", [], (err, rows) => {
    if (err) {
      return res.status(500).json({
        status: "error",
        message: err.message,
      });
    }

    res.json({
      status: "success",
      data: rows,
    });
  });
});

// ✅ SEARCH ROUTE
app.get("/api/profiles/search", (req, res) => {
  res.json({ message: "Search endpoint working" });
});

// 🚨 LISTEN MUST BE LAST
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});