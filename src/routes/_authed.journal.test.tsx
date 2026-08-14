import { describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'

import { renderAuthedRoute } from '#/test/render-authed-route'
import { fakeJournalEntry, fakeMovie } from '#/test/fixtures/journal'
import { fakeUser } from '#/test/fixtures/session'
import { getJournalEntries } from '#/lib/journal/entries'

vi.mock('#/lib/journal/entries', () => ({
  getJournalEntries: vi.fn(),
}))

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

    const filmsLoggedStat = screen.getByText('Films logged').closest('div')!
    expect(within(filmsLoggedStat).getByText('002')).toBeInTheDocument()

    const thisYearStat = screen.getByText('This year').closest('div')!
    expect(within(thisYearStat).getByText('001')).toBeInTheDocument()

    const likedStat = screen.getByText('Liked').closest('div')!
    expect(within(likedStat).getByText('001')).toBeInTheDocument()

    const avgRatingStat = screen.getByText('Avg rating').closest('div')!
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
})
