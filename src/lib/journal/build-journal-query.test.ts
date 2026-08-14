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
})
