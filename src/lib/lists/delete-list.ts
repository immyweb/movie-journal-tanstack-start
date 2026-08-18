import { createServerFn, createServerOnlyFn } from '@tanstack/react-start'
import { z } from 'zod'

import { db } from '#/lib/db'
import { list } from '#/lib/db/schema'
import { ensureSession } from '#/lib/auth/functions'
import { listOwnershipWhere } from '#/lib/lists/ensure-list-ownership'

// Scoped server-side to the signed-in owner on every call, not just initial
// fetch (issue #16) — a guessed/enumerated listId belonging to another user
// must delete nothing. list_item rows cascade-delete with it (ADR 0013).
export const deleteListForUser = createServerOnlyFn(
  async function deleteListForUser(userId: string, listId: string) {
    const [deleted] = await db
      .delete(list)
      .where(listOwnershipWhere(listId, userId))
      .returning()

    if (!deleted) {
      throw new Error('This list no longer exists.')
    }

    return deleted
  },
)

export const deleteList = createServerFn({ method: 'POST' })
  .validator(z.object({ listId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const session = await ensureSession()
    return deleteListForUser(session.user.id, data.listId)
  })
