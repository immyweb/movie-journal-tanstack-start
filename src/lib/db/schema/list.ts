import { relations, sql } from 'drizzle-orm'
import {
  check,
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

import { user } from './auth'
import { movie } from './movie'
import {
  LIST_DESCRIPTION_MAX_LENGTH,
  LIST_NAME_MAX_LENGTH,
} from '../../validation/list'

// A user's named, single-owner List of Movie references, shared via a
// Share link built from shareToken (see CONTEXT.md > List, ADR 0013).
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
    // Backstops createListSchema's length caps at the DB layer (issue #20,
    // finding 4) — name is rendered unbounded as an <h1> on the public
    // share page, so nothing should be able to store a value past what
    // that page can lay out.
    check(
      'list_name_length',
      sql`char_length(${table.name}) <= ${sql.raw(String(LIST_NAME_MAX_LENGTH))}`,
    ),
    check(
      'list_description_length',
      sql`char_length(${table.description}) <= ${sql.raw(String(LIST_DESCRIPTION_MAX_LENGTH))}`,
    ),
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
