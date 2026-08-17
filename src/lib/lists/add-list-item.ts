import { createServerFn } from '@tanstack/react-start'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/lib/db'
import { list, listItem, movie } from '#/lib/db/schema'
import { ensureSession } from '#/lib/auth/functions'
import { fetchMovieSummary } from '#/lib/tmdb/movie-summary'

// Adds a Movie to a List, by tmdbId — whether it came from the TMDB-search
// source or the "from your journal" source. Only the former needs a Movie
// row written; a journal-sourced movie is already cached (same cache-on-
// first-use approach as Log a film, ADR 0005).
//
// The (possibly slow) TMDB fetch runs before any transaction opens, rather
// than inside one — holding a pooled DB connection for an external HTTP
// round-trip would let concurrent adds of not-yet-cached films starve the
// pool. Ownership is re-checked inside the transaction that performs the
// writes, not just on this initial fetch, so the security guarantee stays
// atomic with the insert even though the check itself runs twice.
export const addListItem = createServerFn({ method: 'POST' })
  .validator(z.object({ listId: z.string().min(1), tmdbId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const session = await ensureSession()

    const owned = await db.query.list.findFirst({
      where: and(eq(list.id, data.listId), eq(list.userId, session.user.id)),
    })

    if (!owned) {
      throw new Error('This list no longer exists.')
    }

    const existingMovie = await db.query.movie.findFirst({
      where: eq(movie.tmdbId, data.tmdbId),
    })

    const summary = existingMovie ? null : await fetchMovieSummary(data.tmdbId)

    if (!existingMovie && !summary) {
      throw new Error('Could not find this film on TMDB.')
    }

    return db.transaction(async (tx) => {
      const stillOwned = await tx.query.list.findFirst({
        where: and(eq(list.id, data.listId), eq(list.userId, session.user.id)),
      })

      if (!stillOwned) {
        throw new Error('This list no longer exists.')
      }

      if (summary) {
        await tx
          .insert(movie)
          .values({ tmdbId: data.tmdbId, ...summary })
          .onConflictDoNothing()
      }

      // A Movie can appear on a List at most once (ADR 0013) — the
      // composite primary key already enforces this; onConflictDoNothing
      // turns a duplicate add into a no-op rather than a constraint error.
      await tx
        .insert(listItem)
        .values({ listId: data.listId, movieId: data.tmdbId })
        .onConflictDoNothing()
    })
  })
