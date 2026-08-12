import { createServerFn } from '@tanstack/react-start'

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w342'

// Hand-picked for the homepage showcase — not user data, so no DB round trip.
const SHOWCASE_FILMS = [
  {
    tmdbId: '496243',
    title: 'Parasite',
    year: '2019',
    country: 'South Korea',
    rating: 5,
    liked: true,
    review: 'Still thinking about the stairs.',
    dateWatched: '12 Jul 2026',
  },
  {
    tmdbId: '274',
    title: 'The Silence of the Lambs',
    year: '1991',
    country: 'USA',
    rating: 5,
    liked: true,
    review: "Still can't watch it with the lights off.",
    dateWatched: '30 Jun 2026',
  },
  {
    tmdbId: '1018',
    title: 'Mulholland Drive',
    year: '2001',
    country: 'USA',
    rating: 4,
    liked: true,
    review: "Still don't understand it. Loved it anyway.",
    dateWatched: '09 Jun 2026',
  },
] as const

export type ShowcaseFilm = (typeof SHOWCASE_FILMS)[number] & {
  posterUrl: string | null
}

async function fetchPosterPath(tmdbId: string): Promise<string | null> {
  const response = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}`, {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
      accept: 'application/json',
    },
  })

  if (!response.ok) return null

  const data = (await response.json()) as { poster_path: string | null }
  return data.poster_path
}

export const getShowcaseFilms = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Array<ShowcaseFilm>> => {
    return Promise.all(
      SHOWCASE_FILMS.map(async (film) => {
        const posterPath = await fetchPosterPath(film.tmdbId)
        return {
          ...film,
          posterUrl: posterPath ? `${TMDB_IMAGE_BASE}${posterPath}` : null,
        }
      }),
    )
  },
)
