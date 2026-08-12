# Movie Journal

A CRUD app for logging movies a user has watched, built as an evaluation of TanStack Start against Next.js for a future project. See `docs/SYSTEM-DESIGN.md` for the full requirements and API spec.

## Language

**Movie**:
A cached snapshot of a film's catalog data (title, poster, release date), sourced from TMDB and keyed by its TMDB id. Written once when a user first adds it to their journal; immutable thereafter.
_Avoid_: Film, MovieEntry

**JournalEntry**:
A user's personal record of having watched a specific Movie — when they watched it, their rating, review, and whether they liked it. A user may have multiple JournalEntries for the same Movie (rewatches).
_Avoid_: WatchedMovie, Entry, Log, MovieEntry

**Journal**:
The full collection of a single user's JournalEntries, browsable and filterable on the Journal page.
_Avoid_: Watchlist, Library

**TMDB**:
The Movie Database — the external API that supplies movie search results and catalog data. Referenced via each Movie's TMDB id; not owned by this system.
_Avoid_: The API, the movie API

**User**:
An account holder, authenticated via Better Auth. Owns zero or more JournalEntries.
