import { useEffect, useState } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { Film } from 'lucide-react'

import { formatReleaseYear } from '#/lib/format-release-year'
import { type LogFilmFormInput } from '#/lib/validation/journal-entry'
import { searchMovies, type MovieSearchResult } from '#/lib/tmdb/search'
import { getWatchCount } from '#/lib/journal/entries'
import { logFilm } from '#/lib/journal/log-film'
import { AuthField } from '#/components/auth-field'
import { ErrorBanner } from '#/components/error-banner'
import { LogFilmForm } from '#/components/log-film-form'

export const Route = createFileRoute('/_authed/journal_/new')({
  head: () => ({
    meta: [{ title: 'Log a film — Movie Journal' }],
  }),
  component: NewEntryPage,
})

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timeout)
  }, [value, delayMs])

  return debounced
}

function todayLocalISODate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function NewEntryPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query, 350)
  const [results, setResults] = useState<Array<MovieSearchResult>>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [selected, setSelected] = useState<MovieSearchResult | null>(null)

  useEffect(() => {
    const trimmed = debouncedQuery.trim()

    if (trimmed.length < 2) {
      setResults([])
      setSearchError(null)
      setIsSearching(false)
      return
    }

    let cancelled = false
    setIsSearching(true)
    setSearchError(null)

    searchMovies({ data: { query: trimmed } })
      .then((data) => {
        if (!cancelled) setResults(data)
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
  }, [debouncedQuery])

  return (
    <>
      <section className="px-6 pt-6 pb-10 text-center">
        <div className="text-lm-amber font-lm-mono text-xs font-bold tracking-[0.14em] uppercase">
          New stub
        </div>
        <h1 className="mt-2.5 mb-[14px] text-[clamp(2rem,5vw,3.4rem)] leading-[1.05] font-black tracking-[-0.01em] text-balance">
          Log a film
        </h1>
        <p className="text-lm-mist mx-auto max-w-[520px] text-[1.05rem] leading-[1.6]">
          Search TMDB, pick the film you watched, and stub it into your journal.
        </p>
      </section>

      <section className="px-6 pb-16">
        <div className="mx-auto max-w-[720px]">
          {selected ? (
            <NewEntryForm
              key={selected.tmdbId}
              movie={selected}
              onBack={() => setSelected(null)}
              onLogged={() => router.navigate({ to: '/journal' })}
            />
          ) : (
            <div className="space-y-5">
              <AuthField
                id="search"
                label="Search TMDB"
                type="search"
                placeholder="Try “The Matrix”"
                autoComplete="off"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />

              {searchError && <ErrorBanner>{searchError}</ErrorBanner>}

              {isSearching && (
                <p className="text-lm-mist font-lm-mono text-xs tracking-[0.08em] uppercase">
                  Searching…
                </p>
              )}

              {!isSearching &&
                results.length === 0 &&
                query.trim().length >= 2 && (
                  <p className="text-lm-mist text-sm">
                    No films found for &ldquo;{query.trim()}&rdquo;.
                  </p>
                )}

              <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
                {results.map((result) => (
                  <button
                    key={result.tmdbId}
                    type="button"
                    aria-label={`${result.title}, ${formatReleaseYear(result.releaseDate)}`}
                    onClick={() => setSelected(result)}
                    className="border-lm-line bg-lm-surface hover:border-lm-amber focus-visible:outline-lm-amber flex cursor-pointer flex-col overflow-hidden rounded-lg border text-left outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <div className="bg-lm-surface aspect-[2/3] w-full">
                      {result.posterUrl ? (
                        <img
                          src={result.posterUrl}
                          alt=""
                          className="block h-full w-full object-cover"
                        />
                      ) : (
                        <div className="text-lm-mist flex h-full w-full items-center justify-center">
                          <Film aria-hidden="true" size={28} />
                        </div>
                      )}
                    </div>
                    <div className="px-2.5 py-2">
                      <div className="line-clamp-2 text-[13.5px] leading-tight font-bold">
                        {result.title}
                      </div>
                      <div className="text-lm-mist text-xs">
                        {formatReleaseYear(result.releaseDate)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

function NewEntryForm({
  movie,
  onBack,
  onLogged,
}: {
  movie: MovieSearchResult
  onBack: () => void
  onLogged: () => void
}) {
  const [watchCount, setWatchCount] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    getWatchCount({ data: { tmdbId: movie.tmdbId } })
      .then((count) => {
        if (!cancelled) setWatchCount(count)
      })
      .catch(() => {
        // Non-critical: the rewatch notice just won't show.
      })

    return () => {
      cancelled = true
    }
  }, [movie.tmdbId])

  const onSubmit = async (values: LogFilmFormInput) => {
    try {
      await logFilm({
        data: {
          tmdbId: movie.tmdbId,
          dateWatched: values.dateWatched,
          rating: values.rating,
          review: values.review?.trim() ? values.review.trim() : null,
          like: values.like,
        },
      })
      onLogged()
    } catch (error) {
      // logFilm throws this one specific, safe-to-show message when TMDB
      // can't confirm a brand-new movie exists; anything else stays generic
      // so unrelated internal errors don't leak to the user.
      throw new Error(
        error instanceof Error &&
          error.message === 'Could not find this film on TMDB.'
          ? error.message
          : 'Something went wrong logging this film. Please try again.',
      )
    }
  }

  return (
    <LogFilmForm
      movie={movie}
      defaultValues={{
        dateWatched: todayLocalISODate(),
        rating: null,
        review: null,
        like: false,
      }}
      watchCount={watchCount}
      onCancel={onBack}
      cancelLabel="Change film"
      submitLabel="Log this watch"
      submittingLabel="Logging…"
      onSubmit={onSubmit}
    />
  )
}
