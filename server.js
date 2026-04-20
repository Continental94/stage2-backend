console.log("SERVER FILE LOADED");
const express = require("express");
const cors = require("cors");
const seedDatabase = require("./services/seed");
const db = require("./database/db");
const { parseQuery } = require("./utils/nlpParser");

const app = express();

const { buildQuery } = require("./utils/queryParser");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

setTimeout(() => {
  seedDatabase();
}, 1000);

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

  // reuse your query builder
  const { buildQuery } = require("./utils/queryParser");

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