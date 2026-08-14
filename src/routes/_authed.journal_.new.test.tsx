import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderAuthedRoute } from '#/test/render-authed-route'
import { fakeSearchResult } from '#/test/fixtures/journal'
import { searchMovies } from '#/lib/tmdb/search'
import { getWatchCount } from '#/lib/journal/entries'
import { logFilm } from '#/lib/journal/log-film'

vi.mock('#/lib/tmdb/search', () => ({ searchMovies: vi.fn() }))
vi.mock('#/lib/journal/entries', () => ({ getWatchCount: vi.fn() }))
vi.mock('#/lib/journal/log-film', () => ({ logFilm: vi.fn() }))

const resultButtonName = `${fakeSearchResult.title}, 2019`

async function search(
  user: ReturnType<typeof userEvent.setup>,
  query = 'Parasite',
) {
  await user.type(screen.getByLabelText('Search TMDB'), query)
}

async function selectFilm(user: ReturnType<typeof userEvent.setup>) {
  await search(user)
  await user.click(
    await screen.findByRole('button', { name: resultButtonName }),
  )
  await screen.findByLabelText('Date watched')
}

describe('Log a film', () => {
  it('shows a loading indicator then the results', async () => {
    let resolveSearch: (value: unknown) => void = () => {}
    vi.mocked(searchMovies).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSearch = resolve
        }) as never,
    )
    const user = userEvent.setup()
    await renderAuthedRoute('/journal/new')

    await search(user)

    expect(
      await screen.findByText('Searching…', {}, { timeout: 3000 }),
    ).toBeInTheDocument()

    resolveSearch([fakeSearchResult])

    expect(
      await screen.findByRole('button', { name: resultButtonName }),
    ).toBeInTheDocument()
  })

  it('shows a message when nothing matches the search', async () => {
    vi.mocked(searchMovies).mockResolvedValue([])
    const user = userEvent.setup()
    await renderAuthedRoute('/journal/new')

    await search(user, 'Nonexistent Film Title')

    expect(
      await screen.findByText(
        'No films found for “Nonexistent Film Title”.',
        {},
        { timeout: 3000 },
      ),
    ).toBeInTheDocument()
  })

  it('shows an error banner when the TMDB search fails', async () => {
    vi.mocked(searchMovies).mockRejectedValue(new Error('network down'))
    const user = userEvent.setup()
    await renderAuthedRoute('/journal/new')

    await search(user)

    expect(
      await screen.findByText(
        "Couldn't reach TMDB. Try again in a moment.",
        {},
        { timeout: 3000 },
      ),
    ).toBeInTheDocument()
  })

  it('selects a film and shows the rewatch notice when already logged', async () => {
    vi.mocked(searchMovies).mockResolvedValue([fakeSearchResult])
    vi.mocked(getWatchCount).mockResolvedValue(2)
    const user = userEvent.setup()
    await renderAuthedRoute('/journal/new')

    await selectFilm(user)

    expect(
      await screen.findByText(/logged this 2 times before/i),
    ).toBeInTheDocument()
  })

  it('logs the film and returns to the journal', async () => {
    vi.mocked(searchMovies).mockResolvedValue([fakeSearchResult])
    vi.mocked(getWatchCount).mockResolvedValue(0)
    vi.mocked(logFilm).mockResolvedValue({} as never)
    const user = userEvent.setup()
    const { router } = await renderAuthedRoute('/journal/new')
    const navigateSpy = vi
      .spyOn(router, 'navigate')
      .mockResolvedValue(undefined as never)

    await selectFilm(user)
    await user.click(screen.getByRole('button', { name: 'Log this watch' }))

    await waitFor(() =>
      expect(logFilm).toHaveBeenCalledWith({
        data: expect.objectContaining({ tmdbId: fakeSearchResult.tmdbId }),
      }),
    )
    expect(navigateSpy).toHaveBeenCalledWith({ to: '/journal' })
  })

  it('shows the TMDB-specific error message when logging a brand-new film fails', async () => {
    vi.mocked(searchMovies).mockResolvedValue([fakeSearchResult])
    vi.mocked(getWatchCount).mockResolvedValue(0)
    vi.mocked(logFilm).mockRejectedValue(
      new Error('Could not find this film on TMDB.'),
    )
    const user = userEvent.setup()
    await renderAuthedRoute('/journal/new')

    await selectFilm(user)
    await user.click(screen.getByRole('button', { name: 'Log this watch' }))

    expect(
      await screen.findByText('Could not find this film on TMDB.'),
    ).toBeInTheDocument()
  })
})
