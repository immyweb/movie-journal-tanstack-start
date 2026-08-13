const TMDB_API_BASE = 'https://api.themoviedb.org/3'

export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w342'
export const TMDB_POSTER_LARGE_BASE = 'https://image.tmdb.org/t/p/w500'
export const TMDB_BACKDROP_BASE = 'https://image.tmdb.org/t/p/w1280'

export async function tmdbFetch(path: string, params?: Record<string, string>) {
  const url = new URL(`${TMDB_API_BASE}${path}`)

  for (const [key, value] of Object.entries(params ?? {})) {
    url.searchParams.set(key, value)
  }

  return fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
      accept: 'application/json',
    },
  })
}
