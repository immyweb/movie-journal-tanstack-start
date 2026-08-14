import { describe, expect, it, vi } from 'vitest'

import { fakeJournalEntry, fakeMovie } from '#/test/fixtures/journal'
import { getJournalEntries } from '#/lib/journal/entries'
import { loadJournalPageData } from '#/lib/journal/page-data'

vi.mock('#/lib/journal/entries', () => ({
  getJournalEntries: vi.fn(),
}))

describe('loadJournalPageData', () => {
  it('derives genre and decade options from the unfiltered entry set, sorted', async () => {
    vi.mocked(getJournalEntries).mockImplementation(
      async ({ data }) =>
        (data.genre || data.decade
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

    const result = await loadJournalPageData({ sort: 'most-recently-watched' })

    expect(result.genreOptions).toEqual(['Crime', 'Drama', 'Thriller'])
    expect(result.decadeOptions).toEqual([1990, 2010])
  })

  it('computes stats from the unfiltered entry set regardless of the active filter', async () => {
    const thisYear = new Date().getFullYear()
    vi.mocked(getJournalEntries).mockImplementation(
      async ({ data }) =>
        (data.liked === true
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

    const result = await loadJournalPageData({
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
    vi.mocked(getJournalEntries).mockResolvedValue([
      { ...fakeJournalEntry, id: 'entry_1', rating: null },
    ] as never)

    const result = await loadJournalPageData({ sort: 'most-recently-watched' })

    expect(result.stats.avgRating).toBeNull()
  })

  it('returns the filtered call as entries, distinct from the unfiltered facet/stat call', async () => {
    vi.mocked(getJournalEntries).mockImplementation(
      async ({ data }) =>
        (data.liked === true
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

    const result = await loadJournalPageData({
      liked: true,
      sort: 'most-recently-watched',
    })

    expect(result.entries).toHaveLength(1)
    expect(result.stats.totalCount).toBe(2)
  })
})
