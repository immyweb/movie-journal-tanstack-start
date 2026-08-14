import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'

import { renderAuthedRoute } from '#/test/render-authed-route'
import { fakeJournalEntry, fakeMovieDetail } from '#/test/fixtures/journal'
import { getJournalEntryDetail } from '#/lib/journal/entry-detail'

vi.mock('#/lib/journal/entry-detail', () => ({
  getJournalEntryDetail: vi.fn(),
}))

describe('Entry detail', () => {
  it('renders the entry with full TMDB detail', async () => {
    vi.mocked(getJournalEntryDetail).mockResolvedValue({
      entry: fakeJournalEntry,
      detail: fakeMovieDetail,
      watchCount: 1,
    } as never)

    await renderAuthedRoute(`/journal/${fakeJournalEntry.id}`)

    expect(
      await screen.findByRole('heading', {
        name: fakeJournalEntry.movie.title,
      }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('5 out of 5 stars')).toBeInTheDocument()
    expect(screen.getByLabelText('Liked')).toBeInTheDocument()
    expect(
      screen.getByText(fakeJournalEntry.review, { exact: false }),
    ).toBeInTheDocument()
    expect(screen.getByText('WATCHED 12 JUL 2026')).toBeInTheDocument()
    expect(screen.getByText(fakeMovieDetail.director!)).toBeInTheDocument()
    expect(screen.getByText(fakeMovieDetail.language!)).toBeInTheDocument()
    expect(
      screen.getByText(fakeMovieDetail.cast.join(', ')),
    ).toBeInTheDocument()
    expect(screen.queryByText(/logged this film/i)).not.toBeInTheDocument()
  })

  it('shows the rewatch count when watched more than once', async () => {
    vi.mocked(getJournalEntryDetail).mockResolvedValue({
      entry: fakeJournalEntry,
      detail: fakeMovieDetail,
      watchCount: 3,
    } as never)

    await renderAuthedRoute(`/journal/${fakeJournalEntry.id}`)

    expect(
      await screen.findByText('You’ve logged this film 3 times.'),
    ).toBeInTheDocument()
  })

  it('falls back gracefully when TMDB detail is unavailable', async () => {
    vi.mocked(getJournalEntryDetail).mockResolvedValue({
      entry: fakeJournalEntry,
      detail: null,
      watchCount: 1,
    } as never)

    await renderAuthedRoute(`/journal/${fakeJournalEntry.id}`)

    expect(
      await screen.findByRole('img', {
        name: `${fakeJournalEntry.movie.title} poster`,
      }),
    ).toHaveAttribute('src', fakeJournalEntry.movie.posterImg)
    expect(
      screen.queryByText(fakeMovieDetail.director!),
    ).not.toBeInTheDocument()
  })

  it('shows a 404 message when the entry does not exist', async () => {
    vi.mocked(getJournalEntryDetail).mockResolvedValue(null as never)

    await renderAuthedRoute('/journal/does-not-exist')

    expect(
      await screen.findByRole('heading', { name: 'Entry not found' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Back to journal' }),
    ).toHaveAttribute('href', '/journal')
  })
})
