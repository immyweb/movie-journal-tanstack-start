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
import { movie } from '#/lib/db/schema'
import { getDecade } from '#/lib/journal/decade'
import { buildJournalQuery } from '#/lib/journal/build-journal-query'
import {
  journalSearchSchema,
  type JournalSearch,
} from '#/lib/journal/search-params'
import { defaultJournalSort } from '#/lib/journal/sort'
import { toDate } from '#/lib/format-date-watched'

// PROTOTYPE for issue #14 — a signed-out-visitor public Journal view
// (`/journal/{username}` per ADR 0015). ADR 0014's `username` column isn't
// implemented in code yet, so `identifier` stands in for it here: the
// prototype looks a user up by email instead. No session lookup, by
// design — the real route is strictly anonymous.
//
// The query logic below duplicates entries.ts/page-data.ts, parameterized
// by an arbitrary userId instead of `ensureSession()`'s session user — see
// those files for the reasoning behind each filter/sort branch. Production
// code isn't touched to share this: a throwaway route bending the real
// data-access module to a second calling convention would outlive the
// prototype.
async function findEntries(userId: string, search: JournalSearch) {
  const plan = buildJournalQuery(search)

  return db.query.journalEntry.findMany({
    where: (t) =>
      and(
        eq(t.userId, userId),
        plan.liked === undefined ? undefined : eq(t.like, plan.liked),
        plan.minRating === undefined
          ? undefined
          : gte(t.rating, plan.minRating),
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

export const getPublicJournalPrototype = createServerFn({ method: 'GET' })
  .validator(
    z.object({ identifier: z.string().min(1), search: journalSearchSchema }),
  )
  .handler(async ({ data }) => {
    const owner = await db.query.user.findFirst({
      where: (t, { eq }) => eq(t.email, data.identifier),
      columns: { id: true, name: true },
    })

    if (!owner) return null

    const [allEntries, entries] = await Promise.all([
      findEntries(owner.id, { sort: defaultJournalSort }),
      findEntries(owner.id, data.search),
    ])

    const thisYear = new Date().getFullYear()
    const ratedEntries = allEntries.filter((entry) => entry.rating != null)

    const genreOptions = Array.from(
      new Set(allEntries.flatMap((entry) => entry.movie.genre ?? [])),
    ).sort()

    const decadeOptions = Array.from(
      new Set(
        allEntries
          .map((entry) => getDecade(entry.movie.releaseDate))
          .filter((decade) => decade !== null),
      ),
    ).sort((a, b) => a - b)

    return {
      ownerName: owner.name,
      entries,
      genreOptions,
      decadeOptions,
      stats: {
        totalCount: allEntries.length,
        watchedThisYear: allEntries.filter(
          (entry) => toDate(entry.dateWatched).getFullYear() === thisYear,
        ).length,
        likedCount: allEntries.filter((entry) => entry.like).length,
        avgRating:
          ratedEntries.length > 0
            ? ratedEntries.reduce(
                (sum, entry) => sum + (entry.rating ?? 0),
                0,
              ) / ratedEntries.length
            : null,
      },
    }
  })

export type PublicJournalPrototypeData = NonNullable<
  Awaited<ReturnType<typeof getPublicJournalPrototype>>
>
