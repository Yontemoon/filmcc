import { createServerFn } from '@tanstack/react-start'
import { guardAuthMiddlware } from './middleware/auth'
import { count, eq, not, and, sql } from 'drizzle-orm'
import { entities, gameAttempts, gameMoves } from '../db/schema'
import db from '../db'
import type { TType } from '#/types/client.types'

const getHeaderStats = createServerFn({ method: 'GET' })
  .middleware([guardAuthMiddlware])
  .handler(async ({ context }) => {
    try {
      const { userDetails } = context
      const data = await db.transaction(async (tx) => {
        const completed = await tx
          .select({ count: count() })
          .from(gameAttempts)
          .where(
            and(
              eq(gameAttempts.status, 'completed'),
              eq(gameAttempts.userId, userDetails.id),
            ),
          )
          .then((val) => val[0].count)
        const gamesPlayed = await tx
          .select({ count: count() })
          .from(gameAttempts)
          .where(
            and(
              not(eq(gameAttempts.status, 'started')),
              eq(gameAttempts.userId, userDetails.id),
            ),
          )

          .then((val) => val[0].count)

        const attemptMoveCounts = tx
          .select({
            attemptId: gameAttempts.id,
            moveCount: count(gameMoves.attemptId).as('move_count'),
          })
          .from(gameAttempts)
          .innerJoin(gameMoves, eq(gameMoves.attemptId, gameAttempts.id))
          .where(
            and(
              eq(gameAttempts.userId, userDetails.id),
              eq(gameAttempts.status, 'completed'),
            ),
          )
          .groupBy(gameAttempts.id)
          .as('attempt_move_counts')

        const movesPerWins = await tx
          .select({
            moveCount: attemptMoveCounts.moveCount,
            winsCount: count(),
          })
          .from(attemptMoveCounts)
          .groupBy(attemptMoveCounts.moveCount)

        const entityMoveCounts = await tx
          .select({
            entityType: gameMoves.entityType,
            entityId: gameMoves.entityId,
            label: entities.label,
            imgPath: entities.imgPath,
            visits: count(),
            // TODO --> Cleaner solution?
            hopVisits:
              sql<number>`count(*) filter (where ${gameMoves.isGoal} = false)`.mapWith(
                Number,
              ),
          })
          .from(gameAttempts)
          .innerJoin(gameMoves, eq(gameMoves.attemptId, gameAttempts.id))
          .innerJoin(
            entities,
            and(
              eq(entities.entityType, gameMoves.entityType),
              eq(entities.entityId, gameMoves.entityId),
            ),
          )
          .where(
            and(
              eq(gameAttempts.userId, userDetails.id),
              eq(gameMoves.isStart, false),
            ),
          )
          .groupBy(
            gameMoves.entityType,
            gameMoves.entityId,
            entities.label,
            entities.imgPath,
          )

        const uniqueLinks = entityMoveCounts.length
        const totalLinks = entityMoveCounts.reduce(
          (acc, row) => acc + row.visits,
          0,
        )

        const byHops = entityMoveCounts
          .filter((row) => row.hopVisits > 0)
          .sort((a, b) => b.hopVisits - a.hopVisits)

        const mostTraveledOf = (entityType: TType) => {
          const row = byHops.find(
            (candidate) => candidate.entityType === entityType,
          )
          return row
            ? {
                entityType: row.entityType,
                entityId: row.entityId,
                label: row.label,
                imgPath: row.imgPath,
                visits: row.hopVisits,
              }
            : null
        }

        const winPercentage = completed / gamesPlayed

        return {
          gamesPlayed,
          winPercentage,
          movesPerWins,
          mostTraveled: {
            movie: mostTraveledOf('MOVIE'),
            person: mostTraveledOf('PERSON'),
          },
          uniqueLinks,
          totalLinks,
        }
      })
      return data
    } catch (error) {
      console.error(error)
      return null
    }
  })

export { getHeaderStats }

type THeaderStats = NonNullable<Awaited<ReturnType<typeof getHeaderStats>>>

export type { THeaderStats }
