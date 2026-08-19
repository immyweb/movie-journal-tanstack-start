# Route tree

Every route under `src/routes/`, grouped by which of the three rendering categories
(ADR 0004, ADR 0015) it belongs to — complementing the system-design diagram, which
groups by rendering strategy rather than URL shape.

```mermaid
flowchart TD
    Root(["__root.tsx<br/>global HTML shell"])

    subgraph Indexed["Indexed SSR + hydration — ADR 0004"]
        Index["/<br/>Homepage — TMDB showcase, search"]
    end

    subgraph AuthForms["Signed-out auth forms (SSR + hydration)"]
        direction TB
        Register["/register"]
        SignIn["/sign-in"]
    end

    ApiAuth[["/api/auth/$<br/>Better Auth catch-all handler"]]

    subgraph AuthedShell["_authed layout — session-gated, CSR after first load (ADR 0004)"]
        direction TB
        Journal["/journal<br/>Journal listing (leaf page)"]
        JournalNew["/journal/new<br/>Log a film"]
        JournalEntry["/journal/:entryId<br/>Film detail"]
        JournalEdit["/journal/:entryId/edit<br/>Edit a film"]
        Lists["/lists<br/>Your Lists"]
        Settings["/settings"]
    end

    subgraph PublicShell["_public layout — anonymous, noindex, always SSR (ADR 0015)"]
        direction TB
        PublicJournal["/journal/u/:username<br/>Public Journal"]
        PublicList["/lists/:shareToken<br/>List share link"]
    end

    Root --> Index
    Root --> Register
    Root --> ApiAuth
    Root --> AuthedShell
    Root --> PublicShell

    %% Invisible layout-only edges: force every sibling — subgraphs and the
    %% nodes within each subgraph alike — into a single vertical chain
    %% (tall/narrow) instead of spreading across ranks side by side.
    Index ~~~ Register
    Register ~~~ SignIn
    SignIn ~~~ ApiAuth
    ApiAuth ~~~ Journal
    Journal ~~~ JournalNew
    JournalNew ~~~ JournalEntry
    JournalEntry ~~~ JournalEdit
    JournalEdit ~~~ Lists
    Lists ~~~ Settings
    Settings ~~~ PublicJournal
    PublicJournal ~~~ PublicList

    classDef indexed fill:#dcfce7,stroke:#16a34a,color:#14532d
    classDef authForm fill:#e0e7ff,stroke:#4f46e5,color:#312e81
    classDef api fill:#f3f4f6,stroke:#6b7280,color:#1f2937
    classDef authed fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef public fill:#ffedd5,stroke:#ea580c,color:#7c2d12

    class Index indexed
    class Register,SignIn authForm
    class ApiAuth api
    class Journal,JournalNew,JournalEntry,JournalEdit,Lists,Settings authed
    class PublicJournal,PublicList public
```

## Notes

- **`/journal/new`, `/journal/:entryId`, and `/journal/:entryId/edit` don't nest under
  `/journal`'s component**, despite the path shape suggesting otherwise. `journal.tsx`
  is a leaf page (a loader-driven listing, no `<Outlet/>`), so the sibling files use
  TanStack Router's trailing-underscore filename convention
  (`_authed.journal_.$entryId.tsx`, etc.) to claim those paths without requiring a
  shared parent layout. All four still sit under `_authed`, so they still get the
  session gate and the site header/nav shell.
- **Three rendering categories, not two** (ADR 0004 originally drew two; ADR 0015 added
  the third): the indexed homepage is the only page SEO cares about; `_authed/*` trades
  indexing for an app-like CSR experience once past the first load; `_public/*` needs
  SSR (so a shared link works without JS and unfurls correctly) but is deliberately
  `noindex` and carries no owner/visitor distinction.
- **`/register` and `/sign-in` aren't inside either shell** — they're top-level routes
  rendered before a session exists, so they can't sit under `_authed` (which requires
  one) or `_public` (reserved for the anonymous List-share / Public-Journal pages).
- **`/api/auth/$` isn't a page at all** — a catch-all route whose `GET`/`POST` handlers
  forward every request straight to `auth.handler` (see the auth/session sequence
  diagram).
- **The Public Journal path is `/journal/u/:username`**, not the bare `/journal/:username`
  ADR 0015 originally specified. ADR 0016 amends that choice: the plain
  `_authed.journal_.$entryId.tsx` route already occupies the same one-segment shape
  under `/journal`, and TanStack Router has no way to prefer one dynamic route over
  another of equal specificity — the authed entry-detail route always won, leaving the
  public route unreachable. The static `u` segment resolves the collision while keeping
  ADR 0015's original reasoning (confine collision risk to the `/journal` prefix).
