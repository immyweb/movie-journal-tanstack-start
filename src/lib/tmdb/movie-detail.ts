import { tmdbFetch } from '#/lib/tmdb/client'

// The richer, detail-page-only fields fetched live rather than cached
// (ADR 0005) — director/cast come from TMDB's credits endpoint, appended to
// the movie details call in one request.
export type MovieDetail = {
  director: string | null
  cast: Array<string>
  genre: string | null
  language: string | null
  runtime: string | null
}

type TmdbMovieDetailResponse = {
  genres: Array<{ name: string }>
  runtime: number | null
  spoken_languages: Array<{ english_name: string }>
  credits: {
    cast: Array<{ name: string }>
    crew: Array<{ name: string; job: string }>
  }
}

export async function fetchMovieDetail(
  tmdbId: string,
): Promise<MovieDetail | null> {
  const response = await tmdbFetch(`/movie/${tmdbId}`, {
    append_to_response: 'credits',
  })

  if (!response.ok) return null

  const data = (await response.json()) as TmdbMovieDetailResponse

  return {
    director:
      data.credits.crew.find((member) => member.job === 'Director')?.name ??
      null,
    cast: data.credits.cast.slice(0, 5).map((member) => member.name),
    genre: data.genres.map((genre) => genre.name).join(', ') || null,
    language: data.spoken_languages[0]?.english_name ?? null,
    runtime: data.runtime ? `${data.runtime} min` : null,
  }
}
