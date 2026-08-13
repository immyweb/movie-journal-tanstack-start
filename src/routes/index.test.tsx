import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'

import { renderRoute } from '#/test/render-route'
import type { ShowcaseFilm } from '#/lib/tmdb/showcase'

vi.mock('#/lib/tmdb/showcase', () => {
  const showcaseFilms: Array<ShowcaseFilm> = [
    {
      tmdbId: '496243',
      title: 'Parasite',
      year: '2019',
      country: 'South Korea',
      rating: 5,
      liked: true,
      review: 'Still thinking about the stairs.',
      dateWatched: '12 Jul 2026',
      posterUrl: 'https://image.tmdb.org/t/p/w342/poster.jpg',
    },
  ]

  return { getShowcaseFilms: vi.fn().mockResolvedValue(showcaseFilms) }
})

describe('Home', () => {
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
