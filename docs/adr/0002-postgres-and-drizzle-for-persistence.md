# Use Postgres with Drizzle ORM

Considered SQLite (via Turso/libSQL) with Drizzle, and Postgres with Prisma, as alternatives. Chose Postgres + Drizzle: Postgres gives room to evaluate TanStack Start against a production-realistic database rather than a lightweight one, and Drizzle has first-class TanStack Start examples that keep the evaluation focused on the framework rather than ORM friction. Local dev runs Postgres via Docker Compose since there's no hosted deployment for this project (see ADR 0006).
