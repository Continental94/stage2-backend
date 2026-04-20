Stage 2 Backend Assessment — Intelligence Query Engine

Overview
This project is a demographic intelligence API that allows clients to filter, sort, paginate, and query profile data using natural language.

Features

1. Advanced Filtering
Supports:
- gender
- age_group
- country_id
- min_age / max_age
- min_gender_probability
- min_country_probability

All filters can be combined.

2. Sorting
Supported fields:
- age
- created_at
- gender_probability

Order:
- asc
- desc

3. Pagination
- page (default: 1)
- limit (default: 10, max: 50)

4. Natural Language Search

Endpoint:
GET /api/profiles/search?q=

Supported Keywords & Mapping

| Keyword | Meaning |
|--------|--------|
| male | gender = male |
| female | gender = female |
| young | age between 16–24 |
| child | age_group = child |
| teenager | age_group = teenager |
| adult | age_group = adult |
| senior | age_group = senior |
| above X | min_age = X |
| below X | max_age = X |
| nigeria | country_id = NG |
| kenya | country_id = KE |
| angola | country_id = AO |

Parsing Logic

The system:
1. Converts query to lowercase
2. Searches for keywords
3. Maps them to filters
4. Passes filters into SQL query builder

No AI or external tools are used — purely rule-based.

Limitations

- Limited country support (only predefined list)
- Cannot handle complex sentences
- Cannot resolve conflicting queries (e.g. "below 20 and above 50")
- Only supports simple keyword matching

Tech Stack

- Node.js
- Express
- SQLite
- UUID
- Nodemon

Database Seeding

- Seeded with 2026 profiles
- Uses INSERT OR IGNORE to prevent duplicates

API Base URL

(Add your deployed URL here)

Author

Onabanjo Ayoola O. - InfinityQ Frontend