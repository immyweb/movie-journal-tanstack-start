import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderAuthedRoute } from '#/test/render-authed-route'
import { fakeJournalEntry } from '#/test/fixtures/journal'
import { editFilm, getJournalEntryForEdit } from '#/lib/journal/edit-film'
import { deleteFilm } from '#/lib/journal/delete-film'

vi.mock('#/lib/journal/edit-film', () => ({
  getJournalEntryForEdit: vi.fn(),
  editFilm: vi.fn(),
}))

vi.mock('#/lib/journal/delete-film', () => ({
  deleteFilm: vi.fn(),
}))

async function renderEditPage() {
  vi.mocked(getJournalEntryForEdit).mockResolvedValue(fakeJournalEntry as never)
  const view = await renderAuthedRoute(`/journal/${fakeJournalEntry.id}/edit`)
  await screen.findByText(fakeJournalEntry.movie.title)
  return view
}

describe('Edit entry', () => {
  it('prefills the form with the entry’s existing values', async () => {
    await renderEditPage()

    expect(screen.getByLabelText('Date watched')).toHaveValue('2026-07-12')
    expect(screen.getByRole('radio', { name: '5 stars' })).toBeChecked()
    expect(screen.getByLabelText('Review')).toHaveValue(fakeJournalEntry.review)
    expect(screen.getByRole('switch')).toBeChecked()
  })

  it('saves changes and returns to the entry detail page', async () => {
    vi.mocked(editFilm).mockResolvedValue(fakeJournalEntry as never)
    const user = userEvent.setup()
    const { router } = await renderEditPage()
    const navigateSpy = vi
      .spyOn(router, 'navigate')
      .mockResolvedValue(undefined as never)

    await user.clear(screen.getByLabelText('Review'))
    await user.type(screen.getByLabelText('Review'), 'Updated review.')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() =>
      expect(editFilm).toHaveBeenCalledWith({
        data: {
          entryId: fakeJournalEntry.id,
          dateWatched: '2026-07-12',
          rating: 5,
          review: 'Updated review.',
          like: true,
        },
      }),
    )
    expect(navigateSpy).toHaveBeenCalledWith({
      to: '/journal/$entryId',
      params: { entryId: fakeJournalEntry.id },
    })
  })

  it('shows an error banner when saving fails', async () => {
    vi.mocked(editFilm).mockRejectedValue(new Error('boom'))
    const user = userEvent.setup()
    await renderEditPage()

    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Something went wrong saving these changes. Please try again.',
    )
  })

  it('opens the delete confirmation dialog and cancels without deleting', async () => {
    const user = userEvent.setup()
    await renderEditPage()

    await user.click(screen.getByRole('button', { name: 'Delete this entry' }))

    const dialog = await screen.findByRole('alertdialog')
    expect(within(dialog).getByText('Delete this entry?')).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Keep it' }))

    await waitFor(() =>
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument(),
    )
    expect(deleteFilm).not.toHaveBeenCalled()
  })

  it('confirms delete and navigates to the journal list', async () => {
    vi.mocked(deleteFilm).mockResolvedValue(fakeJournalEntry as never)
    const user = userEvent.setup()
    const { router } = await renderEditPage()
    const navigateSpy = vi
      .spyOn(router, 'navigate')
      .mockResolvedValue(undefined as never)

    await user.click(screen.getByRole('button', { name: 'Delete this entry' }))
    const dialog = await screen.findByRole('alertdialog')
    await user.click(
      within(dialog).getByRole('button', { name: 'Delete entry' }),
    )

    await waitFor(() =>
      expect(deleteFilm).toHaveBeenCalledWith({
        data: { entryId: fakeJournalEntry.id },
      }),
    )
    expect(navigateSpy).toHaveBeenCalledWith({ to: '/journal' })
  })

  it('shows an error banner in the dialog when delete fails', async () => {
    vi.mocked(deleteFilm).mockRejectedValue(new Error('boom'))
    const user = userEvent.setup()
    await renderEditPage()

    await user.click(screen.getByRole('button', { name: 'Delete this entry' }))
    const dialog = await screen.findByRole('alertdialog')
    await user.click(
      within(dialog).getByRole('button', { name: 'Delete entry' }),
    )

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'Something went wrong deleting this entry. Please try again.',
    )
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
  })

  it('shows a not-found message when the entry does not exist', async () => {
    vi.mocked(getJournalEntryForEdit).mockResolvedValue(null as never)

    await renderAuthedRoute('/journal/does-not-exist/edit')

    expect(
      await screen.findByRole('heading', { name: 'Entry not found' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Back to journal' }),
    ).toHaveAttribute('href', '/journal')
  })
})
