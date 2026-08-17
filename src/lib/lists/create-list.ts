import { createServerFn } from '@tanstack/react-start'

import { db } from '#/lib/db'
import { list } from '#/lib/db/schema'
import { ensureSession } from '#/lib/auth/functions'
import { createListSchema } from '#/lib/validation/list'

export const createList = createServerFn({ method: 'POST' })
  .validator(createListSchema)
  .handler(async ({ data }) => {
    const session = await ensureSession()

    const [created] = await db
      .insert(list)
      .values({
        userId: session.user.id,
        name: data.name,
        description: data.description,
      })
      .returning()

    return created
  })
