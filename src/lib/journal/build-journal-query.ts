import type { JournalSearch, JournalSort } from '#/lib/journal/search-params'

// Declarative, DB-independent query criteria — entries.ts translates this
// into real Drizzle where/orderBy expressions. Kept as plain data (rather
// than returning Drizzle fragments directly) so the domain rules here stay
// testable as plain assertions, not by inspecting SQL internals.
export type JournalQueryPlan = {
  liked?: boolean
  minRating?: number
  orderBy: Array<{
    column: 'dateWatched' | 'like' | 'rating'
    direction: 'asc' | 'desc'
    // Postgres defaults NULLs to sort first on DESC and last on ASC — the
    // opposite of "unrated entries always sort after rated ones regardless
    // of direction" (issue #1), so nullable columns must say so explicitly.
    nulls?: 'last'
  }>
}

// Every preset falls back to watched-date-descending as a tiebreaker for
// entries that tie on the primary sort value (see issue #1).
const watchedDateTiebreak: JournalQueryPlan['orderBy'][number] = {
  column: 'dateWatched',
  direction: 'desc',
}

const orderByPreset: Record<JournalSort, JournalQueryPlan['orderBy']> = {
  'most-recently-watched': [watchedDateTiebreak],
  'earliest-watched': [{ column: 'dateWatched', direction: 'asc' }],
  'liked-first': [{ column: 'like', direction: 'desc' }, watchedDateTiebreak],
  'highest-rated': [
    { column: 'rating', direction: 'desc', nulls: 'last' },
    watchedDateTiebreak,
  ],
}

export function buildJournalQuery(search: JournalSearch): JournalQueryPlan {
  return {
    liked: search.liked,
    minRating: search.minRating,
    orderBy: orderByPreset[search.sort],
  }
}
