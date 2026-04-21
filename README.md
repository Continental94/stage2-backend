Stage 2 Backend — Intelligence Query Engine

🚀 Live API
https://stage2-backend-production.up.railway.app/

📂 GitHub Repo
https://github.com/Continental94/stage2-backend.git


📌 Overview

This project is a demographic intelligence API built for Insighta Labs.

It allows clients to:
- Filter profiles using multiple conditions
- Sort results
- Paginate large datasets
- Query data using natural language

The database is seeded with 2026 profiles.

⚙️ Features

✅ Filtering
Supports:
- gender
- age_group
- country_id
- min_age
- max_age
- min_gender_probability
- min_country_probability

Example: /api/profiles?gender=male&country_id=NG&min_age=25

✅ Sorting
Supports:
- age
- created_at
- gender_probability

Example: /api/profiles?sort_by=age&order=desc

✅ Pagination
- page (default: 1)
- limit (default: 10, max: 50)

Example: /api/profiles?page=2&limit=10

✅ Natural Language Search

Endpoint: /api/profiles/search?q=your query

🧠 Parsing Approach

The natural language parser uses **rule-based keyword matching**.

🔹 Gender Mapping
- "male" → gender = male
- "female" → gender = female

🔹 Age Group Mapping
- "child" → age_group = child
- "teen" → age_group = teenager
- "adult" → age_group = adult
- "senior" → age_group = senior

🔹 Special Keyword
- "young" → min_age = 16, max_age = 24

🔹 Age Conditions
- "above 30" → min_age = 30

🔹 Country Mapping
- "nigeria" → NG
- "kenya" → KE
- "angola" → AO
- "ghana" → GH
- "uganda" → UG
- "tanzania" → TZ
- "benin" → BJ

⚠️ Limitations

- Only supports predefined keywords
- Cannot understand complex sentences
- Limited country coverage
- Does not support multiple countries in one query
- No AI or NLP — strictly rule-based

🧱 Tech Stack

- Node.js
- Express.js
- SQLite

📊 Database

Fields:
- id (UUID v7)
- name (unique)
- gender
- gender_probability
- age
- age_group
- country_id
- country_name
- country_probability
- created_at

✅ Error Handling

All errors follow: {
"status": "error",
"message": "Error message"
} 

🌍 CORS

CORS enabled: Access-Control-Allow-Origin

🏁 Setup

```bash
npm install
npm run dev