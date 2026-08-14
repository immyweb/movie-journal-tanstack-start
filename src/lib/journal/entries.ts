import { createServerFn } from '@tanstack/react-start'
import { and, asc, desc, eq, gte, sql } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/lib/db'
import { journalEntry } from '#/lib/db/schema'
import { ensureSession } from '#/lib/auth/functions'
import { buildJournalQuery } from '#/lib/journal/build-journal-query'
import { journalSearchSchema } from '#/lib/journal/search-params'

const orderByColumn = {
  dateWatched: journalEntry.dateWatched,
  like: journalEntry.like,
  rating: journalEntry.rating,
}

export const getJournalEntries = createServerFn({ method: 'GET' })
  .validator(journalSearchSchema)
  .handler(async ({ data }) => {
    const session = await ensureSession()
    const plan = buildJournalQuery(data)

    return db.query.journalEntry.findMany({
      where: and(
        eq(journalEntry.userId, session.user.id),
        plan.liked === undefined
          ? undefined
          : eq(journalEntry.like, plan.liked),
        // A null rating never satisfies >= N — standard SQL null semantics
        // already give "unrated entries never match an active rating
        // filter" (issue #1) with no special-casing needed.
        plan.minRating === undefined
          ? undefined
          : gte(journalEntry.rating, plan.minRating),
      ),
      with: { movie: true },
      orderBy: plan.orderBy.map(({ column, direction, nulls }) => {
        const orderedColumn = orderByColumn[column]
        if (nulls === 'last') {
          return direction === 'asc'
            ? sql`${orderedColumn} asc nulls last`
            : sql`${orderedColumn} desc nulls last`
        }
        return direction === 'asc' ? asc(orderedColumn) : desc(orderedColumn)
      }),
    })
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
