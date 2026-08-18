import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderRoute } from '#/test/render-route'
import { fakeJournalEntry, fakeMovie } from '#/test/fixtures/journal'
import { getPublicJournal } from '#/lib/journal/get-public-journal'
import { getDecade } from '#/lib/journal/decade'

vi.mock('#/lib/journal/get-public-journal', () => ({
  getPublicJournal: vi.fn(),
}))

const ownerName = 'Riley Chen'

const likedEntry = { ...fakeJournalEntry, id: 'entry_1', like: true }
const notLikedEntry = {
  ...fakeJournalEntry,
  id: 'entry_2',
  movie: { ...fakeMovie, tmdbId: '274', title: 'The Silence of the Lambs' },
  like: false,
}

function buildPublicJournalData(
  allEntries: Array<typeof fakeJournalEntry>,
  entries: Array<typeof fakeJournalEntry> = allEntries,
) {
  const thisYear = new Date().getFullYear()
  const ratedEntries = allEntries.filter((entry) => entry.rating != null)

  return {
    ownerName,
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

describe('Public Journal view', () => {
  it('renders the owner attribution, stats, and stub grid, with non-interactive stubs', async () => {
    vi.mocked(getPublicJournal).mockResolvedValue(
      buildPublicJournalData([likedEntry, notLikedEntry]) as never,
    )

    await renderRoute('/journal/u/rileychen')

    expect(
      await screen.findByRole('heading', { name: `${ownerName}’s journal` }),
    ).toBeInTheDocument()

    const stats = screen.getByText('Films logged').closest('dl')!
    const filmsLoggedStat = within(stats)
      .getByText('Films logged')
      .closest('div')!
    expect(within(filmsLoggedStat).getByText('002')).toBeInTheDocument()

    expect(screen.getByText('Parasite')).toBeInTheDocument()
    expect(screen.getByText('The Silence of the Lambs')).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: /Parasite/i }),
    ).not.toBeInTheDocument()
  })

  it('shows the empty state when the owner has no entries', async () => {
    vi.mocked(getPublicJournal).mockResolvedValue(
      buildPublicJournalData([]) as never,
    )

    await renderRoute('/journal/u/rileychen')

    expect(await screen.findByText('No stubs yet')).toBeInTheDocument()
    expect(
      screen.getByText(`${ownerName} hasn't logged a film yet.`),
    ).toBeInTheDocument()
  })

  it('shows a distinct empty state when filters match nothing', async () => {
    const user = userEvent.setup()
    vi.mocked(getPublicJournal).mockImplementation(
      async ({ data }) =>
        buildPublicJournalData(
          [likedEntry, notLikedEntry],
          data.search.liked === true ? [] : [likedEntry, notLikedEntry],
        ) as never,
    )

    await renderRoute('/journal/u/rileychen')
    await screen.findByText('Parasite')

    await user.click(screen.getByRole('button', { name: /^Liked:/ }))
    await user.click(screen.getByRole('radio', { name: 'Liked' }))

    expect(
      await screen.findByText('No matches for these filters'),
    ).toBeInTheDocument()
  })

  it('updates the URL and refetches when the Liked filter is used', async () => {
    const user = userEvent.setup()
    vi.mocked(getPublicJournal).mockImplementation(
      async ({ data }) =>
        buildPublicJournalData(
          [likedEntry, notLikedEntry],
          data.search.liked === true
            ? [likedEntry]
            : [likedEntry, notLikedEntry],
        ) as never,
    )

    const { router } = await renderRoute('/journal/u/rileychen')
    await screen.findByText('Parasite')

    await user.click(screen.getByRole('button', { name: /^Liked:/ }))
    await user.click(screen.getByRole('radio', { name: 'Liked' }))

    await waitFor(() =>
      expect(router.state.location.search).toEqual({ liked: true }),
    )
    expect(vi.mocked(getPublicJournal)).toHaveBeenCalledWith({
      data: {
        username: 'rileychen',
        search: { liked: true, sort: 'most-recently-watched' },
      },
    })
    expect(
      screen.queryByText('The Silence of the Lambs'),
    ).not.toBeInTheDocument()
  })

  it('shows a not-found message for an unknown username', async () => {
    vi.mocked(getPublicJournal).mockResolvedValue(null as never)

    await renderRoute('/journal/u/nobody')

    expect(
      await screen.findByRole('heading', { name: 'No public journal here' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Back to Movie Journal' }),
    ).toHaveAttribute('href', '/')
  })

  it('shows the same not-found message for a private journal', async () => {
    vi.mocked(getPublicJournal).mockResolvedValue(null as never)

    await renderRoute('/journal/u/rileychen')

    expect(
      await screen.findByRole('heading', { name: 'No public journal here' }),
    ).toBeInTheDocument()
  })
})
