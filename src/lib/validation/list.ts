import { z } from 'zod'

// Length caps mirror the DB column constraints added in
// drizzle/0004_*.sql (issue #20, finding 4) — name is rendered unbounded
// as an <h1> on the public share page, so an unconstrained value could
// break that page's layout.
export const LIST_NAME_MAX_LENGTH = 100
export const LIST_DESCRIPTION_MAX_LENGTH = 500

// Mirrors the list DB schema's requiredness (see src/lib/db/schema/list.ts):
// name is required, description is optional.
export const createListSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(
      LIST_NAME_MAX_LENGTH,
      `Must be ${LIST_NAME_MAX_LENGTH} characters or fewer.`,
    ),
  description: z
    .string()
    .max(
      LIST_DESCRIPTION_MAX_LENGTH,
      `Must be ${LIST_DESCRIPTION_MAX_LENGTH} characters or fewer.`,
    )
    .nullable(),
})

export type CreateListInput = z.infer<typeof createListSchema>
