# Sequence: Auth & session

Four things in one diagram, because they only make sense in contrast to each other:
signing in (`src/routes/sign-in.tsx`), entering the authenticated shell
(`_authed.tsx`'s `beforeLoad`), a mutating server function re-checking the session on
its own (`ensureSession`, `src/lib/auth/functions.ts`), and a public route that skips
the check entirely (`_public.tsx`).

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant AuthClient as authClient<br/>(better-auth/react)
    participant AuthRoute as /api/auth/$<br/>(catch-all handler)
    participant BetterAuth as Better Auth<br/>(auth.handler)
    participant DB as Postgres<br/>(user, account, session)

    rect rgb(240, 240, 250)
    Note over User,DB: Sign in — ADR 0007: direct client call, no server fn wrapper
    User->>Browser: Submits email + password
    Browser->>AuthClient: authClient.signIn.email(values)
    AuthClient->>AuthRoute: POST /api/auth/sign-in/email
    AuthRoute->>BetterAuth: auth.handler(request)
    BetterAuth->>DB: SELECT user, account WHERE email
    DB-->>BetterAuth: user + hashed password
    BetterAuth->>BetterAuth: verify password hash
    BetterAuth->>DB: INSERT session (userId, token, expiresAt)
    DB-->>BetterAuth: session
    BetterAuth-->>AuthRoute: Set-Cookie: session token<br/>(tanstackStartCookies plugin)
    AuthRoute-->>AuthClient: { data: session } or { error }
    AuthClient-->>Browser: { data, error }
    Browser->>Browser: router.navigate({ to: '/journal' })
    end

    rect rgb(235, 248, 240)
    Note over Browser,DB: Entering the authenticated shell — _authed beforeLoad
    Browser->>Browser: Route match: /_authed/journal
    Browser->>AuthRoute: getSession() server fn<br/>(cookie sent automatically)
    AuthRoute->>BetterAuth: auth.api.getSession({ headers })
    BetterAuth->>DB: SELECT session JOIN user<br/>WHERE token = cookie
    DB-->>BetterAuth: session + user (or none)
    alt No valid session
        BetterAuth-->>AuthRoute: null
        AuthRoute-->>Browser: null
        Browser-->>User: redirect({ to: '/sign-in' })
    else Valid session
        BetterAuth-->>AuthRoute: { session, user }
        AuthRoute-->>Browser: { session, user }
        Browser->>Browser: context.user = session.user
        Browser-->>User: Render _authed layout + nested route
    end
    Note right of Browser: Re-runs on every navigation into an<br/>_authed route (ADR 0004: SSR once,<br/>then client-side nav after that)
    end

    rect rgb(255, 246, 230)
    Note over Browser,DB: A mutating server fn checks the session again, independently
    Browser->>AuthRoute: logFilm(...) / editFilm(...) / etc.
    AuthRoute->>BetterAuth: ensureSession()<br/>→ auth.api.getSession({ headers })
    BetterAuth->>DB: SELECT session JOIN user WHERE token
    DB-->>BetterAuth: session (or none)
    alt No session
        BetterAuth-->>AuthRoute: throws "Unauthorized"
    else Session present
        BetterAuth-->>AuthRoute: session
        Note right of AuthRoute: Proceeds with the mutation — doesn't<br/>rely solely on the layout's beforeLoad
    end
    end

    rect rgb(245, 245, 245)
    Note over Browser,DB: Public routes: no session check at all
    User->>Browser: Visits /journal/u/:username<br/>or /lists/:shareToken
    Browser->>Browser: Route match: /_public/*<br/>(no beforeLoad — ADR 0015)
    Note right of Browser: Renders identically for the<br/>owner and any anonymous visitor
    end
```

## Notes

- **Sign in and register bypass server functions entirely** (ADR 0007): the form calls
  `authClient.signIn.email` / `authClient.signUp.email` directly, which hits the
  `/api/auth/$` catch-all route that just forwards every request to `auth.handler`.
  This is the path Better Auth's `tanstackStartCookies` plugin is built for — it gives
  the submit handler a synchronous `{ data, error }` result without an extra hop
  through a TanStack Start server function.
- **The session cookie is the only thing carried forward.** Nothing about "is this
  user signed in" is cached in the client — every subsequent check re-reads the cookie
  and re-queries `session`/`user` from Postgres.
- **Two independent checkpoints, not one.** `_authed`'s `beforeLoad` guards page
  _navigation_ (redirects to `/sign-in`); each mutating server function calls
  `ensureSession()` itself and throws if there's no session. A request that somehow
  reached a server function without passing through the layout (e.g. a direct call)
  still can't mutate data unauthenticated.
- **`_public` routes are the deliberate exception**: no `beforeLoad`, no session
  lookup at all — List share links and the Public Journal render identically for the
  owner and any anonymous visitor by design (ADR 0015). Owner-aware affordances on
  these pages are explicitly out of scope for now.
- **SSR-once-then-CSR** (ADR 0004) means the `beforeLoad` session check happens
  server-side on first load, then again as a client-to-server server-function call on
  every later in-app navigation — it's a real network round trip each time, not a
  one-off gate.
