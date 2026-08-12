import { relations } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

import { user } from './auth'
import { movie } from './movie'

// A user's mutable record of having watched a Movie (see CONTEXT.md > JournalEntry).
// Split from Movie's immutable catalog data per ADR 0001. Multiple entries per
// Movie per user are allowed, to support rewatches.
export const journalEntry = pgTable(
  'journal_entry',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    movieId: text('movie_id')
      .notNull()
      .references(() => movie.tmdbId, { onDelete: 'cascade' }),
    dateWatched: timestamp('date_watched').notNull(),
    rating: integer('rating'),
    review: text('review'),
    like: boolean('like').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('journal_entry_userId_idx').on(table.userId),
    index('journal_entry_movieId_idx').on(table.movieId),
  ],
)

export const journalEntryRelations = relations(journalEntry, ({ one }) => ({
  user: one(user, {
    fields: [journalEntry.userId],
    references: [user.id],
  }),
  movie: one(movie, {
    fields: [journalEntry.movieId],
    references: [movie.tmdbId],
  }),
}))
