import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

// Immutable TMDB catalog snapshot, keyed by its TMDB id (see CONTEXT.md > Movie).
// Only summary fields are cached here; detail fields are fetched live from TMDB (ADR 0005).
export const movie = pgTable('movie', {
  tmdbId: text('tmdb_id').primaryKey(),
  title: text('title').notNull(),
  posterImg: text('poster_img'),
  releaseDate: text('release_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
