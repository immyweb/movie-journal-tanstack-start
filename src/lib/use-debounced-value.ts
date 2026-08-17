import { useEffect, useState } from 'react'

// Shared by every debounced TMDB search input (Log a film, the List
// add-movie picker) — settles on `value` only after `delayMs` of no
// further changes.
export function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timeout)
  }, [value, delayMs])

  return debounced
}
