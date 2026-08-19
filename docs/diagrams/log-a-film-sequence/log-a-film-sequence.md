# Sequence: Log a film

Traces `/journal/new` (`src/routes/_authed.journal_.new.tsx`) end to end: TMDB search,
optional rewatch notice, then the `logFilm` server function
(`src/lib/journal/log-film.ts`) that writes `Movie` and `JournalEntry` together.

```mermaid
sequenceDiagram
    actor User
    participant Client as Browser<br/>(/journal/new)
    participant Search as searchMovies<br/>(server fn)
    participant WatchCount as getWatchCount<br/>(server fn)
    participant LogFilm as logFilm<br/>(server fn)
    participant Auth as ensureSession<br/>(Better Auth)
    participant TMDB as TMDB API
    participant DB as Postgres<br/>(movie, journal_entry)

    User->>Client: Types search query
    Note over Client: debounced 350ms, min 2 chars
    Client->>Search: searchMovies({ query })
    Search->>TMDB: GET /search/movie
    TMDB-->>Search: results[]
    Search-->>Client: MovieSearchResult[]
    Client-->>User: Render poster grid

    User->>Client: Selects a film
    Client->>WatchCount: getWatchCount({ tmdbId })
    WatchCount->>DB: SELECT count(*) journal_entry<br/>WHERE userId, movieId
    DB-->>WatchCount: count
    WatchCount-->>Client: count
    Note over Client: "You've logged this N times before"<br/>(non-critical — failure silently ignored)

    User->>Client: Fills dateWatched, rating,<br/>review, like — submits
    Client->>LogFilm: logFilm({ tmdbId, dateWatched,<br/>rating, review, like })
    LogFilm->>Auth: ensureSession()
    Auth-->>LogFilm: session (throws → sign-in if none)

    LogFilm->>DB: BEGIN transaction
    LogFilm->>DB: SELECT movie WHERE tmdbId
    DB-->>LogFilm: existingMovie?

    alt Movie not cached yet
        LogFilm->>TMDB: GET /movie/{tmdbId}
        alt TMDB confirms the film
            TMDB-->>LogFilm: title, poster, releaseDate, genres
            LogFilm->>DB: INSERT movie (ON CONFLICT DO NOTHING)
        else TMDB can't confirm it
            TMDB-->>LogFilm: not found / error
            LogFilm-->>Client: throw "Could not find this film on TMDB."
        end
    else Movie already cached
        Note over LogFilm: skip TMDB call — a rewatch shouldn't fail<br/>because TMDB is having a bad moment
    end

    LogFilm->>DB: INSERT journal_entry<br/>(userId, movieId, dateWatched, rating, review, like)
    DB-->>LogFilm: entry
    LogFilm->>DB: COMMIT
    LogFilm-->>Client: entry
    Client->>Client: navigate to /journal
    Client-->>User: Redirect to Journal
```

## Notes

- **Two separate TMDB calls, two separate purposes**: `searchMovies` (client-triggered,
  as the user types) only needs title/poster/release year to render the picker.
  `fetchMovieSummary` (server-triggered, at submit time) fetches the fuller record that
  gets persisted — client-supplied search-result fields are never trusted directly into
  the `Movie` cache (ADR 0005).
- **Movie is written once, on submit — not on selection.** Picking a search result
  doesn't touch the database; `Movie` is immutable and created only inside the
  `logFilm` transaction, and only if it isn't already cached (see CONTEXT.md > Movie,
  ADR 0001).
- **Rewatches skip TMDB entirely.** If `Movie` is already cached, `logFilm` never calls
  TMDB — so logging a rewatch can't fail due to a TMDB outage.
- **`Movie` + `JournalEntry` are written in one transaction**, so a failure fetching or
  inserting the `Movie` row can't leave an orphaned `JournalEntry` (or vice versa).
- **The one specific TMDB error message shown to the user** — "Could not find this
  film on TMDB." — is deliberately narrow; any other failure surfaces a generic message
  so internal errors don't leak (`_authed.journal_.new.tsx`).
- **`getWatchCount` is best-effort**: it only powers the "you've logged this N times
  before" notice, so its failure is swallowed client-side rather than blocking the form.
