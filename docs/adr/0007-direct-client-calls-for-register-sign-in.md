# Direct Better Auth client calls for Register and Sign in

Considered wrapping `signUpEmail`/`signInEmail` in TanStack Start server functions, mirroring the existing `getSession`/`ensureSession` pattern in `src/lib/auth/functions.ts`. Chose direct `authClient.signUp.email`/`signIn.email` calls from the Register and Sign-in forms instead — this is the path the `tanstackStartCookies` plugin (see ADR 0003's `auth.ts`) is designed for, and it gives the form's submit handler a synchronous `{ data, error }` result without an extra server round-trip.
