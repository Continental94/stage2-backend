console.log("SERVER FILE LOADED");

const express = require("express");
const cors = require("cors");

const seedDatabase = require("./services/seed");
const db = require("./database/db");
const { parseQuery } = require("./utils/nlpParser");
const { buildQuery } = require("./utils/queryParser");

const app = express();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// 🔥 Home route (THIS is what you asked for)
app.get("/", (req, res) => {
  res.json({ message: "Stage 2 API is live 🚀" });
});

// Seed database (runs once after startup)
setTimeout(() => {
  seedDatabase();
}, 1000);

// 🔍 Search endpoint
app.get("/api/profiles/search", (req, res) => {
  const q = req.query.q;

  if (!q) {
    return res.status(400).json({
      status: "error",
      message: "Missing query parameter",
    });
  }

  const parsedFilters = parseQuery(q);

  if (Object.keys(parsedFilters).length === 0) {
    return res.status(400).json({
      status: "error",
      message: "Unable to interpret query",
    });
  }

  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const offset = (page - 1) * limit;

  const { query, values } = buildQuery(parsedFilters);
  const finalQuery = `${query} LIMIT ? OFFSET ?`;

  db.all(finalQuery, [...values, limit, offset], (err, rows) => {
    if (err) {
      return res.status(500).json({
        status: "error",
        message: err.message,
      });
    }

    res.json({
      status: "success",
      page,
      limit,
      data: rows,
    });
  });
});

// Start server (KEEP THIS LAST)
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});