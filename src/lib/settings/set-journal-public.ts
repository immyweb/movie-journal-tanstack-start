import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/lib/db'
import { user } from '#/lib/db/schema'
import { ensureSession } from '#/lib/auth/functions'

// journalIsPublic may only be set true when username is non-null — an
// app-level invariant (ADR 0014), re-checked here against a fresh read so
// the rule holds even if a client requests it directly, not just when the
// Settings page's toggle happens to be disabled.
export const setJournalPublic = createServerFn({ method: 'POST' })
  .validator(z.object({ journalIsPublic: z.boolean() }))
  .handler(async ({ data }) => {
    const session = await ensureSession()

    if (data.journalIsPublic) {
      const current = await db.query.user.findFirst({
        where: eq(user.id, session.user.id),
        columns: { username: true },
      })

      if (!current?.username) {
        throw new Error('Set a username before publishing your journal.')
      }
    }

    const [updated] = await db
      .update(user)
      .set({ journalIsPublic: data.journalIsPublic })
      .where(eq(user.id, session.user.id))
      .returning()

    return updated
  })
