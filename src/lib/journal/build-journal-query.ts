import { decadeDateRange } from '#/lib/journal/decade'
import type { JournalSearch, JournalSort } from '#/lib/journal/search-params'

// Declarative, DB-independent query criteria — entries.ts translates this
// into real Drizzle where/orderBy expressions. Kept as plain data (rather
// than returning Drizzle fragments directly) so the domain rules here stay
// testable as plain assertions, not by inspecting SQL internals.
export type JournalQueryPlan = {
  liked?: boolean
  minRating?: number
  // Matches entries whose movie has ANY of these genres (OR within this
  // category) — a film can carry several genres, so there's no single value
  // to require an exact match on.
  genre?: Array<string>
  // ANY of these [start, end) decade ranges matches (OR within category) —
  // pre-computed here (rather than left as raw decade-start years) so the
  // boundary math is covered by this pure function's own tests, per issue
  // #5's AC, instead of only being exercisable against a real database. A
  // movie with no releaseDate can never satisfy a range comparison, so
  // entries.ts's standard SQL null semantics already exclude them whenever
  // this is set — with no special-casing needed (issue #5).
  decade?: Array<{ start: string; end: string }>
  orderBy: Array<{
    column: 'dateWatched' | 'like' | 'rating' | 'releaseDate'
    direction: 'asc' | 'desc'
    // Postgres defaults NULLs to sort first on DESC and last on ASC — the
    // opposite of "unrated/no-release-date entries always sort after
    // rated/dated ones regardless of direction" (issue #1), so nullable
    // columns must say so explicitly.
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
  'oldest-decade': [
    { column: 'releaseDate', direction: 'asc', nulls: 'last' },
    watchedDateTiebreak,
  ],
  'newest-decade': [
    { column: 'releaseDate', direction: 'desc', nulls: 'last' },
    watchedDateTiebreak,
  ],
}

export function buildJournalQuery(search: JournalSearch): JournalQueryPlan {
  return {
    liked: search.liked,
    minRating: search.minRating,
    genre: search.genre,
    decade: search.decade?.map(decadeDateRange),
    orderBy: orderByPreset[search.sort],
  }
}
