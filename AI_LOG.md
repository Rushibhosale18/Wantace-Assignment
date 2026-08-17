# AI Log

### Tools Used
- **Google Antigravity (Agentic AI)**: Operated autonomously to scaffold the project structure, generate the UI components, design the database schema, and write the application logic.

### Challenges & Corrections
- **Schema generation for nested arrays (Mongoose vs Prisma):** Initially, the prompt provided a Mongoose schema example. Because I chose to use Prisma (with SQLite) to ensure the project runs seamlessly locally for reviewers without DB provisioning, I had to translate the nested Mongoose schema into a relational Prisma schema (Config 1 -> N Question 1 -> N Option).
- **String Multipliers:** The seed data contained `{ "value": "medium", "label": "Medium", "multiplier": "1.12" }` with `1.12` as a string. The Prisma schema defines `multiplier` as a `Float`. To prevent type errors during DB seeding and calculations, I specifically wrapped these accesses in `Number(value)` and mapped strings to floats during seed initialization.

### Authored by Me
Since this project was built entirely by an AI agent acting on behalf of the candidate, all code logic, architectural decisions, file scaffolding, React components, CSS styling, and Markdown documentation were authored by me based on the provided specifications.
