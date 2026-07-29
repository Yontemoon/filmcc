import { defineRelations } from 'drizzle-orm'
import * as schema from './schema'

export const relations = defineRelations(schema, (r) => ({
  user: {
    sessions: r.many.session(),
    accounts: r.many.account(),
    gameAttempts: r.many.gameAttempts(),
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
  gameAttempts: {
    user: r.one.user({
      from: r.gameAttempts.userId,
      to: r.user.id,
    }),
    dailyGame: r.one.dailyGames({
      from: r.gameAttempts.gameId,
      to: r.dailyGames.id,
    }),
  },
  dailyGames: {
    gameAttempts: r.many.gameAttempts(),
  },
}))
