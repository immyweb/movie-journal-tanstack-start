# Movie Journal

A personal log for the films you watch. Search TMDB for a film, record when
you watched it, rate it, write a line about it, and mark whether you liked
it — building up a browsable, filterable history of your moviegoing life.

This project also serves as an evaluation of [TanStack
Start](https://tanstack.com/start) against Next.js for a future project. See
`docs/SYSTEM-DESIGN.md` for the full requirements and API spec, `CONTEXT.md`
for the domain model, and `docs/adr/` for the architectural decisions behind
it.

## Key technologies

- [TanStack Start](https://tanstack.com/start) + [TanStack
  Router](https://tanstack.com/router) — full-stack React framework and
  file-based routing
- [Better Auth](https://www.better-auth.com/) — email/password
  authentication
- [Drizzle ORM](https://orm.drizzle.team/) + PostgreSQL — persistence
- [TMDB](https://www.themoviedb.org/documentation/api) — film search and
  catalog data
- [Tailwind CSS](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/) — styling and accessible UI primitives
- [Vitest](https://vitest.dev/) + Testing Library for component tests,
  [Playwright](https://playwright.dev/) for end-to-end tests

## Getting started

You'll need a running PostgreSQL instance and a TMDB API access token.

1. **Start Postgres** (via the bundled Docker Compose config):

   ```bash
   docker compose up -d
   ```

2. **Set up your environment**:

   ```bash
   cp .env.example .env
   ```

   Fill in `BETTER_AUTH_SECRET` (any random string) and
   `TMDB_ACCESS_TOKEN` — get a TMDB v4 read access token at
   [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api),
   or run `scripts/tmdb-api-key-wizard.sh`.

3. **Install dependencies and run migrations**:

   ```bash
   pnpm install
   pnpm db:migrate
   ```

4. **Start the dev server**:

   ```bash
   pnpm dev
   ```

   The app runs at [localhost:3000](http://localhost:3000).

## Other useful commands

```bash
pnpm build          # production build
pnpm test           # component tests (Vitest)
pnpm test:e2e       # end-to-end tests (Playwright)
pnpm db:studio      # browse the database with Drizzle Studio
```
