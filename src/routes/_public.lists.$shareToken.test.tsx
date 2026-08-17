import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'

import { renderRoute } from '#/test/render-route'
import { fakeListShare } from '#/test/fixtures/lists'
import { getListByShareToken } from '#/lib/lists/get-list-by-share-token'

vi.mock('#/lib/lists/get-list-by-share-token', () => ({
  getListByShareToken: vi.fn(),
}))

describe('List share view', () => {
  it('renders the list, owner attribution, and its films as a poster grid', async () => {
    vi.mocked(getListByShareToken).mockResolvedValue(fakeListShare as never)

    await renderRoute('/lists/token_1')

    expect(
      await screen.findByRole('heading', { name: fakeListShare.name }),
    ).toBeInTheDocument()
    expect(screen.getByText(fakeListShare.description!)).toBeInTheDocument()
    expect(
      screen.getByText(`A list by ${fakeListShare.ownerName}`),
    ).toBeInTheDocument()

    const movie = fakeListShare.items[0].movie
    expect(
      screen.getByRole('img', { name: `${movie.title} poster` }),
    ).toBeInTheDocument()
    expect(screen.getByText(movie.title)).toBeInTheDocument()
    expect(screen.getByText('2019')).toBeInTheDocument()
  })

  it('shows an empty state when the list has no items', async () => {
    vi.mocked(getListByShareToken).mockResolvedValue({
      ...fakeListShare,
      items: [],
    } as never)

    await renderRoute('/lists/token_1')

    expect(
      await screen.findByRole('heading', { name: 'Nothing on this list yet' }),
    ).toBeInTheDocument()
  })

  it('shows a not-found message for an unknown share token', async () => {
    vi.mocked(getListByShareToken).mockResolvedValue(null as never)

    await renderRoute('/lists/does-not-exist')

    expect(
      await screen.findByRole('heading', {
        name: 'This share link doesn’t lead anywhere',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Back to Movie Journal' }),
    ).toHaveAttribute('href', '/')
  })
})
