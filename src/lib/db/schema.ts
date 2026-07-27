import { relations, sql } from 'drizzle-orm'
import {
  pgTable,
  text,
  timestamp,
  boolean,
  check,
  index,
  jsonb,
  pgEnum,
  uuid,
  date,
  integer,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import type { TController } from '#/types/client.types'

export const enumGameStatus = pgEnum('gameStatus', [
  'started',
  'completed',
  'failed',
  'gave_up',
])

export const dailyGames = pgTable('daily_games', {
  id: uuid('id').primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  displayDate: date('display_date').notNull().unique(),
  dailyNumber: integer('daily_number').notNull().unique(),
  start: jsonb('start').$type<TController>().notNull(),
  end: jsonb('end').$type<TController>().notNull(),
  startId: integer('start_id').notNull(),
  endId: integer('end_id').notNull(),
  parMoves: integer('par_moves'),
  solutionPath: jsonb('solution_path').$type<Array<TController>>(),
})

export const gameAttempts = pgTable(
  'game_attempts',
  {
    id: uuid('id')
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    gameId: uuid('game_id')
      .notNull()
      .references(() => dailyGames.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => user.id, { onDelete: 'cascade' }),
    guestId: text('guest_id'),
    attemptNumber: integer('attempt_number').notNull(),
    isRanked: boolean('is_ranked').notNull(), // true only on attempt 1
    status: enumGameStatus('status').default('started').notNull(),
    moves: integer('moves').default(0).notNull(),
    elapsedMs: integer('elapsed_ms'),
    path: jsonb('path')
      .$type<Array<TController>>()
      .default(sql`'[]'::jsonb`)
      .notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (t) => [
    // a player is either signed in or a guest, never both and never neither
    check(
      'attempt_player_identity',
      sql`(${t.userId} is null) <> (${t.guestId} is null)`,
    ),

    // exactly one ranked attempt per player per puzzle
    uniqueIndex('attempt_ranked_user_uq')
      .on(t.gameId, t.userId)
      .where(sql`${t.isRanked} and ${t.userId} is not null`),
    uniqueIndex('attempt_ranked_guest_uq')
      .on(t.gameId, t.guestId)
      .where(sql`${t.isRanked} and ${t.guestId} is not null`),

    // at most one in-progress attempt per player per puzzle
    uniqueIndex('attempt_active_user_uq')
      .on(t.gameId, t.userId)
      .where(sql`${t.status} = 'started' and ${t.userId} is not null`),
    uniqueIndex('attempt_active_guest_uq')
      .on(t.gameId, t.guestId)
      .where(sql`${t.status} = 'started' and ${t.guestId} is not null`),

    index('attempt_game_ranked_idx')
      .on(t.gameId)
      .where(sql`${t.isRanked}`),
    index('attempt_user_created_idx').on(t.userId, t.createdAt),
  ],
)

export const user = pgTable('user', {
  id: uuid('id')
    .default(sql`pg_catalog.gen_random_uuid()`)
    .primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  username: text('username').unique(),
  displayUsername: text('display_username'),
})

export const session = pgTable(
  'session',
  {
    id: uuid('id')
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: uuid('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => [index('session_userId_idx').on(table.userId)],
)

export const account = pgTable(
  'account',
  {
    id: uuid('id')
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: uuid('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index('account_userId_idx').on(table.userId)],
)

export const verification = pgTable(
  'verification',
  {
    id: uuid('id')
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)],
)

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

export const gamesPlayedRelations = relations(gameAttempts, ({ one }) => ({
  user: one(user, {
    fields: [gameAttempts.userId],
    references: [user.id],
  }),
  game: one(dailyGames, {
    fields: [gameAttempts.gameId],
    references: [dailyGames.id],
  }),
}))
