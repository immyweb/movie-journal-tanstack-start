import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/lib/db'
import { list } from '#/lib/db/schema'

// Powers the signed-out List share view (`/lists/{shareToken}`, ADR 0015).
// No session lookup, by design: this route is strictly anonymous and must
// render identically for the owner and any other visitor. shareToken alone
// is the lookup key (ADR 0013) — there's no listId in the path.
export const getListByShareToken = createServerFn({ method: 'GET' })
  .validator(z.object({ shareToken: z.string().min(1) }))
  .handler(async ({ data }) => {
    const found = await db.query.list.findFirst({
      where: eq(list.shareToken, data.shareToken),
      with: {
        user: { columns: { name: true } },
        listItems: {
          orderBy: (listItem, { asc }) => asc(listItem.addedAt),
          with: { movie: true },
        },
      },
    })

    if (!found) return null

    return {
      name: found.name,
      description: found.description,
      ownerName: found.user.name,
      items: found.listItems.map((item) => ({
        movie: item.movie,
        addedAt: item.addedAt,
      })),
    }
  })

export type ListShareData = NonNullable<
  Awaited<ReturnType<typeof getListByShareToken>>
>
