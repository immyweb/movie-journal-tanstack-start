import { createServerFn } from '@tanstack/react-start'

import { getDecade } from '#/lib/journal/decade'
import { findJournalEntries } from '#/lib/journal/entries'
import { ensureSession } from '#/lib/auth/functions'
import {
  journalSearchSchema,
  type JournalSearch,
} from '#/lib/journal/search-params'
import { defaultJournalSort } from '#/lib/journal/sort'
import { toDate } from '#/lib/format-date-watched'

export type JournalStats = {
  totalCount: number
  watchedThisYear: number
  likedCount: number
  avgRating: number | null
}

// Composes findJournalEntries's two calls (unfiltered, for facets/stats;
// filtered, for the displayed list) so a caller makes one round trip
// instead of two. findJournalEntries itself stays a plain "matching
// entries" interface — this is a separate module rather than a second
// responsibility bolted onto it, so any other future caller of
// findJournalEntries isn't forced to also pay for facet/stat derivation.
//
// userId-parameterized so it's the shared core for both the authenticated
// Journal (getJournalPageData below, via ensureSession()) and the
// signed-out public Journal view (ADR 0015), which resolves userId from a
// username instead. Kept as a plain function, callable directly in tests —
// see ADR 0011's note on createServerFn handlers needing request context.
export async function loadJournalPageDataForUser(
  userId: string,
  search: JournalSearch,
) {
  const [allEntries, entries] = await Promise.all([
    findJournalEntries(userId, { sort: defaultJournalSort }),
    findJournalEntries(userId, search),
  ])

  const thisYear = new Date().getFullYear()
  const ratedEntries = allEntries.filter((entry) => entry.rating != null)

  const genreOptions = Array.from(
    new Set(allEntries.flatMap((entry) => entry.movie.genre ?? [])),
  ).sort()

  const decadeOptions = Array.from(
    new Set(
      allEntries
        .map((entry) => getDecade(entry.movie.releaseDate))
        .filter((decade) => decade !== null),
    ),
  ).sort((a, b) => a - b)

  const stats: JournalStats = {
    totalCount: allEntries.length,
    watchedThisYear: allEntries.filter(
      (entry) => toDate(entry.dateWatched).getFullYear() === thisYear,
    ).length,
    likedCount: allEntries.filter((entry) => entry.like).length,
    avgRating:
      ratedEntries.length > 0
        ? ratedEntries.reduce((sum, entry) => sum + (entry.rating ?? 0), 0) /
          ratedEntries.length
        : null,
  }

  return { entries, genreOptions, decadeOptions, stats }
}

export const getJournalPageData = createServerFn({ method: 'GET' })
  .validator(journalSearchSchema)
  .handler(async ({ data }) => {
    const session = await ensureSession()
    return loadJournalPageDataForUser(session.user.id, data)
  })
