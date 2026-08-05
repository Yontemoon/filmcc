import { createFileRoute } from '@tanstack/react-router'
import { createRandomDaily } from '#/lib/server'

export const Route = createFileRoute(`/api/game`)({
  server: {
    handlers: {
      POST: async () => {
        const dailyData = await createRandomDaily()
        return Response.json(dailyData)
      },
    },
  },
})
