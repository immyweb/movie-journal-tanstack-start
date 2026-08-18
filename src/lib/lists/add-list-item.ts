import { createServerFn, createServerOnlyFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/lib/db'
import { listItem, movie } from '#/lib/db/schema'
import { getPgErrorCause } from '#/lib/db/pg-error'
import { ensureSession } from '#/lib/auth/functions'
import { findOwnedListOrThrow } from '#/lib/lists/ensure-list-ownership'
import { fetchMovieSummary } from '#/lib/tmdb/movie-summary'

// postgres' foreign-key-violation error code — see
// https://www.postgresql.org/docs/current/errcodes-appendix.html. Scoped to
// specifically listId's own FK (not movieId's, which fails for an unrelated
// reason — an unknown/uncached film) via the constraint name, set in
// drizzle/0002_even_spacker_dave.sql.
const FOREIGN_KEY_VIOLATION = '23503'
const LIST_ID_FK_CONSTRAINT = 'list_item_list_id_list_id_fk'

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
// atomic with the insert even though the check itself runs twice. That
// in-transaction recheck still leaves a narrow TOCTOU window — a concurrent
// deleteList committing between the recheck and the listItem insert — so
// the insert's own FK violation is caught and reworded as the same friendly
// "no longer exists" message rather than leaking a raw postgres error
// (issue #20, finding 3).
export const addListItemForUser = createServerOnlyFn(
  async function addListItemForUser(
    userId: string,
    { listId, tmdbId }: { listId: string; tmdbId: string },
  ) {
    await findOwnedListOrThrow(db, listId, userId)

    const existingMovie = await db.query.movie.findFirst({
      where: eq(movie.tmdbId, tmdbId),
    })

    const summary = existingMovie ? null : await fetchMovieSummary(tmdbId)

    if (!existingMovie && !summary) {
      throw new Error('Could not find this film on TMDB.')
    }

    try {
      return await db.transaction(async (tx) => {
        await findOwnedListOrThrow(tx, listId, userId)

        if (summary) {
          await tx
            .insert(movie)
            .values({ tmdbId, ...summary })
            .onConflictDoNothing()
        }

        // A Movie can appear on a List at most once (ADR 0013) — the
        // composite primary key already enforces this; onConflictDoNothing
        // turns a duplicate add into a no-op rather than a constraint error.
        await tx
          .insert(listItem)
          .values({ listId, movieId: tmdbId })
          .onConflictDoNothing()
      })
    } catch (error) {
      const pgError = getPgErrorCause(error)

      if (
        pgError?.code === FOREIGN_KEY_VIOLATION &&
        pgError.constraint === LIST_ID_FK_CONSTRAINT
      ) {
        throw new Error('This list no longer exists.')
      }
      throw error
    }
  },
)

export const addListItem = createServerFn({ method: 'POST' })
  .validator(z.object({ listId: z.string().min(1), tmdbId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const session = await ensureSession()
    return addListItemForUser(session.user.id, data)
  })
