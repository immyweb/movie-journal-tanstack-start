import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderAuthedRoute } from '#/test/render-authed-route'
import { fakeJournalEntry, fakeMovie } from '#/test/fixtures/journal'
import { fakeUser } from '#/test/fixtures/session'
import { getJournalEntries } from '#/lib/journal/entries'

vi.mock('#/lib/journal/entries', () => ({
  getJournalEntries: vi.fn(),
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

describe('Journal', () => {
  it('shows stats and the stub grid when entries exist', async () => {
    const thisYear = new Date().getFullYear()
    vi.mocked(getJournalEntries).mockResolvedValue([
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
    ] as never)

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
    vi.mocked(getJournalEntries).mockResolvedValue([])

    await renderAuthedRoute('/journal')

    expect(await screen.findByText('No stubs yet')).toBeInTheDocument()
    expect(screen.getByText(/haven't logged a film yet/i)).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Log your first watch' }),
    ).toHaveAttribute('href', '/journal/new')
  })

  it('updates the URL and shows a results indicator when the Liked filter is used', async () => {
    const user = userEvent.setup()
    vi.mocked(getJournalEntries).mockImplementation(
      async ({ data }) =>
        (data.liked === true
          ? [likedEntry]
          : [likedEntry, notLikedEntry]) as never,
    )

    const { router } = await renderAuthedRoute('/journal')
    await screen.findByText('Parasite')

    await user.click(screen.getByRole('radio', { name: 'Liked' }))

    await waitFor(() =>
      expect(router.state.location.search).toEqual({ liked: true }),
    )
    expect(vi.mocked(getJournalEntries)).toHaveBeenCalledWith({
      data: { liked: true, sort: 'most-recently-watched' },
    })
    expect(await screen.findByText('1 result')).toBeInTheDocument()
    expect(
      screen.queryByText('The Silence of the Lambs'),
    ).not.toBeInTheDocument()
  })

  it('updates the URL when a sort preset is chosen', async () => {
    const user = userEvent.setup()
    vi.mocked(getJournalEntries).mockResolvedValue([
      likedEntry,
      notLikedEntry,
    ] as never)

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
    vi.mocked(getJournalEntries).mockImplementation(
      async ({ data }) =>
        (data.liked === false
          ? [notLikedEntry]
          : [likedEntry, notLikedEntry]) as never,
    )

    await renderAuthedRoute('/journal?liked=false')
    await screen.findByText('The Silence of the Lambs')

    expect(screen.getByRole('radio', { name: 'Not liked' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    expect(screen.getByText('1 result')).toBeInTheDocument()
    expect(screen.queryByText('Parasite')).not.toBeInTheDocument()
  })

  it('shows a distinct empty state when filters match nothing, with a way to clear them', async () => {
    const user = userEvent.setup()
    vi.mocked(getJournalEntries).mockImplementation(
      async ({ data }) =>
        (data.liked === true ? [] : [likedEntry, notLikedEntry]) as never,
    )

    await renderAuthedRoute('/journal')
    await screen.findByText('Parasite')

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
    vi.mocked(getJournalEntries).mockImplementation(
      async ({ data }) =>
        (data.minRating === 4
          ? [highRatedEntry]
          : [highRatedEntry, lowRatedEntry]) as never,
    )

    const { router } = await renderAuthedRoute('/journal')
    await screen.findByText('Parasite')

    await user.click(screen.getByRole('radio', { name: '4 stars and up' }))

    await waitFor(() =>
      expect(router.state.location.search).toEqual({ minRating: 4 }),
    )
    expect(vi.mocked(getJournalEntries)).toHaveBeenCalledWith({
      data: { minRating: 4, sort: 'most-recently-watched' },
    })
    expect(await screen.findByText('1 result')).toBeInTheDocument()
    expect(
      screen.queryByText('The Silence of the Lambs'),
    ).not.toBeInTheDocument()
  })

  it('selects the Highest rated sort preset', async () => {
    const user = userEvent.setup()
    vi.mocked(getJournalEntries).mockResolvedValue([
      highRatedEntry,
      lowRatedEntry,
    ] as never)

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
    vi.mocked(getJournalEntries).mockImplementation(
      async ({ data }) =>
        (data.liked === true && data.minRating === 4
          ? [highRatedEntry]
          : [highRatedEntry, lowRatedEntry]) as never,
    )

    const { router } = await renderAuthedRoute('/journal')
    await screen.findByText('Parasite')

    await user.click(screen.getByRole('radio', { name: 'Liked' }))
    await user.click(screen.getByRole('radio', { name: '4 stars and up' }))

    await waitFor(() =>
      expect(router.state.location.search).toEqual({
        liked: true,
        minRating: 4,
      }),
    )
    expect(vi.mocked(getJournalEntries)).toHaveBeenCalledWith({
      data: { liked: true, minRating: 4, sort: 'most-recently-watched' },
    })
  })

  it('reproduces a rating-filtered view when loading its URL directly', async () => {
    vi.mocked(getJournalEntries).mockImplementation(
      async ({ data }) =>
        (data.minRating === 4
          ? [highRatedEntry]
          : [highRatedEntry, lowRatedEntry]) as never,
    )

    await renderAuthedRoute('/journal?minRating=4')
    await screen.findByText('Parasite')

    expect(
      screen.getByRole('radio', { name: '4 stars and up' }),
    ).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByText('1 result')).toBeInTheDocument()
    expect(
      screen.queryByText('The Silence of the Lambs'),
    ).not.toBeInTheDocument()
  })

  it('shows a genre filter option list limited to genres present in the Journal', async () => {
    vi.mocked(getJournalEntries).mockResolvedValue([
      dramaEntry,
      comedyEntry,
    ] as never)

    await renderAuthedRoute('/journal')
    await screen.findByText('Parasite')

    expect(screen.getByRole('checkbox', { name: 'Drama' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Comedy' })).toBeInTheDocument()
    expect(
      screen.queryByRole('checkbox', { name: 'Horror' }),
    ).not.toBeInTheDocument()
  })

  it('updates the URL and filters entries when a genre is selected', async () => {
    const user = userEvent.setup()
    vi.mocked(getJournalEntries).mockImplementation(
      async ({ data }) =>
        (data.genre?.includes('Comedy')
          ? [comedyEntry]
          : [dramaEntry, comedyEntry]) as never,
    )

    const { router } = await renderAuthedRoute('/journal')
    await screen.findByText('Parasite')

    await user.click(screen.getByRole('checkbox', { name: 'Comedy' }))

    await waitFor(() =>
      expect(router.state.location.search).toEqual({ genre: ['Comedy'] }),
    )
    expect(vi.mocked(getJournalEntries)).toHaveBeenCalledWith({
      data: { genre: ['Comedy'], sort: 'most-recently-watched' },
    })
    expect(await screen.findByText('1 result')).toBeInTheDocument()
    expect(screen.queryByText('Parasite')).not.toBeInTheDocument()
  })

  it('matches entries with ANY of several selected genres (OR within category)', async () => {
    const user = userEvent.setup()
    vi.mocked(getJournalEntries).mockImplementation(
      async ({ data }) =>
        (data.genre
          ? [dramaEntry, comedyEntry].filter((entry) =>
              entry.movie.genre.some((g) => data.genre!.includes(g)),
            )
          : [dramaEntry, comedyEntry]) as never,
    )

    const { router } = await renderAuthedRoute('/journal')
    await screen.findByText('Parasite')

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
    vi.mocked(getJournalEntries).mockImplementation(
      async ({ data }) =>
        (data.genre?.includes('Drama') && data.liked === true
          ? [dramaEntry]
          : [dramaEntry, comedyEntry]) as never,
    )

    const { router } = await renderAuthedRoute('/journal')
    await screen.findByText('Parasite')

    await user.click(screen.getByRole('checkbox', { name: 'Drama' }))
    await user.click(screen.getByRole('radio', { name: 'Liked' }))

    await waitFor(() =>
      expect(router.state.location.search).toEqual({
        genre: ['Drama'],
        liked: true,
      }),
    )
    expect(vi.mocked(getJournalEntries)).toHaveBeenCalledWith({
      data: { genre: ['Drama'], liked: true, sort: 'most-recently-watched' },
    })
    expect(await screen.findByText('1 result')).toBeInTheDocument()
  })

  it('reproduces a genre-filtered view when loading its URL directly', async () => {
    vi.mocked(getJournalEntries).mockImplementation(
      async ({ data }) =>
        (data.genre?.includes('Comedy')
          ? [comedyEntry]
          : [dramaEntry, comedyEntry]) as never,
    )

    await renderAuthedRoute(
      `/journal?genre=${encodeURIComponent(JSON.stringify(['Comedy']))}`,
    )
    await screen.findByText('The Silence of the Lambs')

    expect(screen.getByRole('checkbox', { name: 'Comedy' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    expect(screen.getByText('1 result')).toBeInTheDocument()
    expect(screen.queryByText('Parasite')).not.toBeInTheDocument()
  })
})
