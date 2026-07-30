import { defineRelations } from 'drizzle-orm'
import * as schema from './schema'

export const relations = defineRelations(schema, (r) => ({
  user: {
    sessions: r.many.session(),
    accounts: r.many.account(),
    gameAttempts: r.many.gameAttempts(),
    gameMoves: r.many.gameMoves(),
  },
  session: {
    user: r.one.user({
      from: r.session.userId,
      to: r.user.id,
    }),
  },
  account: {
    user: r.one.user({
      from: r.account.userId,
      to: r.user.id,
    }),
  },
  dailyGames: {
    gameAttempts: r.many.gameAttempts(),
  },
  gameAttempts: {
    user: r.one.user({
      from: r.gameAttempts.userId,
      to: r.user.id,
    }),
    dailyGame: r.one.dailyGames({
      from: r.gameAttempts.gameId,
      to: r.dailyGames.id,
    }),
    gameMovesLog: r.many.gameMoves(),
  },
  gameMoves: {
    attempt: r.one.gameAttempts({
      from: r.gameMoves.attemptId,
      to: r.gameAttempts.id,
    }),
    user: r.one.user({ from: r.gameMoves.userId, to: r.user.id }),
    entity: r.one.entities({
      from: [r.gameMoves.entityType, r.gameMoves.entityId],
      to: [r.entities.entityType, r.entities.entityId],
    }),
  },
  entities: {
    gameMoves: r.many.gameMoves(),
  },
}))
