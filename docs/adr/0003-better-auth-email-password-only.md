# Use Better Auth with email/password only

Considered a hosted provider (e.g. Clerk) and adding OAuth alongside email/password. Chose Better Auth for direct control over the auth flow as part of evaluating TanStack Start's server-function patterns, and restricted to email/password to avoid OAuth provider setup overhead that isn't central to the evaluation. Real multi-user accounts are still required — see SYSTEM-DESIGN.md's `user` entity and gated pages — so auth isn't stubbed out.
