import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { db } from '#/lib/db'

// PROTOTYPE for issue #14 — a signed-out-visitor List share view
// (`/lists/{shareToken}` per ADR 0015). No session lookup, by design: the
// real route is strictly anonymous, so this fetch never touches auth.
export const getListByShareTokenPrototype = createServerFn({ method: 'GET' })
  .validator(z.object({ shareToken: z.string().min(1) }))
  .handler(async ({ data }) => {
    const list = await db.query.list.findFirst({
      where: (t, { eq }) => eq(t.shareToken, data.shareToken),
      with: {
        user: { columns: { name: true } },
        listItems: {
          with: { movie: true },
          orderBy: (t, { asc }) => asc(t.addedAt),
        },
      },
    })

    if (!list) return null

    return {
      name: list.name,
      description: list.description,
      ownerName: list.user.name,
      items: list.listItems.map((item) => ({
        movie: item.movie,
        addedAt: item.addedAt,
      })),
    }
  })

export type ListSharePrototypeData = NonNullable<
  Awaited<ReturnType<typeof getListByShareTokenPrototype>>
>
