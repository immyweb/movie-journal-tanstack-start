import { and, eq } from 'drizzle-orm'

import type { db as Db } from '#/lib/db'
import { list } from '#/lib/db/schema'

// The (list.id, userId) ownership condition shared by every List mutation
// (add/remove item, delete). Centralized so a future mutation copied from
// one of these can't silently drop the userId clause and reopen an IDOR
// window (issue #20, finding 5) — it was previously hand-duplicated four
// times across add-list-item.ts (twice), remove-list-item.ts, and
// delete-list.ts.
export function listOwnershipWhere(listId: string, userId: string) {
  return and(eq(list.id, listId), eq(list.userId, userId))
}

// Find-then-throw ownership guard for mutations that look up ownership
// before performing separate writes (add/remove item) — unlike deleteList,
// where the check is baked directly into the delete's own WHERE clause and
// so can't be silently skipped, a plain findFirst here is only as safe as
// every caller remembering to check its result. Throwing here instead
// means a future add/remove-style mutation copied from one of these can't
// forget that check (issue #20, finding 5).
export async function findOwnedListOrThrow(
  executor: Pick<typeof Db, 'query'>,
  listId: string,
  userId: string,
) {
  const owned = await executor.query.list.findFirst({
    where: listOwnershipWhere(listId, userId),
  })

  if (!owned) {
    throw new Error('This list no longer exists.')
  }
}
