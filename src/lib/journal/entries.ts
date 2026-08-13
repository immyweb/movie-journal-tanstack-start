import { createServerFn } from '@tanstack/react-start'
import { and, desc, eq, sql } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/lib/db'
import { journalEntry } from '#/lib/db/schema'
import { ensureSession } from '#/lib/auth/functions'

export const getJournalEntries = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await ensureSession()

    return db.query.journalEntry.findMany({
      where: eq(journalEntry.userId, session.user.id),
      with: { movie: true },
      orderBy: [desc(journalEntry.dateWatched)],
    })
  },
)

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
