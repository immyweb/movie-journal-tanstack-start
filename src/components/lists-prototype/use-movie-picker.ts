import { useEffect, useState } from 'react'

import { searchMovies } from '#/lib/tmdb/search'
import type { PickerMovie } from '#/components/lists-prototype/state'

// PROTOTYPE for issue #13 — see src/routes/_authed.lists-prototype.tsx.
//
// Shared "find a movie to add" logic behind the two sources the map's
// standing decision names: TMDB search (real, live — read-only, no
// mutation) or an existing JournalEntry's Movie (passed in, filtered
// client-side). Each variant renders this very differently; only the
// fetch/filter logic is shared.

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timeout)
  }, [value, delayMs])

  return debounced
}

export type MoviePickerSource = 'tmdb' | 'journal'

export function useMoviePicker(
  journalMovies: Array<PickerMovie>,
  initialSource: MoviePickerSource = 'tmdb',
) {
  const [source, setSource] = useState<MoviePickerSource>(initialSource)
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query, 350)
  const [tmdbResults, setTmdbResults] = useState<Array<PickerMovie>>([])
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

  const journalResults =
    source === 'journal'
      ? journalMovies.filter((movie) =>
          movie.title.toLowerCase().includes(query.trim().toLowerCase()),
        )
      : []

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
