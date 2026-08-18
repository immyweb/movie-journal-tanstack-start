import { useEffect, useMemo, useState } from 'react'

import { useDebouncedValue } from '#/lib/use-debounced-value'
import { searchMovies, type MovieSearchResult } from '#/lib/tmdb/search'

// The "find a film to add" logic behind a List's two add sources: live TMDB
// search, or the signed-in user's own logged films, filtered client-side by
// title (see spec issue #15's List creation & management decision).

export type MoviePickerSource = 'tmdb' | 'journal'

export function useMoviePicker(journalMovies: Array<MovieSearchResult>) {
  const [source, setSource] = useState<MoviePickerSource>('tmdb')
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query, 350)
  const [tmdbResults, setTmdbResults] = useState<Array<MovieSearchResult>>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  useEffect(() => {
    if (source !== 'tmdb') return
    const trimmed = debouncedQuery.trim()

    if (trimmed.length < 2) {
      setTmdbResults([])
      setSearchError(null)
      setIsSearching(false)
      return
    }

    let cancelled = false
    setIsSearching(true)
    setSearchError(null)

    searchMovies({ data: { query: trimmed } })
      .then((data) => {
        if (!cancelled) setTmdbResults(data)
      })
      .catch(() => {
        if (!cancelled) {
          setSearchError("Couldn't reach TMDB. Try again in a moment.")
        }
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false)
      })

    return () => {
      cancelled = true
    }
  }, [source, debouncedQuery])

  // journalMovies is a fully-loaded in-memory array — unlike the TMDB path,
  // there's no external call to protect from being hammered, so this stays
  // on the live `query` rather than the debounced one: memoized (issue
  // #20, finding 10) so it doesn't re-filter on every unrelated render, but
  // not debounced, since that would only add input lag with no benefit.
  const journalResults = useMemo(() => {
    if (source !== 'journal') return []
    const trimmed = query.trim().toLowerCase()
    return journalMovies.filter((movie) =>
      movie.title.toLowerCase().includes(trimmed),
    )
  }, [source, query, journalMovies])

  return {
    source,
    setSource,
    query,
    setQuery,
    results: source === 'tmdb' ? tmdbResults : journalResults,
    isSearching: source === 'tmdb' && isSearching,
    searchError: source === 'tmdb' ? searchError : null,
  }
}
