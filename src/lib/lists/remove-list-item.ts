import { createServerFn } from '@tanstack/react-start'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/lib/db'
import { list, listItem } from '#/lib/db/schema'
import { ensureSession } from '#/lib/auth/functions'

// Scoped server-side to the signed-in owner, same as deleteList (issue #16).
export const removeListItem = createServerFn({ method: 'POST' })
  .validator(z.object({ listId: z.string().min(1), tmdbId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const session = await ensureSession()

    return db.transaction(async (tx) => {
      const owned = await tx.query.list.findFirst({
        where: and(eq(list.id, data.listId), eq(list.userId, session.user.id)),
      })

      if (!owned) {
        throw new Error('This list no longer exists.')
      }

      await tx
        .delete(listItem)
        .where(
          and(
            eq(listItem.listId, data.listId),
            eq(listItem.movieId, data.tmdbId),
          ),
        )
    })
  })
