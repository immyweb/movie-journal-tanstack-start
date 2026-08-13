import { createServerFn } from '@tanstack/react-start'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/lib/db'
import { journalEntry } from '#/lib/db/schema'
import { ensureSession } from '#/lib/auth/functions'
import { logFilmFormSchema } from '#/lib/validation/journal-entry'

// Powers the edit form (see CONTEXT.md > Edit a film, ADR 0009) — deliberately
// leaner than getJournalEntryDetail: no TMDB detail fetch and no watch count,
// since the edit form doesn't render either.
export const getJournalEntryForEdit = createServerFn({ method: 'GET' })
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

    return entry ?? null
  })

// Movie is fixed at Log a film time — edit only ever touches the mutable
// JournalEntry fields (ADR 0009), so this reuses logFilmFormSchema as-is
// rather than a schema that also accepts tmdbId.
export const editFilm = createServerFn({ method: 'POST' })
  .validator(
    z.object({ entryId: z.string().min(1) }).extend(logFilmFormSchema.shape),
  )
  .handler(async ({ data }) => {
    const session = await ensureSession()

    const [entry] = await db
      .update(journalEntry)
      .set({
        dateWatched: new Date(data.dateWatched),
        rating: data.rating,
        review: data.review,
        like: data.like,
      })
      .where(
        and(
          eq(journalEntry.id, data.entryId),
          eq(journalEntry.userId, session.user.id),
        ),
      )
      .returning()

    if (!entry) {
      throw new Error('This entry no longer exists.')
    }

    return entry
  })
