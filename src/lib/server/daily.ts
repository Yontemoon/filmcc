import { createServerFn } from '@tanstack/react-start'
import db from '#/lib/db'
import { guardAuthMiddlware } from './middleware/auth'
import { createRandomDaily } from '../server'
import { count, eq } from 'drizzle-orm'
import {
  dailyGames,
  gameAttempts,
  gameMoves as gameMovesLog,
} from '../db/schema'

const postCreateRandomDaily = createServerFn({ method: 'POST' }).handler(
  async () => {
    try {
      return createRandomDaily()
    } catch (error) {
      console.error(error)
      return null
    }
  },
)

const getLatestDailyGame = createServerFn({ method: 'GET' }).handler(
  async () => {
    const today = new Date().toDateString()

    const todayGameData = await db.query.dailyGames.findFirst({
      where: {
        displayDate: today,
      },
    })

    return todayGameData
  },
)

// Display all daily games with the current user's attempt (if any)
const getDailyGames = createServerFn({ method: 'GET' })
  .middleware([guardAuthMiddlware])
  .handler(async ({ context }) => {
    try {
      const { userDetails } = context
      const results = await db
        .select({
          game: dailyGames,
          attempt: gameAttempts,
          movesCount: count(gameMovesLog.attemptId),
        })
        .from(dailyGames)
        .leftJoin(gameAttempts, eq(gameAttempts.gameId, dailyGames.id))
        .leftJoin(gameMovesLog, eq(gameMovesLog.attemptId, gameAttempts.id))
        .where(eq(gameAttempts.userId, userDetails.id))
        .groupBy(dailyGames.id, gameAttempts.id)
        .orderBy(dailyGames.displayDate)

      return results
    } catch (error) {
      console.error('[getDailyGames] error', error)
      return null
    }
  })

type ReturnGetDailyGames = NonNullable<
  Awaited<ReturnType<typeof getDailyGames>>
>
type TArchivedGame = ReturnGetDailyGames[number]

const getDailyGameId = createServerFn({ method: 'GET' })
  .middleware([guardAuthMiddlware])
  .validator((data: { dailyGameId: number }) => data)
  .handler(async ({ data }) => {
    try {
      const { dailyGameId } = data
      const game = await db.query.dailyGames.findFirst({
        where: {
          id: dailyGameId,
        },
      })

      return game
    } catch (error) {
      console.error('[getDailyGameId] error', error)
      return null
    }
  })

export {
  getLatestDailyGame,
  getDailyGames,
  getDailyGameId,
  postCreateRandomDaily,
}
export type { TArchivedGame }
