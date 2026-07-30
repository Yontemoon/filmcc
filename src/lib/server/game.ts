import { createServerFn } from '@tanstack/react-start'
import db from '#/lib/db'
import { guardAuthMiddlware } from './middleware/auth'
import { gameAttempts } from '../db/schema'
import { setResponseStatus } from '@tanstack/react-start/server'

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

const getDailyGames = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const games = await db.query.dailyGames.findMany()
    return games
  } catch (error) {
    console.error('[getDailyGames] error', error)
    return null
  }
})

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

const getUserGameId = createServerFn({ method: 'GET' })
  .middleware([guardAuthMiddlware])
  .validator((data: { gameId: number }) => data)
  .handler(async ({ data, context }) => {
    try {
      const { gameId } = data
      const { userDetails } = context

      const gameInfo = await db.query.gameAttempts.findFirst({
        where: {
          gameId: gameId,
          userId: userDetails.id,
        },
      })

      if (!gameInfo) {
        const dailyGame = await db.query.dailyGames
          .findFirst({
            where: {
              id: gameId,
            },
          })
          .then((val) => {
            if (!val) {
              console.error('[no daily game found]')
              setResponseStatus(404)
              throw new Error('No daily game found')
            }
            return val
          })
          .catch((err) => {
            console.error('[no daily game found]', err)
            setResponseStatus(404)
            throw new Error('No daily game found')
          })

        const [newGame] = await db
          .insert(gameAttempts)
          .values({
            gameId: gameId,
            userId: userDetails.id,
            path: [dailyGame.start],
          })
          .returning()

        return newGame
      }

      return gameInfo
    } catch (error) {
      console.error('[getUserGameId] caught error', error)
      return null
    }
  })

const getUserGames = createServerFn({ method: 'GET' })
  .middleware([guardAuthMiddlware])
  .handler(async ({ context }) => {
    const { userDetails } = context
    const games = await db.query.gameAttempts.findMany({
      where: {
        userId: userDetails.id,
      },
    })
    return games
  })

const updateUserStatusGameId = createServerFn({ method: 'POST' })
  .middleware([guardAuthMiddlware])
  .validator((data: { gameId: number }) => data)
  .handler(async () => {})

const addUserGameId = createServerFn({ method: 'POST' })
  .middleware([guardAuthMiddlware])
  .validator((data: { gameId: number }) => data)
  .handler(async () => {})

export {
  getLatestDailyGame,
  getDailyGames,
  getDailyGameId,
  getUserGameId,
  getUserGames,
  updateUserStatusGameId,
  addUserGameId,
}
