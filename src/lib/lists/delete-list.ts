import { createServerFn } from '@tanstack/react-start'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/lib/db'
import { list } from '#/lib/db/schema'
import { ensureSession } from '#/lib/auth/functions'

// Scoped server-side to the signed-in owner on every call, not just initial
// fetch (issue #16) — a guessed/enumerated listId belonging to another user
// must delete nothing. list_item rows cascade-delete with it (ADR 0013).
export const deleteList = createServerFn({ method: 'POST' })
  .validator(z.object({ listId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const session = await ensureSession()

    const [deleted] = await db
      .delete(list)
      .where(and(eq(list.id, data.listId), eq(list.userId, session.user.id)))
      .returning()

    if (!deleted) {
      throw new Error('This list no longer exists.')
    }

    return deleted
  })
