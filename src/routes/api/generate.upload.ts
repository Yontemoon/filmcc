import { createFileRoute } from '@tanstack/react-router'
import { dailyGames, entities } from '#/lib/db/schema'
import type { TController } from '#/types/client.types'
import db from '#/lib/db'
import { count } from 'drizzle-orm'
import { getPar } from '#/lib/server'

type BodyType = {
  start: TController
  end: TController
}

export const Route = createFileRoute(`/api/generate/upload`)({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as BodyType

          const date = new Date()
          date.setDate(date.getDate() - 4)
          const parData = await getPar(body.start.id, body.end.id)

          await db.transaction(async (tx) => {
            const totalGames = await tx
              .select({ count: count() })
              .from(dailyGames)
              .then((d) => d[0].count)

            const formateDate = date.toISOString().split('T')[0]
            console.log(formateDate)
            await tx.insert(entities).values({
              entityType: body.start.type,
              entityId: body.start.id,
              label: body.start.label,
              imgPath: body.start.img_path,
            })
            console.log(`Added ${body.start.label} as entity`)

            await tx.insert(entities).values({
              entityType: body.end.type,
              entityId: body.end.id,
              label: body.end.label,
              imgPath: body.end.img_path,
            })
            console.log(`Added ${body.end.label} as entity`)

            await tx.insert(dailyGames).values({
              id: totalGames + 1,
              displayDate: formateDate,
              start: body.start,
              end: body.end,
              startId: body.start.id,
              endId: body.end.id,
              parMoves: parData?.par,
              solutionPath: parData?.path,
            })

            console.log(
              `Added ${body.start.label} (Movie) as the start and ${body.end.label} (Person) as the end.`,
            )
          })
          return Response.json({ success: true, message: null })
        } catch (error) {
          console.error(error)
          return Response.json({ success: false, message: error })
        }
      },
    },
  },
})
