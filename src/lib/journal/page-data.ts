import { createServerFn } from '@tanstack/react-start'

import { getDecade } from '#/lib/journal/decade'
import { getJournalEntries } from '#/lib/journal/entries'
import {
  journalSearchSchema,
  type JournalSearch,
} from '#/lib/journal/search-params'
import { toDate } from '#/lib/format-date-watched'

export type JournalStats = {
  totalCount: number
  watchedThisYear: number
  likedCount: number
  avgRating: number | null
}

// Composes the Journal route's two getJournalEntries queries (unfiltered,
// for facets/stats; filtered, for the displayed list) so the client makes a
// single round trip instead of two. getJournalEntries itself stays a plain
// "matching entries" interface — this is a separate module rather than a
// second responsibility bolted onto it, so any other future caller of
// getJournalEntries isn't forced to also pay for facet/stat derivation.
//
// Kept as a plain function, with getJournalPageData below as a thin
// createServerFn wrapper around it, so the derivation logic is callable
// directly in tests — createServerFn's wrapped export only runs inside the
// Start server runtime (see ADR 0011's note on calling handlers directly).
export async function loadJournalPageData(search: JournalSearch) {
  const [allEntries, entries] = await Promise.all([
    getJournalEntries({ data: {} }),
    getJournalEntries({ data: search }),
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
  .handler(async ({ data }) => loadJournalPageData(data))
