import { relations } from 'drizzle-orm'
import {
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

import { user } from './auth'
import { movie } from './movie'

// A user's named, single-owner collection of Movie references, shared via a
// public link built from shareToken (see CONTEXT.md > List, ADR 0013).
// Distinct from JournalEntry: carries no per-user watch data.
export const list = pgTable(
  'list',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    shareToken: text('share_token')
      .notNull()
      .unique()
      .$defaultFn(() => crypto.randomUUID()),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('list_userId_idx').on(table.userId),
    index('list_shareToken_idx').on(table.shareToken),
  ],
)

export const listRelations = relations(list, ({ one, many }) => ({
  user: one(user, {
    fields: [list.userId],
    references: [user.id],
  }),
  listItems: many(listItem),
}))

// Joins List to Movie. No surrogate id: the composite primary key both
// identifies the row and enforces that a Movie can't appear twice on the
// same List (see CONTEXT.md > ListItem, ADR 0013).
export const listItem = pgTable(
  'list_item',
  {
    listId: text('list_id')
      .notNull()
      .references(() => list.id, { onDelete: 'cascade' }),
    movieId: text('movie_id')
      .notNull()
      .references(() => movie.tmdbId, { onDelete: 'cascade' }),
    addedAt: timestamp('added_at').defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.listId, table.movieId] })],
)

export const listItemRelations = relations(listItem, ({ one }) => ({
  list: one(list, {
    fields: [listItem.listId],
    references: [list.id],
  }),
  movie: one(movie, {
    fields: [listItem.movieId],
    references: [movie.tmdbId],
  }),
}))
