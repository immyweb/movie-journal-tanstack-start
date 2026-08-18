import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderAuthedRoute } from '#/test/render-authed-route'
import { fakeJournalEntry, fakeMovie } from '#/test/fixtures/journal'
import { fakeList } from '#/test/fixtures/lists'
import { getJournalEntries } from '#/lib/journal/entries'
import { getLists } from '#/lib/lists/lists'
import { createList } from '#/lib/lists/create-list'
import { deleteList } from '#/lib/lists/delete-list'
import { addListItem } from '#/lib/lists/add-list-item'
import { removeListItem } from '#/lib/lists/remove-list-item'
import { searchMovies } from '#/lib/tmdb/search'

vi.mock('#/lib/journal/entries', () => ({ getJournalEntries: vi.fn() }))
vi.mock('#/lib/lists/lists', () => ({ getLists: vi.fn() }))
vi.mock('#/lib/lists/create-list', () => ({ createList: vi.fn() }))
vi.mock('#/lib/lists/delete-list', () => ({ deleteList: vi.fn() }))
vi.mock('#/lib/lists/add-list-item', () => ({ addListItem: vi.fn() }))
vi.mock('#/lib/lists/remove-list-item', () => ({ removeListItem: vi.fn() }))
vi.mock('#/lib/tmdb/search', () => ({ searchMovies: vi.fn() }))

const secondJournalMovie = {
  ...fakeMovie,
  tmdbId: '555',
  title: 'From the Journal',
}
const freshTmdbResult = {
  tmdbId: '999',
  title: 'Fresh Find',
  releaseDate: '2021-03-01',
  posterUrl: null,
}

function mockLoaderData({
  lists = [fakeList],
}: { lists?: Array<typeof fakeList> } = {}) {
  vi.mocked(getLists).mockResolvedValue(lists as never)
  vi.mocked(getJournalEntries).mockResolvedValue([
    fakeJournalEntry,
    { ...fakeJournalEntry, id: 'entry_2', movie: secondJournalMovie },
  ] as never)
}

async function openList(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /best of the decade/i }))
  await screen.findByRole('heading', { name: 'Best of the decade' })
}

describe('Your lists', () => {
  it('shows an empty state when the user has no lists', async () => {
    mockLoaderData({ lists: [] })

    await renderAuthedRoute('/lists')

    expect(
      await screen.findByRole('heading', { name: 'No lists yet' }),
    ).toBeInTheDocument()
  })

  it('shows each list as a card with its item count', async () => {
    mockLoaderData()

    await renderAuthedRoute('/lists')

    expect(await screen.findByText('Best of the decade')).toBeInTheDocument()
    expect(screen.getByText('Films worth a rewatch.')).toBeInTheDocument()
    expect(screen.getByText('1 film')).toBeInTheDocument()
  })

  it('creates a list and opens it for management', async () => {
    mockLoaderData({ lists: [] })
    const created = {
      ...fakeList,
      id: 'list_new',
      name: 'Watch with Sam',
      description: null,
      listItems: [],
    }
    vi.mocked(createList).mockResolvedValue(created as never)
    // getLists is refetched via router.invalidate() after creating — the
    // second call reflects the newly created list, as the real query would.
    vi.mocked(getLists)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([created] as never)
    const user = userEvent.setup()
    await renderAuthedRoute('/lists')

    await user.click(screen.getByRole('button', { name: 'Create a list' }))
    await user.type(screen.getByLabelText('Name'), 'Watch with Sam')
    await user.click(screen.getByRole('button', { name: 'Create list' }))

    await waitFor(() =>
      expect(createList).toHaveBeenCalledWith({
        data: { name: 'Watch with Sam', description: null },
      }),
    )
    expect(
      await screen.findByRole('heading', { name: 'Watch with Sam' }),
    ).toBeInTheDocument()
  })

  it('opens the newly created list for management even if the post-create refresh fails (issue #20, finding 1)', async () => {
    mockLoaderData({ lists: [] })
    const created = {
      ...fakeList,
      id: 'list_new',
      name: 'Watch with Sam',
      description: null,
      listItems: [],
    }
    vi.mocked(createList).mockResolvedValue(created as never)
    const user = userEvent.setup()
    const { router } = await renderAuthedRoute('/lists')
    vi.spyOn(router, 'invalidate').mockRejectedValueOnce(
      new Error('network blip'),
    )

    await user.click(screen.getByRole('button', { name: 'Create a list' }))
    await user.type(screen.getByLabelText('Name'), 'Watch with Sam')
    await user.click(screen.getByRole('button', { name: 'Create list' }))

    expect(
      await screen.findByRole('heading', { name: 'Watch with Sam' }),
    ).toBeInTheDocument()
  })

  it('shows a validation error when creating a list without a name', async () => {
    mockLoaderData({ lists: [] })
    const user = userEvent.setup()
    await renderAuthedRoute('/lists')

    await user.click(screen.getByRole('button', { name: 'Create a list' }))
    await user.click(screen.getByRole('button', { name: 'Create list' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Give your list a name.',
    )
    expect(createList).not.toHaveBeenCalled()
  })

  it('opens a list into the full-screen management view', async () => {
    mockLoaderData()
    const user = userEvent.setup()
    await renderAuthedRoute('/lists')

    await openList(user)

    const dialog = screen.getByRole('dialog')
    expect(
      within(dialog).getByText('Films worth a rewatch.'),
    ).toBeInTheDocument()
    expect(within(dialog).getByText(fakeMovie.title)).toBeInTheDocument()
  })

  it('closes the overlay if the open list disappears from a refresh this tab did not cause (e.g. deleted elsewhere)', async () => {
    mockLoaderData()
    vi.mocked(removeListItem).mockResolvedValue(undefined as never)
    const user = userEvent.setup()
    await renderAuthedRoute('/lists')
    await openList(user)

    // Simulate the list having been deleted from another tab/session — the
    // next successful refresh no longer includes it.
    vi.mocked(getLists).mockResolvedValue([])

    await user.click(
      screen.getByRole('button', { name: `Remove ${fakeMovie.title}` }),
    )

    await waitFor(() =>
      expect(
        screen.queryByRole('heading', { name: 'Best of the decade' }),
      ).not.toBeInTheDocument(),
    )
  })

  it('adds a film via TMDB search', async () => {
    mockLoaderData()
    vi.mocked(searchMovies).mockResolvedValue([freshTmdbResult])
    vi.mocked(addListItem).mockResolvedValue(undefined as never)
    const user = userEvent.setup()
    await renderAuthedRoute('/lists')
    await openList(user)

    await user.type(screen.getByLabelText('Search TMDB'), 'Fresh')
    await user.click(await screen.findByRole('button', { name: /fresh find/i }))

    await waitFor(() =>
      expect(addListItem).toHaveBeenCalledWith({
        data: { listId: fakeList.id, tmdbId: freshTmdbResult.tmdbId },
      }),
    )
  })

  it('adding a film already on the list is a no-op', async () => {
    mockLoaderData()
    vi.mocked(searchMovies).mockResolvedValue([
      {
        tmdbId: fakeMovie.tmdbId,
        title: fakeMovie.title,
        releaseDate: fakeMovie.releaseDate,
        posterUrl: fakeMovie.posterImg,
      },
    ])
    const user = userEvent.setup()
    await renderAuthedRoute('/lists')
    await openList(user)

    await user.type(screen.getByLabelText('Search TMDB'), 'Parasite')
    const resultsList = await screen.findByRole('list')
    const resultButton = within(resultsList).getByRole('button', {
      name: new RegExp(fakeMovie.title, 'i'),
    })

    expect(resultButton).toBeDisabled()
    expect(
      within(resultButton).getByText('Already in list'),
    ).toBeInTheDocument()
  })

  it('adds a film from the user’s own journal, filtered by title', async () => {
    mockLoaderData()
    vi.mocked(addListItem).mockResolvedValue(undefined as never)
    const user = userEvent.setup()
    await renderAuthedRoute('/lists')
    await openList(user)

    await user.click(screen.getByRole('button', { name: 'From your journal' }))
    await user.type(screen.getByLabelText('Search your journal'), 'From the')

    const resultsList = await screen.findByRole('list')
    expect(
      within(resultsList).queryByText(fakeMovie.title),
    ).not.toBeInTheDocument()
    await user.click(
      within(resultsList).getByRole('button', { name: /from the journal/i }),
    )

    await waitFor(() =>
      expect(addListItem).toHaveBeenCalledWith({
        data: { listId: fakeList.id, tmdbId: secondJournalMovie.tmdbId },
      }),
    )
  })

  it('removes a film from the list', async () => {
    mockLoaderData()
    vi.mocked(removeListItem).mockResolvedValue(undefined as never)
    const user = userEvent.setup()
    await renderAuthedRoute('/lists')
    await openList(user)

    await user.click(
      screen.getByRole('button', { name: `Remove ${fakeMovie.title}` }),
    )

    await waitFor(() =>
      expect(removeListItem).toHaveBeenCalledWith({
        data: { listId: fakeList.id, tmdbId: fakeMovie.tmdbId },
      }),
    )
  })

  it('shows an error when a mutation succeeds but the on-screen refresh fails (issue #20, finding 2)', async () => {
    mockLoaderData()
    vi.mocked(removeListItem).mockResolvedValue(undefined as never)
    const user = userEvent.setup()
    const { router } = await renderAuthedRoute('/lists')
    await openList(user)
    vi.spyOn(router, 'invalidate').mockRejectedValueOnce(
      new Error('network blip'),
    )

    await user.click(
      screen.getByRole('button', { name: `Remove ${fakeMovie.title}` }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Saved, but the list on screen may be out of date. Refresh to see the latest.',
    )
  })

  it('deletes a list behind a confirm step', async () => {
    mockLoaderData()
    vi.mocked(deleteList).mockResolvedValue(fakeList as never)
    const user = userEvent.setup()
    await renderAuthedRoute('/lists')
    await openList(user)

    await user.click(screen.getByRole('button', { name: 'Delete list' }))
    expect(deleteList).not.toHaveBeenCalled()

    await user.click(screen.getAllByRole('button', { name: 'Delete list' })[1])

    await waitFor(() =>
      expect(deleteList).toHaveBeenCalledWith({
        data: { listId: fakeList.id },
      }),
    )
    await waitFor(() =>
      expect(
        screen.queryByRole('heading', { name: 'Best of the decade' }),
      ).not.toBeInTheDocument(),
    )
  })

  it('hides a deleted list from the grid even if the post-delete refresh fails', async () => {
    mockLoaderData()
    vi.mocked(deleteList).mockResolvedValue(fakeList as never)
    const user = userEvent.setup()
    const { router } = await renderAuthedRoute('/lists')
    await openList(user)
    vi.spyOn(router, 'invalidate').mockRejectedValueOnce(
      new Error('network blip'),
    )

    await user.click(screen.getByRole('button', { name: 'Delete list' }))
    await user.click(screen.getAllByRole('button', { name: 'Delete list' })[1])

    await waitFor(() =>
      expect(
        screen.queryByRole('heading', { name: 'Best of the decade' }),
      ).not.toBeInTheDocument(),
    )
    expect(
      screen.getByRole('heading', { name: 'No lists yet' }),
    ).toBeInTheDocument()
  })

  it('shows an error banner when a mutation is rejected as not owned', async () => {
    mockLoaderData()
    vi.mocked(removeListItem).mockRejectedValue(
      new Error('This list no longer exists.'),
    )
    const user = userEvent.setup()
    await renderAuthedRoute('/lists')
    await openList(user)

    await user.click(
      screen.getByRole('button', { name: `Remove ${fakeMovie.title}` }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'This list no longer exists.',
    )
  })
})
