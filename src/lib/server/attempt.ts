import { createServerFn } from '@tanstack/react-start'
import { guardAuthMiddlware } from './middleware/auth'
import db from '../db'
import { setResponseStatus } from '@tanstack/react-start/server'
import { entities, gameAttempts, gameMoves } from '../db/schema'
import type { TlinkType, TType } from '#/types/client.types'
import type { TGameStatuses } from '#/types/server.types'
import { eq, sql } from 'drizzle-orm'

// get info for specific game
// Gets called when user goes to the game ID Page
const getUserGameId = createServerFn({ method: 'GET' })
  .middleware([guardAuthMiddlware])
  .validator((data: { gameId: number }) => data)
  .handler(async ({ data, context }) => {
    try {
      const { gameId } = data
      const { userDetails } = context

      const currentGameAttempt = await db.query.gameAttempts.findFirst({
        where: {
          gameId: gameId,
          userId: userDetails.id,
        },
        with: {
          gameMovesLog: {
            with: {
              entity: true,
            },
            orderBy: {
              moveIndex: 'asc',
            },
          },
        },
      })

      if (!currentGameAttempt) {
        const dailyGame = await db.query.dailyGames
          .findFirst({
            where: {
              id: gameId,
            },
            with: {},
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

        const newGame = await db.transaction(async (tx) => {
          const [result] = await tx
            .insert(gameAttempts)
            .values({
              gameId: gameId,
              userId: userDetails.id,
            })
            .returning({
              id: gameAttempts.id,
            })

          await tx.insert(gameMoves).values({
            attemptId: result.id,
            entityId: dailyGame.start.id,
            entityType: dailyGame.start.type,
            userId: userDetails.id,
            moveIndex: 0,
          })

          const newGameAttempt = tx.query.gameAttempts.findFirst({
            where: {
              gameId: gameId,
            },
            with: {
              gameMovesLog: {
                with: {
                  entity: true,
                },
                orderBy: {
                  moveIndex: 'asc',
                },
              },
            },
          })

          return newGameAttempt
        })

        return newGame ?? null
      }

      return currentGameAttempt
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

type ReturnGetUserGameId = NonNullable<
  Awaited<ReturnType<typeof getUserGameId>>
>

const addUserGameId = createServerFn({ method: 'POST' })
  .middleware([guardAuthMiddlware])
  .validator(
    (data: {
      entityId: number
      entityType: TType
      label: string
      imgPath: string | null
      roleType: string
      roleName: string | null
      attemptId: string
      linkType: TlinkType
    }) => data,
  )
  .handler(async ({ data, context }) => {
    try {
      const { userDetails } = context

      const userId = userDetails.id
      const {
        entityId,
        entityType,
        imgPath,
        label,
        roleName,
        roleType,
        attemptId,
        linkType,
      } = data

      const res = await db.transaction(async (tx) => {
        const currentMovesDetails = await tx.query.gameMoves.findMany({
          where: {
            attemptId: attemptId,
            userId: userId,
          },
          with: {
            attempt: {
              with: {
                dailyGame: true,
              },
            },
          },
        })

        const attemptLength = currentMovesDetails.length
        const gameEndId = currentMovesDetails[0].attempt?.dailyGame?.end.id
        const gameEndType = currentMovesDetails[0].attempt?.dailyGame?.end.type
        const isGoal = entityId === gameEndId && entityType === gameEndType

        await tx
          .insert(entities)
          .values({
            entityId,
            entityType,
            label,
            imgPath,
          })
          .onConflictDoNothing()

        await tx.insert(gameMoves).values({
          attemptId,
          entityId,
          entityType,
          userId,
          roleName,
          roleType,
          moveIndex: attemptLength,
          linkType,
          isGoal,
        })

        if (isGoal) {
          await tx
            .update(gameAttempts)
            .set({
              status: 'completed',
            })
            .where(eq(gameAttempts.id, attemptId))
        }
        return 'success'
      })

      return res
    } catch (error) {
      console.error(error)
      return 'error'
    }
  })

const updateUserStatusGameId = createServerFn({ method: 'POST' })
  .middleware([guardAuthMiddlware])
  .validator(
    (data: { gameId: string; status: TGameStatuses; message?: string }) => data,
  )
  .handler(async ({ data }) => {
    const { status, gameId, message } = data
    switch (status) {
      case 'started':
        await db
          .update(gameAttempts)
          .set({
            status: status,
            startedAt: sql`NOW()`,
          })
          .where(eq(gameAttempts.id, gameId))
        break
      case 'completed':
        await db
          .update(gameAttempts)
          .set({
            status: status,
            completedAt: sql`NOW()`,
          })
          .where(eq(gameAttempts.id, gameId))
        break

      case 'failed':
        await db
          .update(gameAttempts)
          .set({
            status: status,
            completedAt: sql`NOW()`,
            message: message,
          })
          .where(eq(gameAttempts.id, gameId))

        break
      case 'gave_up':
        await db
          .update(gameAttempts)
          .set({
            status: status,
            completedAt: sql`NOW()`,
          })
          .where(eq(gameAttempts.id, gameId))
        break
      default:
        await db
          .update(gameAttempts)
          .set({
            status: status,
          })
          .where(eq(gameAttempts.id, gameId))
        break
    }
  })

export { getUserGameId, getUserGames, addUserGameId, updateUserStatusGameId }
export type { ReturnGetUserGameId }
