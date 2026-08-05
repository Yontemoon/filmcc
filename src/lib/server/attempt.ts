import { createServerFn } from '@tanstack/react-start'
import { guardAuthMiddlware } from './middleware/auth'
import db from '../db'
import { setResponseStatus } from '@tanstack/react-start/server'
import { entities, gameAttempts, gameMoves } from '../db/schema'
import type { TType } from '#/types/client.types'
import type { TGameStatuses } from '#/types/server.types'
import { eq, sql } from 'drizzle-orm'

// get info for specific game
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
              path: [dailyGame.start],
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
    }) => data,
  )
  .handler(async ({ data, context }) => {
    try {
      console.log('[passing handler POST funcs.]')
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
      } = data

      const currentMovesDetails = await db.query.gameMoves.findMany({
        where: {
          attemptId: attemptId,
        },
      })

      const attemptLength = currentMovesDetails.length

      await db
        .insert(entities)
        .values({
          entityId,
          entityType,
          label,
          imgPath,
        })
        .onConflictDoNothing()

      await db.insert(gameMoves).values({
        attemptId,
        entityId,
        entityType,
        userId,
        roleName,
        roleType,
        moveIndex: attemptLength,
      })
    } catch (error) {
      console.error(error)
    }
  })

const updateUserStatusGameId = createServerFn({ method: 'POST' })
  .middleware([guardAuthMiddlware])
  .validator((data: { gameId: string; status: TGameStatuses }) => data)
  .handler(async ({ data }) => {
    const { status, gameId } = data
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
