const express = require("express");
const cors = require("cors");
const db = require("./database/db");
const seedDatabase = require("./services/seed");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ SEED DATABASE
seedDatabase();

// ✅ ROOT
app.get("/", (req, res) => {
  res.json({ message: "Stage 2 API is live 🚀" });
});


// ✅ GET ALL PROFILES (FILTER + SORT + PAGINATION)
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
    query += " AND LOWER(gender) = LOWER(?)";
    params.push(gender);
  }

  if (country_id) {
    query += " AND LOWER(country_id) = LOWER(?)";
    params.push(country_id);
  }

  if (age_group) {
    query += " AND LOWER(age_group) = LOWER(?)";
    params.push(age_group);
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
  const pageNum = Number(page);
  const limitNum = Math.min(Number(limit), 50);
  const offset = (pageNum - 1) * limitNum;

  query += " LIMIT ? OFFSET ?";
  params.push(limitNum, offset);

  // TOTAL COUNT
  db.get("SELECT COUNT(*) as total FROM profiles", [], (err, countRow) => {
    if (err) {
      return res.status(500).json({
        status: "error",
        message: err.message,
      });
    }

    db.all(query, params, (err, rows) => {
      if (err) {
        return res.status(500).json({
          status: "error",
          message: err.message,
        });
      }

      res.status(200).json({
        status: "success",
        page: pageNum,
        limit: limitNum,
        total: countRow.total,
        data: rows,
      });
    });
  });
});


// ✅ NATURAL LANGUAGE SEARCH (WITH PAGINATION + MORE COUNTRIES)
app.get("/api/profiles/search", (req, res) => {
  const q = req.query.q;

  if (!q) {
    return res.status(400).json({
      status: "error",
      message: "Missing query parameter",
    });
  }

  const queryText = q.toLowerCase();
  let filters = {};

  // GENDER
  if (queryText.includes("male")) filters.gender = "male";
  if (queryText.includes("female")) filters.gender = "female";

  // AGE GROUP
  if (queryText.includes("child")) filters.age_group = "child";
  if (queryText.includes("teen")) filters.age_group = "teenager";
  if (queryText.includes("adult")) filters.age_group = "adult";
  if (queryText.includes("senior")) filters.age_group = "senior";

  // "young"
  if (queryText.includes("young")) {
    filters.min_age = 16;
    filters.max_age = 24;
  }

  // ABOVE AGE
  const aboveMatch = queryText.match(/above (\d+)/);
  if (aboveMatch) {
    filters.min_age = Number(aboveMatch[1]);
  }

  // COUNTRIES (IMPROVED)
  if (queryText.includes("nigeria")) filters.country_id = "NG";
  if (queryText.includes("kenya")) filters.country_id = "KE";
  if (queryText.includes("angola")) filters.country_id = "AO";
  if (queryText.includes("ghana")) filters.country_id = "GH";
  if (queryText.includes("uganda")) filters.country_id = "UG";
  if (queryText.includes("tanzania")) filters.country_id = "TZ";
  if (queryText.includes("benin")) filters.country_id = "BJ";

  if (Object.keys(filters).length === 0) {
    return res.status(400).json({
      status: "error",
      message: "Unable to interpret query",
    });
  }

  let sql = "SELECT * FROM profiles WHERE 1=1";
  let params = [];

  if (filters.gender) {
    sql += " AND gender = ?";
    params.push(filters.gender);
  }

  if (filters.age_group) {
    sql += " AND age_group = ?";
    params.push(filters.age_group);
  }

  if (filters.country_id) {
    sql += " AND country_id = ?";
    params.push(filters.country_id);
  }

  if (filters.min_age) {
    sql += " AND age >= ?";
    params.push(filters.min_age);
  }

  if (filters.max_age) {
    sql += " AND age <= ?";
    params.push(filters.max_age);
  }

  // PAGINATION
  const pageNum = Number(req.query.page || 1);
  const limitNum = Math.min(Number(req.query.limit || 10), 50);
  const offset = (pageNum - 1) * limitNum;

  sql += " LIMIT ? OFFSET ?";
  params.push(limitNum, offset);

  // TOTAL COUNT
  db.get("SELECT COUNT(*) as total FROM profiles", [], (err, countRow) => {
    db.all(sql, params, (err, rows) => {
      res.json({
        status: "success",
        page: pageNum,
        limit: limitNum,
        total: countRow.total,
        data: rows,
      });
    });
  });
});


// ✅ START SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});