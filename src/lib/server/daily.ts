import { createServerFn } from '@tanstack/react-start'
import db from '#/lib/db'
import { guardAuthMiddlware } from './middleware/auth'
import { createRandomDaily } from '../server'
import { gameDateString } from '#/jobs/date'

const postCreateRandomDaily = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      return createRandomDaily()
    } catch (error) {
      console.error(error)
    }
  },
)

const getLatestDailyGame = createServerFn({ method: 'GET' }).handler(
  async () => {
    // `display_date` is a postgres `date`, so it compares as 'YYYY-MM-DD'.
    // toDateString() ('Wed Aug 05 2026') could never match.
    const today = gameDateString()

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
      const games = await db.query.dailyGames.findMany({
        orderBy: {
          displayDate: 'desc',
        },
        with: {
          gameAttempts: {
            where: {
              userId: userDetails.id,
            },
          },
        },
      })
      return games
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
