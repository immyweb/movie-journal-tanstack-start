import { createServerFn } from '@tanstack/react-start'
import { desc, eq } from 'drizzle-orm'

import { db } from '#/lib/db'
import { journalEntry } from '#/lib/db/schema'
import { ensureSession } from '#/lib/auth/functions'

export const getJournalEntries = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await ensureSession()

    return db.query.journalEntry.findMany({
      where: eq(journalEntry.userId, session.user.id),
      with: { movie: true },
      orderBy: [desc(journalEntry.dateWatched)],
    })
  },
)
