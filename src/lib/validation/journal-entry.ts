import { z } from 'zod'

// Mirrors the journal_entry DB schema's requiredness (see
// src/lib/db/schema/journal-entry.ts): dateWatched and like are required,
// rating and review are optional.
export const logFilmSchema = z.object({
  tmdbId: z.string().min(1),
  dateWatched: z.iso.date('Pick a date'),
  rating: z.number().int().min(1).max(5).nullable(),
  review: z.string().nullable(),
  like: z.boolean(),
})

export type LogFilmInput = z.infer<typeof logFilmSchema>

// The form itself doesn't collect tmdbId — that comes from the selected
// TMDB search result, not a text field.
export const logFilmFormSchema = logFilmSchema.omit({ tmdbId: true })

export type LogFilmFormInput = z.infer<typeof logFilmFormSchema>
