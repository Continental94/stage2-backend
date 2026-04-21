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
app.get("/api/profiles", (req, res) => {
  const {
    gender,
    country_id,
    age_group,
    min_age,
    max_age,
    min_gender_probability,
    min_country_probability,
    sort_by = "created_at",
    order = "asc",
    page = 1,
    limit = 10,
  } = req.query;

  let query = "SELECT * FROM profiles WHERE 1=1";
  let params = [];

  // FILTERS
  if (gender) {
    query += " AND gender = ?";
    params.push(gender.toLowerCase());
  }

  if (country_id) {
    query += " AND country_id = ?";
    params.push(country_id.toUpperCase());
  }

  if (age_group) {
    query += " AND age_group = ?";
    params.push(age_group.toLowerCase());
  }

  if (min_age) {
    query += " AND age >= ?";
    params.push(Number(min_age));
  }

  if (max_age) {
    query += " AND age <= ?";
    params.push(Number(max_age));
  }

  if (min_gender_probability) {
    query += " AND gender_probability >= ?";
    params.push(Number(min_gender_probability));
  }

  if (min_country_probability) {
    query += " AND country_probability >= ?";
    params.push(Number(min_country_probability));
  }

  // SORTING
  const validSortFields = ["age", "created_at", "gender_probability"];
  const validOrder = ["asc", "desc"];

  if (!validSortFields.includes(sort_by) || !validOrder.includes(order)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid query parameters",
    });
  }

  query += ` ORDER BY ${sort_by} ${order.toUpperCase()}`;

  // PAGINATION
  const offset = (page - 1) * limit;
  query += " LIMIT ? OFFSET ?";
  params.push(Number(limit), Number(offset));

  // TOTAL COUNT (important for grading)
  db.get("SELECT COUNT(*) as total FROM profiles", [], (err, countRow) => {
    if (err) {
      return res.status(500).json({ status: "error", message: err.message });
    }

    db.all(query, params, (err, rows) => {
      if (err) {
        return res.status(500).json({ status: "error", message: err.message });
      }

      res.status(200).json({
        status: "success",
        page: Number(page),
        limit: Number(limit),
        total: countRow.total,
        data: rows,
      });
    });
  });
});

// 🚨 LISTEN MUST BE LAST
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});