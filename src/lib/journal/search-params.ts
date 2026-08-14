import { z } from 'zod'

// Fixed, labeled presets rather than a generic field+direction control (see
// issue #1's Implementation Decisions) — only the dimensions built so far
// (watched date, liked status, rating, decade) are listed here.
export const journalSortValues = [
  'most-recently-watched',
  'earliest-watched',
  'liked-first',
  'highest-rated',
  'oldest-decade',
  'newest-decade',
] as const

export type JournalSort = (typeof journalSortValues)[number]

export const defaultJournalSort: JournalSort = 'most-recently-watched'

// Shared between the route's validateSearch and getJournalEntries's
// .validator() so the URL's shape and the server function's input shape
// can't drift apart. `liked` is a real boolean — TanStack Router's default
// JSON-first search serialization round-trips `?liked=true` as an actual
// boolean, not the string "true". Both fields fall back rather than throw —
// a stale bookmark or hand-edited URL must degrade to the unfiltered
// default view, not crash the page (no route in this app defines an
// errorComponent for validateSearch to throw into).
export const journalSearchSchema = z.object({
  liked: z.boolean().optional().catch(undefined),
  minRating: z.number().int().min(1).max(5).optional().catch(undefined),
  genre: z.array(z.string()).min(1).optional().catch(undefined),
  decade: z.array(z.number().int()).min(1).optional().catch(undefined),
  sort: z
    .enum(journalSortValues)
    .default(defaultJournalSort)
    .catch(defaultJournalSort),
})

export type JournalSearch = z.infer<typeof journalSearchSchema>
