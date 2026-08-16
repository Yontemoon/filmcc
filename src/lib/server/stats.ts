import { createServerFn } from '@tanstack/react-start'
import db from '../db'
import { guardAuthMiddlware } from './middleware/auth'
import { count, eq, not, and } from 'drizzle-orm'
import { gameAttempts } from '../db/schema'

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
        const gamesPlayed = await tx
          .select({ count: count() })
          .from(gameAttempts)
          .where(
            and(
              not(eq(gameAttempts.status, 'started')),
              eq(gameAttempts.userId, userDetails.id),
            ),
          )

          .then((val) => val[0])

        return { gamesPlayed, completed }
      })
      return data
    } catch (error) {
      console.error(error)
      return null
    }
  })

export { getHeaderStats }
