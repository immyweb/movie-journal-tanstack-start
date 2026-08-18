import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'

import { db } from '#/lib/db'
import { user } from '#/lib/db/schema'
import { ensureSession } from '#/lib/auth/functions'

// Powers the Settings page. Read directly off `user` rather than the
// session object, since journalIsPublic isn't a Better Auth-known field —
// only username/displayUsername are (via the username plugin).
export const getSettings = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await ensureSession()

    const found = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
      columns: { username: true, journalIsPublic: true },
    })

    return {
      username: found?.username ?? null,
      journalIsPublic: found?.journalIsPublic ?? false,
    }
  },
)

export type Settings = Awaited<ReturnType<typeof getSettings>>
