import { describe, expect, it } from 'vitest'

import { buildJournalQuery } from '#/lib/journal/build-journal-query'
import { defaultJournalSort } from '#/lib/journal/search-params'

describe('buildJournalQuery', () => {
  it('applies no liked filter and sorts by watched-date descending by default', () => {
    const plan = buildJournalQuery({ sort: defaultJournalSort })

    expect(plan.liked).toBeUndefined()
    expect(plan.orderBy).toEqual([{ column: 'dateWatched', direction: 'desc' }])
  })

  it('filters to liked-only entries', () => {
    const plan = buildJournalQuery({ liked: true, sort: defaultJournalSort })

    expect(plan.liked).toBe(true)
  })

  it('filters to not-liked entries', () => {
    const plan = buildJournalQuery({ liked: false, sort: defaultJournalSort })

    expect(plan.liked).toBe(false)
  })

  it('sorts earliest-watched first, ascending by watched date', () => {
    const plan = buildJournalQuery({ sort: 'earliest-watched' })

    expect(plan.orderBy).toEqual([{ column: 'dateWatched', direction: 'asc' }])
  })

  it('sorts liked entries first, falling back to watched-date descending as a tiebreaker', () => {
    const plan = buildJournalQuery({ sort: 'liked-first' })

    expect(plan.orderBy).toEqual([
      { column: 'like', direction: 'desc' },
      { column: 'dateWatched', direction: 'desc' },
    ])
  })

  it('combines a liked filter with a sort preset independently', () => {
    const plan = buildJournalQuery({ liked: true, sort: 'liked-first' })

    expect(plan.liked).toBe(true)
    expect(plan.orderBy).toEqual([
      { column: 'like', direction: 'desc' },
      { column: 'dateWatched', direction: 'desc' },
    ])
  })

  it('applies no rating filter by default', () => {
    const plan = buildJournalQuery({ sort: defaultJournalSort })

    expect(plan.minRating).toBeUndefined()
  })

  it('filters to entries rated at least the threshold', () => {
    const plan = buildJournalQuery({ minRating: 3, sort: defaultJournalSort })

    expect(plan.minRating).toBe(3)
  })

  it('accepts the threshold boundary values (1 and 5)', () => {
    expect(
      buildJournalQuery({ minRating: 1, sort: defaultJournalSort }).minRating,
    ).toBe(1)
    expect(
      buildJournalQuery({ minRating: 5, sort: defaultJournalSort }).minRating,
    ).toBe(5)
  })

  it('sorts highest-rated first, with unrated entries always last regardless of direction', () => {
    const plan = buildJournalQuery({ sort: 'highest-rated' })

    expect(plan.orderBy).toEqual([
      { column: 'rating', direction: 'desc', nulls: 'last' },
      { column: 'dateWatched', direction: 'desc' },
    ])
  })

  it('combines a rating filter with the liked filter independently (AND across categories)', () => {
    const plan = buildJournalQuery({
      liked: true,
      minRating: 4,
      sort: 'highest-rated',
    })

    expect(plan.liked).toBe(true)
    expect(plan.minRating).toBe(4)
  })
})
