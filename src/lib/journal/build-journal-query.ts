import type { JournalSearch, JournalSort } from '#/lib/journal/search-params'

// Declarative, DB-independent query criteria — entries.ts translates this
// into real Drizzle where/orderBy expressions. Kept as plain data (rather
// than returning Drizzle fragments directly) so the domain rules here stay
// testable as plain assertions, not by inspecting SQL internals.
export type JournalQueryPlan = {
  liked?: boolean
  orderBy: Array<{ column: 'dateWatched' | 'like'; direction: 'asc' | 'desc' }>
}

// Every preset falls back to watched-date-descending as a tiebreaker for
// entries that tie on the primary sort value (see issue #1).
const orderByPreset: Record<JournalSort, JournalQueryPlan['orderBy']> = {
  'most-recently-watched': [{ column: 'dateWatched', direction: 'desc' }],
  'earliest-watched': [{ column: 'dateWatched', direction: 'asc' }],
  'liked-first': [
    { column: 'like', direction: 'desc' },
    { column: 'dateWatched', direction: 'desc' },
  ],
}

export function buildJournalQuery(search: JournalSearch): JournalQueryPlan {
  return { liked: search.liked, orderBy: orderByPreset[search.sort] }
}
