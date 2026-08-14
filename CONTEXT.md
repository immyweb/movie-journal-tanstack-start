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
The full collection of a single user's JournalEntries, browsable on the Journal page. Filterable by Genre, Decade, rating (minimum threshold), and like status; sortable by rating, Decade, dateWatched, and like status — but not by Genre (ADR 0012).
_Avoid_: Watchlist, Library

**Genre**:
One or more categories TMDB assigns to a Movie (e.g. Thriller, Comedy). Cached on the Movie row at add-time specifically to support server-side Journal filtering (ADR 0012) — unlike the other detail-page-only TMDB fields. Not a sort dimension: a Movie can carry several genres, so there's no single value to order by.
_Avoid_: Category, tag

**Decade**:
The 10-year span a Movie's releaseDate falls into (e.g. the 1990s), used only to filter and sort the Journal. Never stored — always computed from releaseDate at query time.
_Avoid_: Era, release decade

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

**Delete a film**:
The action of permanently removing a JournalEntry, including its rating, review, and like status. Does not remove the underlying Movie cache row (ADR 0010). Reached from the Edit a film form, behind a warning-and-confirm step.
_Avoid_: Delete a movie, Delete entry, Remove entry

**List**:
A user's named, single-owner collection of Movies, distinct from a Journal — it carries no per-user watch data (no rating, review, dateWatched). A Movie can appear on a List at most once. Shared publicly via a Share link; always live (a viewer sees the List's current state, never a frozen snapshot).
_Avoid_: Watchlist, Playlist, Collection

**ListItem**:
One Movie's membership on a List, recording when it was added. Distinct from JournalEntry: it references a Movie directly, not a user's personal watch record of one.
_Avoid_: ListEntry

**Share token**:
The unguessable value stored on a List that a Share link is built from. Not the List's database id — a separate value specifically so a List's public URL doesn't expose or make its internal id enumerable.
_Avoid_: Share id, Slug

**Share link**:
The public URL a List's owner distributes to let others view it, built from the List's Share token. Viewable while signed out.
_Avoid_: Share URL, Public link
