import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'

import { db } from '#/lib/db'
import { journalEntry, movie } from '#/lib/db/schema'
import { ensureSession } from '#/lib/auth/functions'
import { fetchMovieSummary } from '#/lib/tmdb/movie-summary'
import { logFilmSchema } from '#/lib/validation/journal-entry'

// Writes Movie and JournalEntry together, only on submit — Movie is
// immutable and "written once when a user first adds it to their journal"
// (CONTEXT.md > Movie), so a mere TMDB search selection must not create it.
export const logFilm = createServerFn({ method: 'POST' })
  .validator(logFilmSchema)
  .handler(async ({ data }) => {
    const session = await ensureSession()

    return db.transaction(async (tx) => {
      const existingMovie = await tx.query.movie.findFirst({
        where: eq(movie.tmdbId, data.tmdbId),
      })

      // Only hit TMDB when this movie isn't cached yet — a rewatch of an
      // already-logged film shouldn't fail because TMDB is having a bad
      // moment; nothing new needs fetching for it.
      if (!existingMovie) {
        const summary = await fetchMovieSummary(data.tmdbId)
        if (!summary) {
          throw new Error('Could not find this film on TMDB.')
        }

        await tx
          .insert(movie)
          .values({ tmdbId: data.tmdbId, ...summary })
          .onConflictDoNothing()
      }

      const [entry] = await tx
        .insert(journalEntry)
        .values({
          userId: session.user.id,
          movieId: data.tmdbId,
          dateWatched: new Date(data.dateWatched),
          rating: data.rating,
          review: data.review,
          like: data.like,
        })
        .returning()

      return entry
    })
  })
