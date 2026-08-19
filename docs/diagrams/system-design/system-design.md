# System Design

High-level architecture of Movie Journal — a TanStack Start monolith (SSR + client-side
server functions) backed by Postgres, with TMDB as the sole external dependency. See
`docs/SYSTEM-DESIGN.md` for requirements and `docs/adr/` for the decisions behind the
choices below.

```mermaid
flowchart TB
    Browser["Browser"]

    subgraph Routing["TanStack Router — route categories"]
        direction TB
        Home["/ (index)<br/>SSR + hydration, indexed<br/>ADR 0004"]
        Authed["_authed/*<br/>journal, journal/:id, journal/new,<br/>journal/:id/edit, lists, settings<br/>SSR shell once, then CSR nav · ADR 0004"]
        Public["_public/*<br/>journal/u/:username, lists/:shareToken<br/>SSR always, noindex, signed-out OK · ADR 0015"]
    end

    Browser --> Home
    Browser --> Authed
    Browser --> Public

    subgraph Server["TanStack Start server"]
        direction TB

        AuthRoute["/api/auth/$<br/>catch-all handler"]

        subgraph Functions["Server functions (createServerOnlyFn)"]
            direction TB
            JournalFns["journal/*<br/>page-data, entry-detail,<br/>log-film, edit-film, delete-film,<br/>get-public-journal"]
            ListFns["lists/*<br/>create-list, add/remove-list-item,<br/>delete-list, get-list-by-share-token,<br/>ensure-list-ownership"]
            SettingsFns["settings/*<br/>get-settings, save-username,<br/>set-journal-public"]
        end

        BetterAuth["Better Auth<br/>email/password only · ADR 0003<br/>username plugin · ADR 0014"]
        TmdbClient["TMDB client<br/>lib/tmdb/*"]
    end

    Authed -- "server fn calls" --> Functions
    Public -- "server fn calls" --> JournalFns
    Public -- "server fn calls" --> ListFns
    Home -- "search (client call)<br/>ADR 0007" --> TmdbClient
    AuthRoute --> BetterAuth
    Authed -. "session check<br/>beforeLoad" .-> BetterAuth
    JournalFns --> BetterAuth
    ListFns --> BetterAuth
    SettingsFns --> BetterAuth
    JournalFns -- "search, movie detail<br/>(log/edit + detail page)" --> TmdbClient
    ListFns -- "movie summary<br/>(add to list)" --> TmdbClient

    subgraph Data["Drizzle ORM"]
        direction TB
        DB[("Postgres")]
    end

    BetterAuth --> DB
    Functions --> DB

    TMDB["TMDB API<br/>external, read-only<br/>search · detail · images"]
    TmdbClient --> TMDB

    subgraph Tables["Core tables"]
        direction LR
        UserT["user / session<br/>(better-auth)"]
        MovieT["movie<br/>immutable cache · ADR 0001, 0005<br/>genre cached · ADR 0012"]
        EntryT["journal_entry<br/>per-user watch record"]
        ListT["list / list_item<br/>ADR 0013"]
    end

    DB --- Tables
```

## Notes

- **Product architecture**: a single TanStack Start monolith — no separate backend/API
  service. Server functions replace REST endpoints (`docs/SYSTEM-DESIGN.md`).
- **Rendering split** (three categories, not two): indexed public SSR homepage, an
  authenticated CSR-shell app (SSR'd once, then client-side navigation), and a third
  `noindex` SSR category for anonymous, always-live public pages — List share links and
  Public Journal (ADR 0004, ADR 0015).
- **Auth**: Better Auth, email/password only (ADR 0003), mounted as a catch-all route
  handler at `/api/auth/$`, backed by the same Postgres database via the Drizzle adapter.
  The `username` plugin backs Username / Public Journal (ADR 0014).
- **Data model**: `Movie` is an immutable TMDB snapshot cached at add-time and keyed by
  TMDB id (ADR 0001); `JournalEntry` is the mutable per-user watch record referencing it;
  `List`/`ListItem` are a separate, watch-data-free collection (ADR 0013). Deleting a
  `JournalEntry` never removes its `Movie` cache row (ADR 0010).
- **TMDB**: the only external dependency — read-only, used for search and catalog/detail
  data. The homepage search calls it directly from the client (ADR 0007); server
  functions call it server-side when logging a film, viewing a detail page, or adding to
  a list.
