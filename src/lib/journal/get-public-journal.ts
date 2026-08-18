import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/lib/db'
import { user } from '#/lib/db/schema'
import { loadJournalPageDataForUser } from '#/lib/journal/page-data'
import {
  journalSearchSchema,
  type JournalSearch,
} from '#/lib/journal/search-params'

// Not-found for both an unknown username and a known one with
// journalIsPublic: false (ADR 0014) — a visitor can't distinguish "doesn't
// exist" from "exists but private" from the response shape. Kept as a
// plain, DB-independent function (rather than inlined in the db lookup
// below) so this resolution rule is unit-testable without a database, per
// ADR 0011's pattern for the query core.
export function resolvePublicJournalOwner(
  found: { id: string; name: string; journalIsPublic: boolean } | undefined,
): { id: string; name: string } | null {
  if (!found || !found.journalIsPublic) return null
  return { id: found.id, name: found.name }
}

// Powers the signed-out public Journal view (`/journal/u/{username}`, ADR
// 0015 as amended by ADR 0016). No session lookup, by design: this route is
// strictly anonymous and must render identically for the owner and any
// other visitor. `username` is normalized trimmed+lowercase at write time
// (ADR 0014, usernameSchema), so the lookup does the same — a visitor
// typing or sharing the link in a different casing (or a URL built with
// stray whitespace) still resolves. Kept as a plain function, callable
// directly in tests — see ADR 0011's note on createServerFn handlers
// needing request context.
export async function loadPublicJournal(
  username: string,
  search: JournalSearch,
) {
  const found = await db.query.user.findFirst({
    where: eq(user.username, username.trim().toLowerCase()),
    columns: { id: true, name: true, journalIsPublic: true },
  })

  const owner = resolvePublicJournalOwner(found)
  if (!owner) return null

  const pageData = await loadJournalPageDataForUser(owner.id, search)

  return { ownerName: owner.name, ...pageData }
}

export const getPublicJournal = createServerFn({ method: 'GET' })
  .validator(
    z.object({ username: z.string().min(1), search: journalSearchSchema }),
  )
  .handler(async ({ data }) => loadPublicJournal(data.username, data.search))
