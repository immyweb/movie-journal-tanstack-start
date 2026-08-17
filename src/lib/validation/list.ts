import { z } from 'zod'

// Mirrors the list DB schema's requiredness (see src/lib/db/schema/list.ts):
// name is required, description is optional.
export const createListSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().nullable(),
})

export type CreateListInput = z.infer<typeof createListSchema>
