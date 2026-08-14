import { describe, expect, it } from 'vitest'

import { buildJournalQuery } from '#/lib/journal/build-journal-query'
import { defaultJournalSort } from '#/lib/journal/sort'

describe('buildJournalQuery', () => {
  it('applies no liked filter by default', () => {
    const plan = buildJournalQuery({ sort: defaultJournalSort })

    expect(plan.liked).toBeUndefined()
  })

  it('filters to liked-only entries', () => {
    const plan = buildJournalQuery({ liked: true, sort: defaultJournalSort })

    expect(plan.liked).toBe(true)
  })

  it('filters to not-liked entries', () => {
    const plan = buildJournalQuery({ liked: false, sort: defaultJournalSort })

    expect(plan.liked).toBe(false)
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

  it('combines a rating filter with the liked filter independently (AND across categories)', () => {
    const plan = buildJournalQuery({
      liked: true,
      minRating: 4,
      sort: defaultJournalSort,
    })

    expect(plan.liked).toBe(true)
    expect(plan.minRating).toBe(4)
  })

  it('applies no genre filter by default', () => {
    const plan = buildJournalQuery({ sort: defaultJournalSort })

    expect(plan.genre).toBeUndefined()
  })

  it('filters to entries matching any of the selected genres (OR within category)', () => {
    const plan = buildJournalQuery({
      genre: ['Comedy', 'Horror'],
      sort: defaultJournalSort,
    })

    expect(plan.genre).toEqual(['Comedy', 'Horror'])
  })

  it('combines a genre filter with the liked and rating filters independently (AND across categories)', () => {
    const plan = buildJournalQuery({
      liked: true,
      minRating: 4,
      genre: ['Comedy'],
      sort: defaultJournalSort,
    })

    expect(plan.liked).toBe(true)
    expect(plan.minRating).toBe(4)
    expect(plan.genre).toEqual(['Comedy'])
  })

  it('applies no decade filter by default', () => {
    const plan = buildJournalQuery({ sort: defaultJournalSort })

    expect(plan.decade).toBeUndefined()
  })

  it('filters to entries in any of the selected decades (OR within category), computing [start, end) bounds', () => {
    const plan = buildJournalQuery({
      decade: [1990, 2010],
      sort: defaultJournalSort,
    })

    expect(plan.decade).toEqual([
      { start: '1990-01-01', end: '2000-01-01' },
      { start: '2010-01-01', end: '2020-01-01' },
    ])
  })

  it('combines a decade filter with the liked, rating, and genre filters independently (AND across categories)', () => {
    const plan = buildJournalQuery({
      liked: true,
      minRating: 4,
      genre: ['Comedy'],
      decade: [1990],
      sort: defaultJournalSort,
    })

    expect(plan.liked).toBe(true)
    expect(plan.minRating).toBe(4)
    expect(plan.genre).toEqual(['Comedy'])
    expect(plan.decade).toEqual([{ start: '1990-01-01', end: '2000-01-01' }])
  })

  it('delegates orderBy to the sort module for the requested preset', () => {
    const plan = buildJournalQuery({ sort: 'liked-first' })

    expect(plan.orderBy).toEqual([
      { column: 'like', direction: 'desc' },
      { column: 'dateWatched', direction: 'desc' },
    ])
  })
})
