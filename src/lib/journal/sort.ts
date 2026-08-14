// Single source of truth for JournalSort: the enum values, each preset's
// dropdown label, its Journal-page section label, and its DB order-by plan.
// Consolidated here (rather than spread across search-params.ts,
// sort-select.tsx, build-journal-query.ts, and the route) so adding or
// renaming a sort value only touches one file.

// Fixed, labeled presets rather than a generic field+direction control (see
// issue #1's Implementation Decisions) — only the dimensions built so far
// (watched date, liked status, rating, decade) are listed here.
export const journalSortValues = [
  'most-recently-watched',
  'earliest-watched',
  'liked-first',
  'highest-rated',
  'oldest-decade',
  'newest-decade',
] as const

export type JournalSort = (typeof journalSortValues)[number]

export const defaultJournalSort: JournalSort = 'most-recently-watched'

export type JournalOrderBy = Array<{
  column: 'dateWatched' | 'like' | 'rating' | 'releaseDate'
  direction: 'asc' | 'desc'
  // Postgres defaults NULLs to sort first on DESC and last on ASC — the
  // opposite of "unrated/no-release-date entries always sort after
  // rated/dated ones regardless of direction" (issue #1), so nullable
  // columns must say so explicitly.
  nulls?: 'last'
}>

// Every preset falls back to watched-date-descending as a tiebreaker for
// entries that tie on the primary sort value (see issue #1).
const watchedDateTiebreak: JournalOrderBy[number] = {
  column: 'dateWatched',
  direction: 'desc',
}

const sortPlans: Record<
  JournalSort,
  { dropdownLabel: string; sectionLabel: string; orderBy: JournalOrderBy }
> = {
  'most-recently-watched': {
    dropdownLabel: 'Most recently watched',
    sectionLabel: 'In order of last seen',
    orderBy: [watchedDateTiebreak],
  },
  'earliest-watched': {
    dropdownLabel: 'Earliest watched',
    sectionLabel: 'Oldest watched first',
    orderBy: [{ column: 'dateWatched', direction: 'asc' }],
  },
  'liked-first': {
    dropdownLabel: 'Liked first',
    sectionLabel: 'Liked films first',
    orderBy: [{ column: 'like', direction: 'desc' }, watchedDateTiebreak],
  },
  'highest-rated': {
    dropdownLabel: 'Highest rated',
    sectionLabel: 'Highest rated first',
    orderBy: [
      { column: 'rating', direction: 'desc', nulls: 'last' },
      watchedDateTiebreak,
    ],
  },
  'oldest-decade': {
    dropdownLabel: 'Oldest decade',
    sectionLabel: 'Oldest decade first',
    orderBy: [
      { column: 'releaseDate', direction: 'asc', nulls: 'last' },
      watchedDateTiebreak,
    ],
  },
  'newest-decade': {
    dropdownLabel: 'Newest decade',
    sectionLabel: 'Newest decade first',
    orderBy: [
      { column: 'releaseDate', direction: 'desc', nulls: 'last' },
      watchedDateTiebreak,
    ],
  },
}

export const journalSortOptions = journalSortValues.map((value) => ({
  value,
  label: sortPlans[value].dropdownLabel,
}))

export function getSortSectionLabel(sort: JournalSort): string {
  return sortPlans[sort].sectionLabel
}

export function getSortPlan(sort: JournalSort): JournalOrderBy {
  return sortPlans[sort].orderBy
}
