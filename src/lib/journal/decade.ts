// The 10-year span a Movie's releaseDate falls into (see CONTEXT.md >
// Decade) — always computed at query/render time, never stored (ADR 0012).

export function getDecade(releaseDate: string | null): number | null {
  if (!releaseDate) return null

  const year = Number(releaseDate.slice(0, 4))
  return Number.isFinite(year) ? Math.floor(year / 10) * 10 : null
}

export function formatDecade(decadeStart: number): string {
  return `${decadeStart}s`
}

// [start, end) ISO date-string bounds for a decade — ISO 8601 dates sort
// lexicographically in chronological order, so these bound a text-column
// releaseDate range without needing a cast.
export function decadeDateRange(decadeStart: number): {
  start: string
  end: string
} {
  return { start: `${decadeStart}-01-01`, end: `${decadeStart + 10}-01-01` }
}

// The reference semantics for the decade filter's null-handling (issue #5):
// a movie with no releaseDate never matches an active decade filter. This is
// also what entries.ts's EXISTS-subquery implements via standard SQL null
// semantics (a null column never satisfies gte/lt) — this pure function
// exists so that rule has a unit-testable, DB-independent statement rather
// than only living inside untested SQL.
export function matchesDecadeFilter(
  releaseDate: string | null,
  ranges: Array<{ start: string; end: string }>,
): boolean {
  if (releaseDate === null) return false
  return ranges.some(
    ({ start, end }) => releaseDate >= start && releaseDate < end,
  )
}
