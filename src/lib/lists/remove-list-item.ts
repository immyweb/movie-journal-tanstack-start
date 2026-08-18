import { createServerFn, createServerOnlyFn } from '@tanstack/react-start'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/lib/db'
import { listItem } from '#/lib/db/schema'
import { ensureSession } from '#/lib/auth/functions'
import { findOwnedListOrThrow } from '#/lib/lists/ensure-list-ownership'

// Scoped server-side to the signed-in owner, same as deleteList (issue #16).
export const removeListItemForUser = createServerOnlyFn(
  async function removeListItemForUser(
    userId: string,
    { listId, tmdbId }: { listId: string; tmdbId: string },
  ) {
    return db.transaction(async (tx) => {
      await findOwnedListOrThrow(tx, listId, userId)

      await tx
        .delete(listItem)
        .where(and(eq(listItem.listId, listId), eq(listItem.movieId, tmdbId)))
    })
  },
)

export const removeListItem = createServerFn({ method: 'POST' })
  .validator(z.object({ listId: z.string().min(1), tmdbId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const session = await ensureSession()
    return removeListItemForUser(session.user.id, data)
  })
