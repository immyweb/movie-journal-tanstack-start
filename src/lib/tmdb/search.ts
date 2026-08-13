import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { TMDB_IMAGE_BASE, tmdbFetch } from '#/lib/tmdb/client'

const searchMoviesSchema = z.object({
  query: z.string().min(1),
})

export type MovieSearchResult = {
  tmdbId: string
  title: string
  releaseDate: string | null
  posterUrl: string | null
}

type TmdbSearchResponse = {
  results: Array<{
    id: number
    title: string
    release_date: string | null
    poster_path: string | null
  }>
}

export const searchMovies = createServerFn({ method: 'GET' })
  .validator(searchMoviesSchema)
  .handler(async ({ data }): Promise<Array<MovieSearchResult>> => {
    const response = await tmdbFetch('/search/movie', {
      query: data.query,
      include_adult: 'false',
      language: 'en-US',
      page: '1',
    })

    // Distinct from a genuine zero-result search, so the client's error
    // banner fires instead of a misleading "no films found".
    if (!response.ok) {
      throw new Error('TMDB search request failed')
    }

    const body = (await response.json()) as TmdbSearchResponse

    return body.results.map((result) => ({
      tmdbId: String(result.id),
      title: result.title,
      releaseDate: result.release_date || null,
      posterUrl: result.poster_path
        ? `${TMDB_IMAGE_BASE}${result.poster_path}`
        : null,
    }))
  })
