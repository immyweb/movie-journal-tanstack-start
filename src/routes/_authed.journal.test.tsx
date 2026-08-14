import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderAuthedRoute } from '#/test/render-authed-route'
import { fakeJournalEntry, fakeMovie } from '#/test/fixtures/journal'
import { fakeUser } from '#/test/fixtures/session'
import { getJournalPageData } from '#/lib/journal/page-data'
import { getDecade } from '#/lib/journal/decade'

vi.mock('#/lib/journal/page-data', () => ({
  getJournalPageData: vi.fn(),
}))

const likedEntry = {
  ...fakeJournalEntry,
  id: 'entry_1',
  like: true,
}
const notLikedEntry = {
  ...fakeJournalEntry,
  id: 'entry_2',
  movie: { ...fakeMovie, tmdbId: '274', title: 'The Silence of the Lambs' },
  like: false,
}
const highRatedEntry = {
  ...fakeJournalEntry,
  id: 'entry_1',
  rating: 5,
}
const lowRatedEntry = {
  ...fakeJournalEntry,
  id: 'entry_2',
  movie: { ...fakeMovie, tmdbId: '274', title: 'The Silence of the Lambs' },
  rating: 2,
}
const dramaEntry = {
  ...fakeJournalEntry,
  id: 'entry_1',
  like: true,
  movie: { ...fakeMovie, genre: ['Drama'] },
}
const comedyEntry = {
  ...fakeJournalEntry,
  id: 'entry_2',
  like: false,
  movie: {
    ...fakeMovie,
    tmdbId: '274',
    title: 'The Silence of the Lambs',
    genre: ['Comedy'],
  },
}
const ninetiesEntry = {
  ...fakeJournalEntry,
  id: 'entry_1',
  movie: { ...fakeMovie, releaseDate: '1996-12-07' },
}
const twentyTensEntry = {
  ...fakeJournalEntry,
  id: 'entry_2',
  movie: {
    ...fakeMovie,
    tmdbId: '274',
    title: 'The Silence of the Lambs',
    releaseDate: '2015-08-21',
  },
}
const noReleaseDateEntry = {
  ...fakeJournalEntry,
  id: 'entry_3',
  movie: {
    ...fakeMovie,
    tmdbId: '309919',
    title: 'The Curse of Downers Grove',
    releaseDate: null,
  },
}

// Builds the shape getJournalPageData now returns in one call — facets and
// stats always derived from the full (unfiltered) entry set, `entries`
// defaulting to that same set unless a test needs to simulate an active
// filter narrowing what's displayed. Mirrors loadJournalPageData's own
// derivation (which has its own dedicated unit tests in page-data.test.ts)
// so these route tests can focus on rendering/URL/interaction behavior
// rather than re-proving the derivation math.
type FakeEntry = Omit<typeof fakeJournalEntry, 'movie' | 'rating'> & {
  rating: number | null
  movie: Omit<typeof fakeMovie, 'releaseDate'> & { releaseDate: string | null }
}

function buildPageData(
  allEntries: Array<FakeEntry>,
  entries: Array<FakeEntry> = allEntries,
) {
  const thisYear = new Date().getFullYear()
  const ratedEntries = allEntries.filter((entry) => entry.rating != null)

  return {
    entries,
    genreOptions: Array.from(
      new Set(allEntries.flatMap((entry) => entry.movie.genre ?? [])),
    ).sort(),
    decadeOptions: Array.from(
      new Set(
        allEntries
          .map((entry) => getDecade(entry.movie.releaseDate))
          .filter((decade): decade is number => decade !== null),
      ),
    ).sort((a, b) => a - b),
    stats: {
      totalCount: allEntries.length,
      watchedThisYear: allEntries.filter(
        (entry) => entry.dateWatched.getFullYear() === thisYear,
      ).length,
      likedCount: allEntries.filter((entry) => entry.like).length,
      avgRating:
        ratedEntries.length > 0
          ? ratedEntries.reduce((sum, entry) => sum + (entry.rating ?? 0), 0) /
            ratedEntries.length
          : null,
    },
  }
}

// Each filter group now renders as a closed dropdown trigger (e.g. "Liked:
// All") whose panel of radio/checkbox pills only mounts once opened — tests
// that read or click those pills must open the trigger first. Matched by a
// name prefix since the trailing summary changes with the selected value.
async function openFilter(
  user: ReturnType<typeof userEvent.setup>,
  label: 'Liked' | 'Rating' | 'Genre' | 'Decade',
) {
  await user.click(
    screen.getByRole('button', { name: new RegExp(`^${label}:`) }),
  )
}

describe('Journal', () => {
  it('shows stats and the stub grid when entries exist', async () => {
    const thisYear = new Date().getFullYear()
    vi.mocked(getJournalPageData).mockResolvedValue(
      buildPageData([
        {
          ...fakeJournalEntry,
          id: 'entry_1',
          dateWatched: new Date(`${thisYear}-03-01T00:00:00Z`),
          rating: 5,
          like: true,
        },
        {
          ...fakeJournalEntry,
          id: 'entry_2',
          movie: {
            ...fakeMovie,
            tmdbId: '274',
            title: 'The Silence of the Lambs',
          },
          dateWatched: new Date('2020-01-01T00:00:00Z'),
          rating: 3,
          like: false,
        },
      ]) as never,
    )

    await renderAuthedRoute('/journal')

    expect(
      await screen.findByRole('heading', {
        name: `Welcome back, ${fakeUser.name.split(' ')[0]}.`,
      }),
    ).toBeInTheDocument()

    const stats = screen.getByText('Films logged').closest('dl')!

    const filmsLoggedStat = within(stats)
      .getByText('Films logged')
      .closest('div')!
    expect(within(filmsLoggedStat).getByText('002')).toBeInTheDocument()

    const thisYearStat = within(stats).getByText('This year').closest('div')!
    expect(within(thisYearStat).getByText('001')).toBeInTheDocument()

    const likedStat = within(stats).getByText('Liked').closest('div')!
    expect(within(likedStat).getByText('001')).toBeInTheDocument()

    const avgRatingStat = within(stats).getByText('Avg rating').closest('div')!
    expect(
      within(avgRatingStat).getByText('4.0', { exact: false }),
    ).toBeInTheDocument()

    expect(screen.getByText('Parasite')).toBeInTheDocument()
    expect(screen.getByText('The Silence of the Lambs')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Parasite/i })).toHaveAttribute(
      'href',
      '/journal/entry_1',
    )
  })

  it('shows the empty state when there are no entries', async () => {
    vi.mocked(getJournalPageData).mockResolvedValue(buildPageData([]) as never)

    await renderAuthedRoute('/journal')

    expect(await screen.findByText('No stubs yet')).toBeInTheDocument()
    expect(screen.getByText(/haven't logged a film yet/i)).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Log your first watch' }),
    ).toHaveAttribute('href', '/journal/new')
  })

  it('updates the URL and shows a results indicator when the Liked filter is used', async () => {
    const user = userEvent.setup()
    vi.mocked(getJournalPageData).mockImplementation(
      async ({ data }) =>
        buildPageData(
          [likedEntry, notLikedEntry],
          data.liked === true ? [likedEntry] : [likedEntry, notLikedEntry],
        ) as never,
    )

    const { router } = await renderAuthedRoute('/journal')
    await screen.findByText('Parasite')

    await openFilter(user, 'Liked')
    await user.click(screen.getByRole('radio', { name: 'Liked' }))

    await waitFor(() =>
      expect(router.state.location.search).toEqual({ liked: true }),
    )
    expect(vi.mocked(getJournalPageData)).toHaveBeenCalledWith({
      data: { liked: true, sort: 'most-recently-watched' },
    })
    expect(await screen.findByText('1 result')).toBeInTheDocument()
    expect(
      screen.queryByText('The Silence of the Lambs'),
    ).not.toBeInTheDocument()
  })

  it('updates the URL when a sort preset is chosen', async () => {
    const user = userEvent.setup()
    vi.mocked(getJournalPageData).mockResolvedValue(
      buildPageData([likedEntry, notLikedEntry]) as never,
    )

    const { router } = await renderAuthedRoute('/journal')
    await screen.findByText('Parasite')

    await user.selectOptions(
      screen.getByLabelText('Sort by'),
      'Earliest watched',
    )

    await waitFor(() =>
      expect(router.state.location.search).toEqual({
        sort: 'earliest-watched',
      }),
    )
  })

  it('reproduces a filtered view when loading its URL directly', async () => {
    const user = userEvent.setup()
    vi.mocked(getJournalPageData).mockImplementation(
      async ({ data }) =>
        buildPageData(
          [likedEntry, notLikedEntry],
          data.liked === false ? [notLikedEntry] : [likedEntry, notLikedEntry],
        ) as never,
    )

    await renderAuthedRoute('/journal?liked=false')
    await screen.findByText('The Silence of the Lambs')

    await openFilter(user, 'Liked')
    expect(screen.getByRole('radio', { name: 'Not liked' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    expect(screen.getByText('1 result')).toBeInTheDocument()
    expect(screen.queryByText('Parasite')).not.toBeInTheDocument()
  })

  it('shows a distinct empty state when filters match nothing, with a way to clear them', async () => {
    const user = userEvent.setup()
    vi.mocked(getJournalPageData).mockImplementation(
      async ({ data }) =>
        buildPageData(
          [likedEntry, notLikedEntry],
          data.liked === true ? [] : [likedEntry, notLikedEntry],
        ) as never,
    )

    await renderAuthedRoute('/journal')
    await screen.findByText('Parasite')

    await openFilter(user, 'Liked')
    await user.click(screen.getByRole('radio', { name: 'Liked' }))

    expect(
      await screen.findByText('No matches for these filters'),
    ).toBeInTheDocument()
    expect(screen.queryByText('No stubs yet')).not.toBeInTheDocument()

    const clearLink = screen.getByRole('link', { name: 'Clear filters' })
    expect(clearLink).toHaveAttribute('href', '/journal')
  })

  it('updates the URL and shows a results indicator when the rating filter is used', async () => {
    const user = userEvent.setup()
    vi.mocked(getJournalPageData).mockImplementation(
      async ({ data }) =>
        buildPageData(
          [highRatedEntry, lowRatedEntry],
          data.minRating === 4
            ? [highRatedEntry]
            : [highRatedEntry, lowRatedEntry],
        ) as never,
    )

    const { router } = await renderAuthedRoute('/journal')
    await screen.findByText('Parasite')

    await openFilter(user, 'Rating')
    await user.click(screen.getByRole('radio', { name: '4 stars and up' }))

    await waitFor(() =>
      expect(router.state.location.search).toEqual({ minRating: 4 }),
    )
    expect(vi.mocked(getJournalPageData)).toHaveBeenCalledWith({
      data: { minRating: 4, sort: 'most-recently-watched' },
    })
    expect(await screen.findByText('1 result')).toBeInTheDocument()
    expect(
      screen.queryByText('The Silence of the Lambs'),
    ).not.toBeInTheDocument()
  })

  it('selects the Highest rated sort preset', async () => {
    const user = userEvent.setup()
    vi.mocked(getJournalPageData).mockResolvedValue(
      buildPageData([highRatedEntry, lowRatedEntry]) as never,
    )

    const { router } = await renderAuthedRoute('/journal')
    await screen.findByText('Parasite')

    await user.selectOptions(screen.getByLabelText('Sort by'), 'Highest rated')

    await waitFor(() =>
      expect(router.state.location.search).toEqual({
        sort: 'highest-rated',
      }),
    )
    expect(await screen.findByText('Highest rated first')).toBeInTheDocument()
  })

  it('combines the rating filter with the Liked filter using AND', async () => {
    const user = userEvent.setup()
    vi.mocked(getJournalPageData).mockImplementation(
      async ({ data }) =>
        buildPageData(
          [highRatedEntry, lowRatedEntry],
          data.liked === true && data.minRating === 4
            ? [highRatedEntry]
            : [highRatedEntry, lowRatedEntry],
        ) as never,
    )

    const { router } = await renderAuthedRoute('/journal')
    await screen.findByText('Parasite')

    await openFilter(user, 'Liked')
    await user.click(screen.getByRole('radio', { name: 'Liked' }))
    await openFilter(user, 'Rating')
    await user.click(screen.getByRole('radio', { name: '4 stars and up' }))

    await waitFor(() =>
      expect(router.state.location.search).toEqual({
        liked: true,
        minRating: 4,
      }),
    )
    expect(vi.mocked(getJournalPageData)).toHaveBeenCalledWith({
      data: { liked: true, minRating: 4, sort: 'most-recently-watched' },
    })
  })

  it('reproduces a rating-filtered view when loading its URL directly', async () => {
    const user = userEvent.setup()
    vi.mocked(getJournalPageData).mockImplementation(
      async ({ data }) =>
        buildPageData(
          [highRatedEntry, lowRatedEntry],
          data.minRating === 4
            ? [highRatedEntry]
            : [highRatedEntry, lowRatedEntry],
        ) as never,
    )

    await renderAuthedRoute('/journal?minRating=4')
    await screen.findByText('Parasite')

    await openFilter(user, 'Rating')
    expect(
      screen.getByRole('radio', { name: '4 stars and up' }),
    ).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByText('1 result')).toBeInTheDocument()
    expect(
      screen.queryByText('The Silence of the Lambs'),
    ).not.toBeInTheDocument()
  })

  it('shows a genre filter option list limited to genres present in the Journal', async () => {
    const user = userEvent.setup()
    vi.mocked(getJournalPageData).mockResolvedValue(
      buildPageData([dramaEntry, comedyEntry]) as never,
    )

    await renderAuthedRoute('/journal')
    await screen.findByText('Parasite')

    await openFilter(user, 'Genre')
    expect(screen.getByRole('checkbox', { name: 'Drama' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Comedy' })).toBeInTheDocument()
    expect(
      screen.queryByRole('checkbox', { name: 'Horror' }),
    ).not.toBeInTheDocument()
  })

  it('updates the URL and filters entries when a genre is selected', async () => {
    const user = userEvent.setup()
    vi.mocked(getJournalPageData).mockImplementation(
      async ({ data }) =>
        buildPageData(
          [dramaEntry, comedyEntry],
          data.genre?.includes('Comedy')
            ? [comedyEntry]
            : [dramaEntry, comedyEntry],
        ) as never,
    )

    const { router } = await renderAuthedRoute('/journal')
    await screen.findByText('Parasite')

    await openFilter(user, 'Genre')
    await user.click(screen.getByRole('checkbox', { name: 'Comedy' }))

    await waitFor(() =>
      expect(router.state.location.search).toEqual({ genre: ['Comedy'] }),
    )
    expect(vi.mocked(getJournalPageData)).toHaveBeenCalledWith({
      data: { genre: ['Comedy'], sort: 'most-recently-watched' },
    })
    expect(await screen.findByText('1 result')).toBeInTheDocument()
    expect(screen.queryByText('Parasite')).not.toBeInTheDocument()
  })

  it('matches entries with ANY of several selected genres (OR within category)', async () => {
    const user = userEvent.setup()
    vi.mocked(getJournalPageData).mockImplementation(
      async ({ data }) =>
        buildPageData(
          [dramaEntry, comedyEntry],
          data.genre
            ? [dramaEntry, comedyEntry].filter((entry) =>
                entry.movie.genre.some((g) => data.genre!.includes(g)),
              )
            : [dramaEntry, comedyEntry],
        ) as never,
    )

    const { router } = await renderAuthedRoute('/journal')
    await screen.findByText('Parasite')

    await openFilter(user, 'Genre')
    await user.click(screen.getByRole('checkbox', { name: 'Drama' }))
    await user.click(screen.getByRole('checkbox', { name: 'Comedy' }))

    await waitFor(() =>
      expect(router.state.location.search).toEqual({
        genre: ['Drama', 'Comedy'],
      }),
    )
    expect(await screen.findByText('2 results')).toBeInTheDocument()
  })

  it('combines the genre filter with the Liked filter using AND', async () => {
    const user = userEvent.setup()
    vi.mocked(getJournalPageData).mockImplementation(
      async ({ data }) =>
        buildPageData(
          [dramaEntry, comedyEntry],
          data.genre?.includes('Drama') && data.liked === true
            ? [dramaEntry]
            : [dramaEntry, comedyEntry],
        ) as never,
    )

    const { router } = await renderAuthedRoute('/journal')
    await screen.findByText('Parasite')

    await openFilter(user, 'Genre')
    await user.click(screen.getByRole('checkbox', { name: 'Drama' }))
    await openFilter(user, 'Liked')
    await user.click(screen.getByRole('radio', { name: 'Liked' }))

    await waitFor(() =>
      expect(router.state.location.search).toEqual({
        genre: ['Drama'],
        liked: true,
      }),
    )
    expect(vi.mocked(getJournalPageData)).toHaveBeenCalledWith({
      data: { genre: ['Drama'], liked: true, sort: 'most-recently-watched' },
    })
    expect(await screen.findByText('1 result')).toBeInTheDocument()
  })

  it('reproduces a genre-filtered view when loading its URL directly', async () => {
    const user = userEvent.setup()
    vi.mocked(getJournalPageData).mockImplementation(
      async ({ data }) =>
        buildPageData(
          [dramaEntry, comedyEntry],
          data.genre?.includes('Comedy')
            ? [comedyEntry]
            : [dramaEntry, comedyEntry],
        ) as never,
    )

    await renderAuthedRoute(
      `/journal?genre=${encodeURIComponent(JSON.stringify(['Comedy']))}`,
    )
    await screen.findByText('The Silence of the Lambs')

    await openFilter(user, 'Genre')
    expect(screen.getByRole('checkbox', { name: 'Comedy' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    expect(screen.getByText('1 result')).toBeInTheDocument()
    expect(screen.queryByText('Parasite')).not.toBeInTheDocument()
  })

  it('shows a decade filter option list limited to decades present in the Journal, excluding entries with no release date', async () => {
    const user = userEvent.setup()
    vi.mocked(getJournalPageData).mockResolvedValue(
      buildPageData([
        ninetiesEntry,
        twentyTensEntry,
        noReleaseDateEntry,
      ]) as never,
    )

    await renderAuthedRoute('/journal')
    await screen.findByText('Parasite')

    await openFilter(user, 'Decade')
    expect(screen.getByRole('checkbox', { name: '1990s' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: '2010s' })).toBeInTheDocument()
    expect(
      screen.queryByRole('checkbox', { name: '2020s' }),
    ).not.toBeInTheDocument()
  })

  it('updates the URL and filters entries when a decade is selected', async () => {
    const user = userEvent.setup()
    vi.mocked(getJournalPageData).mockImplementation(
      async ({ data }) =>
        buildPageData(
          [ninetiesEntry, twentyTensEntry],
          data.decade?.includes(1990)
            ? [ninetiesEntry]
            : [ninetiesEntry, twentyTensEntry],
        ) as never,
    )

    const { router } = await renderAuthedRoute('/journal')
    await screen.findByText('Parasite')

    await openFilter(user, 'Decade')
    await user.click(screen.getByRole('checkbox', { name: '1990s' }))

    await waitFor(() =>
      expect(router.state.location.search).toEqual({ decade: [1990] }),
    )
    expect(vi.mocked(getJournalPageData)).toHaveBeenCalledWith({
      data: { decade: [1990], sort: 'most-recently-watched' },
    })
    expect(await screen.findByText('1 result')).toBeInTheDocument()
    expect(
      screen.queryByText('The Silence of the Lambs'),
    ).not.toBeInTheDocument()
  })

  it('matches entries in ANY of several selected decades (OR within category)', async () => {
    const user = userEvent.setup()
    vi.mocked(getJournalPageData).mockImplementation(
      async ({ data }) =>
        buildPageData(
          [ninetiesEntry, twentyTensEntry],
          data.decade
            ? [ninetiesEntry, twentyTensEntry].filter((entry) => {
                const decade =
                  Math.floor(
                    Number(entry.movie.releaseDate!.slice(0, 4)) / 10,
                  ) * 10
                return data.decade!.includes(decade)
              })
            : [ninetiesEntry, twentyTensEntry],
        ) as never,
    )

    const { router } = await renderAuthedRoute('/journal')
    await screen.findByText('Parasite')

    await openFilter(user, 'Decade')
    await user.click(screen.getByRole('checkbox', { name: '1990s' }))
    await user.click(screen.getByRole('checkbox', { name: '2010s' }))

    await waitFor(() =>
      expect(router.state.location.search).toEqual({
        decade: [1990, 2010],
      }),
    )
    expect(await screen.findByText('2 results')).toBeInTheDocument()
  })

  it('combines the decade filter with the Liked filter using AND', async () => {
    const user = userEvent.setup()
    vi.mocked(getJournalPageData).mockImplementation(
      async ({ data }) =>
        buildPageData(
          [ninetiesEntry, twentyTensEntry],
          data.decade?.includes(1990) && data.liked === true
            ? [ninetiesEntry]
            : [ninetiesEntry, twentyTensEntry],
        ) as never,
    )

    const { router } = await renderAuthedRoute('/journal')
    await screen.findByText('Parasite')

    await openFilter(user, 'Decade')
    await user.click(screen.getByRole('checkbox', { name: '1990s' }))
    await openFilter(user, 'Liked')
    await user.click(screen.getByRole('radio', { name: 'Liked' }))

    await waitFor(() =>
      expect(router.state.location.search).toEqual({
        decade: [1990],
        liked: true,
      }),
    )
    expect(vi.mocked(getJournalPageData)).toHaveBeenCalledWith({
      data: { decade: [1990], liked: true, sort: 'most-recently-watched' },
    })
    expect(await screen.findByText('1 result')).toBeInTheDocument()
  })

  it('reproduces a decade-filtered view when loading its URL directly', async () => {
    const user = userEvent.setup()
    vi.mocked(getJournalPageData).mockImplementation(
      async ({ data }) =>
        buildPageData(
          [ninetiesEntry, twentyTensEntry],
          data.decade?.includes(1990)
            ? [ninetiesEntry]
            : [ninetiesEntry, twentyTensEntry],
        ) as never,
    )

    await renderAuthedRoute(
      `/journal?decade=${encodeURIComponent(JSON.stringify([1990]))}`,
    )
    await screen.findByText('Parasite')

    await openFilter(user, 'Decade')
    expect(screen.getByRole('checkbox', { name: '1990s' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    expect(screen.getByText('1 result')).toBeInTheDocument()
    expect(
      screen.queryByText('The Silence of the Lambs'),
    ).not.toBeInTheDocument()
  })

  it('excludes entries with no release date only while a decade filter is active', async () => {
    vi.mocked(getJournalPageData).mockImplementation(
      async ({ data }) =>
        buildPageData(
          [ninetiesEntry, noReleaseDateEntry],
          data.decade ? [ninetiesEntry] : [ninetiesEntry, noReleaseDateEntry],
        ) as never,
    )

    await renderAuthedRoute('/journal')
    expect(
      await screen.findByText('The Curse of Downers Grove'),
    ).toBeInTheDocument()
  })

  it('selects the Oldest decade and Newest decade sort presets', async () => {
    const user = userEvent.setup()
    vi.mocked(getJournalPageData).mockResolvedValue(
      buildPageData([ninetiesEntry, twentyTensEntry]) as never,
    )

    const { router } = await renderAuthedRoute('/journal')
    await screen.findByText('Parasite')

    await user.selectOptions(screen.getByLabelText('Sort by'), 'Oldest decade')

    await waitFor(() =>
      expect(router.state.location.search).toEqual({
        sort: 'oldest-decade',
      }),
    )
    expect(await screen.findByText('Oldest decade first')).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('Sort by'), 'Newest decade')

    await waitFor(() =>
      expect(router.state.location.search).toEqual({
        sort: 'newest-decade',
      }),
    )
    expect(await screen.findByText('Newest decade first')).toBeInTheDocument()
  })
})
