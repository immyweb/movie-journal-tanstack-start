import { createServerFn } from '@tanstack/react-start'
import { asc, desc, eq } from 'drizzle-orm'

import { db } from '#/lib/db'
import { list } from '#/lib/db/schema'
import { ensureSession } from '#/lib/auth/functions'

// Powers the "Your lists" card grid (poster stack, name, description, item
// count) and the manage overlay's item grid — both read off the same
// owner-scoped shape, so one query covers both (see CONTEXT.md > List).
export const getLists = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await ensureSession()

  return db.query.list.findMany({
    where: eq(list.userId, session.user.id),
    orderBy: desc(list.createdAt),
    with: {
      listItems: {
        orderBy: (listItem) => asc(listItem.addedAt),
        with: { movie: true },
      },
    },
  })
})

export type ListWithItems = Awaited<ReturnType<typeof getLists>>[number]
