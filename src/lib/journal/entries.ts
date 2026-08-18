import { createServerFn } from '@tanstack/react-start'
import {
  and,
  arrayOverlaps,
  asc,
  desc,
  eq,
  exists,
  gte,
  lt,
  or,
  sql,
} from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/lib/db'
import { journalEntry, movie } from '#/lib/db/schema'
import { ensureSession } from '#/lib/auth/functions'
import { buildJournalQuery } from '#/lib/journal/build-journal-query'
import {
  journalSearchSchema,
  type JournalSearch,
} from '#/lib/journal/search-params'

// The userId-parameterized query core (filter/sort logic) — a single
// implementation shared by the authenticated Journal (getJournalEntries
// below, via ensureSession()) and the signed-out public Journal view
// (ADR 0015), which resolves its own userId from a username instead of a
// session. Kept as a plain function per ADR 0011's pattern: DB-touching
// logic isn't callable directly in Vitest (no createServerFn request
// context), so it stays a thin, uncovered wrapper around this core rather
// than duplicated per caller.
export async function findJournalEntries(
  userId: string,
  search: JournalSearch,
) {
  const plan = buildJournalQuery(search)

  return db.query.journalEntry.findMany({
    // Callback form so the correlated genre/decade subqueries below can
    // reference this query's own aliased `journalEntry` (t.movieId) — the
    // relational query API renames the primary table per-query, so the
    // imported `journalEntry` table object doesn't match inside a
    // subquery.
    where: (t) =>
      and(
        eq(t.userId, userId),
        plan.liked === undefined ? undefined : eq(t.like, plan.liked),
        // A null rating never satisfies >= N — standard SQL null semantics
        // already give "unrated entries never match an active rating
        // filter" (issue #1) with no special-casing needed.
        plan.minRating === undefined
          ? undefined
          : gte(t.rating, plan.minRating),
        // The relational query API's top-level `where` only sees
        // journalEntry's own columns — a `with: { movie: true }` relation
        // isn't joined into it — so genre/decade need a correlated EXISTS
        // subquery rather than a direct reference to movie's columns. ANY
        // of the selected genres matches (OR within category, via the &&
        // "overlaps" operator), AND'd alongside Liked/Rating (AND across
        // categories, issue #4).
        plan.genre === undefined
          ? undefined
          : exists(
              db
                .select({ id: sql`1` })
                .from(movie)
                .where(
                  and(
                    eq(movie.tmdbId, t.movieId),
                    arrayOverlaps(movie.genre, plan.genre),
                  ),
                ),
            ),
        // ANY of the selected decade ranges matches (OR within category).
        // A null releaseDate never satisfies gte/lt, so it's excluded here
        // by standard SQL null semantics — but only while a decade filter
        // is active, since this whole branch is skipped otherwise (issue
        // #5). This is the SQL form of decade.ts's `matchesDecadeFilter`,
        // which states and unit-tests the same rule DB-independently.
        plan.decade === undefined
          ? undefined
          : exists(
              db
                .select({ id: sql`1` })
                .from(movie)
                .where(
                  and(
                    eq(movie.tmdbId, t.movieId),
                    or(
                      ...plan.decade.map(({ start, end }) =>
                        and(
                          gte(movie.releaseDate, start),
                          lt(movie.releaseDate, end),
                        ),
                      ),
                    ),
                  ),
                ),
            ),
      ),
    with: { movie: true },
    // Also callback form: releaseDate-based sorting needs the same
    // correlated-subquery treatment as the genre/decade filters above.
    // Interpolating movie's columns directly into a raw `sql` fragment
    // here (rather than through a proper `db.select()...` subquery
    // object) was tried and mis-resolves them against journalEntry's own
    // alias — confirmed by running this against the real database this
    // session — so releaseDate goes through an explicit subquery object,
    // same shape as the EXISTS subqueries above.
    orderBy: (t) =>
      plan.orderBy.map(({ column, direction, nulls }) => {
        const orderedColumn =
          column === 'releaseDate'
            ? db
                .select({ releaseDate: movie.releaseDate })
                .from(movie)
                .where(eq(movie.tmdbId, t.movieId))
            : t[column]
        if (nulls === 'last') {
          return direction === 'asc'
            ? sql`(${orderedColumn}) asc nulls last`
            : sql`(${orderedColumn}) desc nulls last`
        }
        return direction === 'asc' ? asc(orderedColumn) : desc(orderedColumn)
      }),
  })
}

export const getJournalEntries = createServerFn({ method: 'GET' })
  .validator(journalSearchSchema)
  .handler(async ({ data }) => {
    const session = await ensureSession()
    return findJournalEntries(session.user.id, data)
  })

// Per-user watch count (see CONTEXT.md > Watch count) — computed on read
// rather than stored, since JournalEntry writes are infrequent and a stored
// counter would need to be kept in sync with future edits/deletes.
export const getWatchCount = createServerFn({ method: 'GET' })
  .validator(z.object({ tmdbId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const session = await ensureSession()

    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(journalEntry)
      .where(
        and(
          eq(journalEntry.userId, session.user.id),
          eq(journalEntry.movieId, data.tmdbId),
        ),
      )

    return row?.count ?? 0
  })
