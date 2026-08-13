---
status: accepted; partially supersedes ADR-0006
---

# Add a component-test layer with Vitest and React Testing Library

ADR-0006 declared no unit test suite, as a deliberate scope reduction for a throwaway evaluation project, with Playwright E2E as the only test layer. This revises that one clause: component tests using Vitest and React Testing Library are now in scope. The motivation isn't a change in the project's production ambitions — it's that the project's whole point is evaluating TanStack Start, and that evaluation is incomplete without real signal on its component-testing story. ADR-0006's other conclusions — no CI pipeline, local-only deployment — still stand.

Route components render through the actual app router (`RouterProvider` + `createMemoryHistory`, navigate, await settle), matching TanStack Start's own documented test pattern, rather than a stand-in router. Server functions called from components are mocked directly with `vi.mock`: `createServerFn` handlers compile to a network request only in the client bundle, and TanStack Start's own tests bypass that by importing and calling the handler directly, so MSW has nothing meaningful to intercept at that boundary. MSW is reserved for genuine external HTTP calls (TMDB) and only gets a handler once a test actually exercises one — it isn't scaffolded speculatively.

Coverage stays at the component/page level for now; hooks and utility functions are out of scope. Accessibility checks stay exclusively at the E2E layer (axe-core folded into Playwright specs, per ADR-0006) — not duplicated here.
