import { createServerFn } from '@tanstack/react-start'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/lib/db'
import { journalEntry } from '#/lib/db/schema'
import { ensureSession } from '#/lib/auth/functions'

// Powers the delete confirmation on the edit form (see CONTEXT.md > Delete a
// film, ADR 0010) — only removes the JournalEntry row, never the Movie it
// references.
export const deleteFilm = createServerFn({ method: 'POST' })
  .validator(z.object({ entryId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const session = await ensureSession()

    const [entry] = await db
      .delete(journalEntry)
      .where(
        and(
          eq(journalEntry.id, data.entryId),
          eq(journalEntry.userId, session.user.id),
        ),
      )
      .returning()

    if (!entry) {
      throw new Error('This entry no longer exists.')
    }

    return entry
  })
