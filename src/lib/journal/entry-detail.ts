import { createServerFn } from '@tanstack/react-start'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/lib/db'
import { journalEntry } from '#/lib/db/schema'
import { ensureSession } from '#/lib/auth/functions'
import { getWatchCount } from '#/lib/journal/entries'
import { fetchMovieDetail, type MovieDetail } from '#/lib/tmdb/movie-detail'

// Powers the film detail page (see CONTEXT.md > Film detail page, ADR 0008)
// — scoped to one JournalEntry, not every watch of its Movie. Returns null
// for both "doesn't exist" and "belongs to another user" so the route's
// notFound() can't be used to probe which one it was.
export const getJournalEntryDetail = createServerFn({ method: 'GET' })
  .validator(z.object({ entryId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const session = await ensureSession()

    const entry = await db.query.journalEntry.findFirst({
      where: and(
        eq(journalEntry.id, data.entryId),
        eq(journalEntry.userId, session.user.id),
      ),
      with: { movie: true },
    })

    if (!entry) return null

    // Both TMDB and the count query are non-critical here — the entry's own
    // data (already in hand) always renders even if either fails. Run them
    // concurrently rather than serially, since neither depends on the other.
    const [detail, watchCount] = await Promise.all([
      fetchMovieDetail(entry.movieId).catch((): MovieDetail | null => null),
      getWatchCount({ data: { tmdbId: entry.movieId } }).catch(() => 1),
    ])

    return { entry, detail, watchCount }
  })
