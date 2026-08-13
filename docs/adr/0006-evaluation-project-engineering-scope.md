---
status: partially superseded by ADR-0011 (component test layer added; CI and deployment scope unchanged)
---

# Local-only deployment, no CI, minimal test coverage

This is a throwaway evaluation project comparing TanStack Start against Next.js, not a production app. Deployment is local-only (no hosting target); there is no CI pipeline — builds and tests run locally before drawing conclusions. Test coverage is limited to Playwright end-to-end tests on the critical CRUD journeys (sign up/in, add movie, edit entry, delete entry, view/filter journal), with axe-core assertions folded into those same tests to verify the WCAG AA requirement. No unit test suite. A reader expecting CI/CD or broader coverage should note this is a deliberate scope reduction for a time-boxed evaluation, not an oversight.

See ADR-0011: a component-test layer (Vitest + React Testing Library) was later added to support evaluating TanStack Start's testing story. The no-CI and local-only-deployment conclusions here are unchanged.
