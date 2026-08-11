import { createServerFn } from '@tanstack/react-start'
import db from '../db'
import { guardAuthMiddlware } from './middleware/auth'

const getMoves = createServerFn({ method: 'POST' })
  .middleware([guardAuthMiddlware])
  .handler(async ({ context }) => {
    try {
      const { userDetails } = context
      const data = await db.query.gameMoves.findMany({
        where: {
          userId: userDetails.id,
        },
        with: {
          entity: true,
        },
      })
      console.log(data)
      return data
    } catch (error) {
      console.error(error)
      return null
    }
  })

export { getMoves }
