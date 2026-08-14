import { describe, expect, it } from 'vitest'

import {
  getSortPlan,
  getSortSectionLabel,
  journalSortOptions,
  journalSortValues,
} from '#/lib/journal/sort'

describe('sort', () => {
  it('exposes a dropdown option, section label, and order-by plan for every sort value', () => {
    for (const value of journalSortValues) {
      expect(
        journalSortOptions.find((option) => option.value === value)?.label,
      ).toBeTruthy()
      expect(getSortSectionLabel(value)).toBeTruthy()
      expect(getSortPlan(value).length).toBeGreaterThan(0)
    }
  })

  it('sorts by watched-date descending by default', () => {
    expect(getSortPlan('most-recently-watched')).toEqual([
      { column: 'dateWatched', direction: 'desc' },
    ])
  })

  it('sorts earliest-watched first, ascending by watched date', () => {
    expect(getSortPlan('earliest-watched')).toEqual([
      { column: 'dateWatched', direction: 'asc' },
    ])
  })

  it('sorts liked entries first, falling back to watched-date descending as a tiebreaker', () => {
    expect(getSortPlan('liked-first')).toEqual([
      { column: 'like', direction: 'desc' },
      { column: 'dateWatched', direction: 'desc' },
    ])
  })

  it('sorts highest-rated first, with unrated entries always last regardless of direction', () => {
    expect(getSortPlan('highest-rated')).toEqual([
      { column: 'rating', direction: 'desc', nulls: 'last' },
      { column: 'dateWatched', direction: 'desc' },
    ])
  })

  it('sorts oldest-decade first, with no-release-date entries always last, tiebreaking on watched date', () => {
    expect(getSortPlan('oldest-decade')).toEqual([
      { column: 'releaseDate', direction: 'asc', nulls: 'last' },
      { column: 'dateWatched', direction: 'desc' },
    ])
  })

  it('sorts newest-decade first, with no-release-date entries always last, tiebreaking on watched date', () => {
    expect(getSortPlan('newest-decade')).toEqual([
      { column: 'releaseDate', direction: 'desc', nulls: 'last' },
      { column: 'dateWatched', direction: 'desc' },
    ])
  })
})
