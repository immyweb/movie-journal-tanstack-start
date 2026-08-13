import { TMDB_IMAGE_BASE, tmdbFetch } from '#/lib/tmdb/client'

// Fetched at log-a-film submit time and written into the Movie cache
// (ADR 0005) — not trusted from client-supplied search-result fields, since
// Movie is shared, immutable catalog data (see CONTEXT.md > Movie).
export type MovieSummary = {
  title: string
  posterImg: string | null
  releaseDate: string | null
}

export async function fetchMovieSummary(
  tmdbId: string,
): Promise<MovieSummary | null> {
  const response = await tmdbFetch(`/movie/${tmdbId}`)

  if (!response.ok) return null

  const data = (await response.json()) as {
    title: string
    poster_path: string | null
    release_date: string | null
  }

  return {
    title: data.title,
    posterImg: data.poster_path
      ? `${TMDB_IMAGE_BASE}${data.poster_path}`
      : null,
    releaseDate: data.release_date || null,
  }
}
