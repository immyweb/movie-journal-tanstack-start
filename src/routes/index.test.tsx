import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'

import { renderRoute } from '#/test/render-route'
import { getShowcaseFilms } from '#/lib/tmdb/showcase'
import { showcaseFilms } from '#/test/fixtures/journal'

vi.mock('#/lib/tmdb/showcase', () => ({ getShowcaseFilms: vi.fn() }))

describe('Home', () => {
  beforeEach(() => {
    vi.mocked(getShowcaseFilms).mockResolvedValue(showcaseFilms)
  })

  it('renders the showcase films from the loader', async () => {
    await renderRoute('/')

    expect(await screen.findByText('Parasite')).toBeInTheDocument()
    expect(
      screen.getByText('Still thinking about the stairs.', { exact: false }),
    ).toBeInTheDocument()
  })

  it('links visitors to sign in and to register a journal', async () => {
    await renderRoute('/')

    await screen.findByText('Parasite')

    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      '/sign-in',
    )
    expect(
      screen.getAllByRole('link', { name: /Start your journal/i })[0],
    ).toHaveAttribute('href', '/register')
  })
})
