# Architecture Decisions

### Stack Selection
- **Frontend:** React + Vite + Tailwind CSS. Chosen for its rapid development cycle, hot module replacement, and modern aesthetics.
- **Backend:** Node.js + Express. Provides a simple, robust REST API.
- **Database:** SQLite with Prisma ORM. While the prompt suggested MongoDB/Postgres, SQLite was chosen because this is a take-home challenge where reviewers need to clone and run the project immediately. Requiring a reviewer to set up a Postgres instance or inject a MongoDB connection string introduces friction. SQLite is perfectly persistent (unlike JSON files) and Prisma provides a type-safe schema, satisfying all "real database" constraints while maximizing DX.

### Pricing Formula
The core formula logic computes a base material cost, adds tear-off cost, applies pitch and story multipliers, and then adds a flat permit fee to get a `midPointEstimate`.

1. **Base Material Cost** = `Roof Area` * `Material Rate` * (1 + `Waste Factor (0.10)`)
2. **Tear Off Cost** = `Roof Area` * `Tear Off Rate` (based on layers)
3. **Subtotal** = (Base Material Cost + Tear Off Cost) * `Pitch Multiplier` * `Stories Multiplier`
4. **Midpoint Estimate** = Subtotal + `Permit Flat Fee ($350)`

To generate the range:
- **Low Estimate** = Midpoint * (1 - `Spread Pct (0.12)`)
- **High Estimate** = Midpoint * (1 + `Spread Pct (0.12)`)

### Constraints Adherence
- **NO HARDCODING:** No pricing data, questions, or labels are hardcoded in the frontend. The `PublicEstimator.jsx` file strictly relies on the `/api/config` payload.
- **Calculation Integrity:** Calculations happen entirely on the server within the `POST /api/estimate` endpoint.

### Out of Scope & Limitations
- **Granular Permissions:** Basic Auth is used for the Owner Panel. Complex JWT-based role management was skipped for time.
- **Complex Config Migrations:** When saving in the Owner Panel, the full config is replaced. In a true enterprise setting, we would have granular PATCH endpoints.

### Missing Data & Assumptions
- The prompt included seed data but required me to "define your own calculation and document it". I assumed a standard additive/multiplicative model that aligns with the structure of the data.
- The `multiplier` for medium pitch was passed as a string `"1.12"` in the seed data JSON. My seed script parses this and correctly types it as a Float in the DB.

### Questions for Dale Before Launch
1. Do you want email notifications sent to you when a new lead is captured?
2. Are there minimum project size constraints (e.g., jobs under $5k aren't accepted)?
3. What happens if a user's roof area is wildly outside the 300 - 12000 sqft range? Should we block them or direct them to call?
