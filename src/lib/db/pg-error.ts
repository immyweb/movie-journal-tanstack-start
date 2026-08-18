import { DrizzleQueryError } from 'drizzle-orm'

// node-postgres wraps a query failure in a raw error carrying postgres'
// own `code`/`constraint` fields (see
// https://www.postgresql.org/docs/current/errcodes-appendix.html);
// drizzle-orm re-wraps that as a DrizzleQueryError with the original error
// as `cause`. Unwraps back to that raw shape so callers rewording a
// specific postgres error don't each repeat the same instanceof-and-cast
// dance (issue #20, code-review follow-up on findings 3/4).
export function getPgErrorCause(
  error: unknown,
): { code?: string; constraint?: string } | undefined {
  if (!(error instanceof DrizzleQueryError)) return undefined
  return error.cause as { code?: string; constraint?: string } | undefined
}
