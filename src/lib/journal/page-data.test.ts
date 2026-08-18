import { describe, expect, it, vi } from 'vitest'

import { fakeJournalEntry, fakeMovie } from '#/test/fixtures/journal'
import { findJournalEntries } from '#/lib/journal/entries'
import { loadJournalPageDataForUser } from '#/lib/journal/page-data'

vi.mock('#/lib/journal/entries', () => ({
  findJournalEntries: vi.fn(),
}))

const userId = 'user_1'

describe('loadJournalPageDataForUser', () => {
  it('derives genre and decade options from the unfiltered entry set, sorted', async () => {
    vi.mocked(findJournalEntries).mockImplementation(
      async (_userId, search) =>
        (search.genre || search.decade
          ? []
          : [
              {
                ...fakeJournalEntry,
                id: 'entry_1',
                movie: {
                  ...fakeMovie,
                  genre: ['Thriller', 'Drama'],
                  releaseDate: '2019-05-30',
                },
              },
              {
                ...fakeJournalEntry,
                id: 'entry_2',
                movie: {
                  ...fakeMovie,
                  tmdbId: '274',
                  genre: ['Drama', 'Crime'],
                  releaseDate: '1991-02-14',
                },
              },
              {
                ...fakeJournalEntry,
                id: 'entry_3',
                movie: { ...fakeMovie, tmdbId: '309919', releaseDate: null },
              },
            ]) as never,
    )

    const result = await loadJournalPageDataForUser(userId, {
      sort: 'most-recently-watched',
    })

    expect(result.genreOptions).toEqual(['Crime', 'Drama', 'Thriller'])
    expect(result.decadeOptions).toEqual([1990, 2010])
  })

  it('computes stats from the unfiltered entry set regardless of the active filter', async () => {
    const thisYear = new Date().getFullYear()
    vi.mocked(findJournalEntries).mockImplementation(
      async (_userId, search) =>
        (search.liked === true
          ? [{ ...fakeJournalEntry, id: 'entry_1', like: true, rating: 5 }]
          : [
              {
                ...fakeJournalEntry,
                id: 'entry_1',
                like: true,
                rating: 5,
                dateWatched: new Date(`${thisYear}-01-01T00:00:00Z`),
              },
              {
                ...fakeJournalEntry,
                id: 'entry_2',
                movie: { ...fakeMovie, tmdbId: '274' },
                like: false,
                rating: 3,
                dateWatched: new Date('2020-01-01T00:00:00Z'),
              },
            ]) as never,
    )

    const result = await loadJournalPageDataForUser(userId, {
      liked: true,
      sort: 'most-recently-watched',
    })

    expect(result.stats).toEqual({
      totalCount: 2,
      watchedThisYear: 1,
      likedCount: 1,
      avgRating: 4,
    })
  })

  it('reports avgRating as null when no entries are rated', async () => {
    vi.mocked(findJournalEntries).mockResolvedValue([
      { ...fakeJournalEntry, id: 'entry_1', rating: null },
    ] as never)

    const result = await loadJournalPageDataForUser(userId, {
      sort: 'most-recently-watched',
    })

    expect(result.stats.avgRating).toBeNull()
  })

  it('returns the filtered call as entries, distinct from the unfiltered facet/stat call', async () => {
    vi.mocked(findJournalEntries).mockImplementation(
      async (_userId, search) =>
        (search.liked === true
          ? [{ ...fakeJournalEntry, id: 'entry_1', like: true }]
          : [
              { ...fakeJournalEntry, id: 'entry_1', like: true },
              {
                ...fakeJournalEntry,
                id: 'entry_2',
                movie: { ...fakeMovie, tmdbId: '274' },
                like: false,
              },
            ]) as never,
    )

    const result = await loadJournalPageDataForUser(userId, {
      liked: true,
      sort: 'most-recently-watched',
    })

    expect(result.entries).toHaveLength(1)
    expect(result.stats.totalCount).toBe(2)
  })

  it('scopes both the facet/stat call and the filtered call to the given userId', async () => {
    vi.mocked(findJournalEntries).mockResolvedValue([] as never)

    await loadJournalPageDataForUser(userId, {
      liked: true,
      sort: 'earliest-watched',
    })

    // Two distinct calls (unfiltered facets/stats vs. the active filter) —
    // asserted independently by position, not just "some call matched",
    // so a regression that scopes either one to the wrong userId is caught
    // even if the other call happens to still match.
    expect(vi.mocked(findJournalEntries).mock.calls).toEqual([
      [userId, { sort: 'most-recently-watched' }],
      [userId, { liked: true, sort: 'earliest-watched' }],
    ])
  })
})
