import { sql } from 'drizzle-orm'
import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  jsonb,
  pgEnum,
  uuid,
  date,
  integer,
  uniqueIndex,
  foreignKey,
  primaryKey,
  check,
  real,
} from 'drizzle-orm/pg-core'
import type { TController } from '#/types/client.types'

export const enumGameStatus = pgEnum('game_status', [
  'started',
  'in_progress',
  'completed',
  'failed',
  'gave_up',
])

export const enumEntityType = pgEnum('entity_type', ['MOVIE', 'PERSON'])

export const dailyGames = pgTable('daily_games', {
  id: integer('id').unique().primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  displayDate: date('display_date').notNull().unique(),
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
    gameId: integer('game_id')
      .notNull()
      .references(() => dailyGames.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => user.id, { onDelete: 'cascade' }),
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

    startedAt: timestamp('started_at', { withTimezone: true }),
  },
  (t) => [
    uniqueIndex('one_attempt_per_user_game').on(t.gameId, t.userId),
    index('attempt_user_created_idx').on(t.userId, t.createdAt),
  ],
)

export const entities = pgTable(
  'entities',
  {
    entityType: enumEntityType('entity_type').notNull(),
    entityId: integer('entity_id').notNull(),
    label: text('label').notNull(),
    imgPath: text('img_path'),
    popularity: real('popularity'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),

    metadata: jsonb('metadata'),
  },
  (t) => [primaryKey({ columns: [t.entityType, t.entityId] })],
)

export const gameMoves = pgTable(
  'game_moves',
  {
    attemptId: uuid('attempt_id')
      .notNull()
      .references(() => gameAttempts.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    moveIndex: integer('move_index').notNull(),
    entityType: enumEntityType('entity_type').notNull(),
    entityId: integer('entity_id').notNull(),
    roleName: text('role_name'), // Ex. 'Batman' if 'Acting' roleType
    roleType: text('role_type'), // 'Acting' | crew job
    isGoal: boolean('is_goal').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.attemptId, t.moveIndex] }),
    foreignKey({
      columns: [t.entityType, t.entityId],
      foreignColumns: [entities.entityType, entities.entityId],
    }).onDelete('restrict'),
    index('game_moves_user_entity_idx')
      .on(t.userId, t.entityType, t.entityId)
      .where(sql`move_index > 0`),
    check('game_moves_index_nonneg', sql`${t.moveIndex} >= 0`),
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
  isAnonymous: boolean('is_anonymous').default(false),
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
