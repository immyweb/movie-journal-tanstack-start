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

**Register**:
The action of creating a new User account by submitting a name, email, and password.
_Avoid_: Sign up, Create account

**Sign In**:
The action of authenticating as an existing User with email and password to start a session.
_Avoid_: Log in, Login

**Log a film**:
The action of creating a JournalEntry: searching TMDB for a film, then recording when it was watched, a rating, a review, and like status.
_Avoid_: Add movie, Add a movie, Log a movie

**Watch count**:
The number of JournalEntries a User has for a given Movie — a per-user rewatch tally, computed from JournalEntry rows rather than stored.
_Avoid_: Rewatch count, Times watched

**Film detail page**:
A page showing a single JournalEntry in full: its Movie's cached summary plus TMDB detail fields fetched live (director, cast, genre, language, runtime), the entry's own dateWatched, rating, review, and like status, and a read-only Watch count for context. Scoped to one JournalEntry, not to all of a User's watches of a Movie — the entry point for editing that entry.
_Avoid_: Movie detail page, Film page

**Edit a film**:
The action of updating an existing JournalEntry's dateWatched, rating, review, and like status. Does not allow reassigning which Movie the entry points to — that's fixed at Log a film time. Reached from the Film detail page.
_Avoid_: Edit a movie, Edit entry, Update entry
