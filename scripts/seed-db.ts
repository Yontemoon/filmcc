import 'dotenv/config'
import db from '../src/lib/db'
import { dailyGames, entities } from '#/lib/db/schema'
import { createRandomDaily, getPar } from '#/lib/server'
import type { TController } from '#/types/client.types'

const main = async () => {
  try {
    const date = new Date()

    for (let i = 0; i < 15; i++) {
      const currentData = await createRandomDaily()
      console.log(currentData)
      date.setDate(date.getDate() - 1)

      if (!currentData) {
        return
      }

      const parData = await getPar(currentData.start.id, currentData.end.id)
      console.log('par found.')
      if (!parData) {
        return
      }

      const currentId = i + 1

      await db.transaction(async (tx) => {
        const formateDate = date.toISOString().split('T')[0]
        const start = currentData.start
        const end = currentData.end

        const startCon: TController = {
          id: start.id,
          label: start.title,
          img_path: start.poster_path,
          type: 'MOVIE',
          genre: start.genres[0],
        }
        const endCon: TController = {
          id: end.id,
          label: end.name,
          img_path: end.profile_path,
          type: 'PERSON',
          genre: null,
        }
        await tx.insert(entities).values({
          entityType: 'MOVIE',
          entityId: currentData.start.id,
          label: currentData.start.title,
          imgPath: currentData.start.poster_path,
          genre: currentData.start.genres[0],
          metadata: currentData.start,
        })
        console.log(`Added ${currentData.start.title} as entity`)

        await tx.insert(entities).values({
          entityType: 'PERSON',
          entityId: currentData.end.id,
          label: currentData.end.name,
          imgPath: currentData.end.profile_path,
          genre: null,
          metadata: currentData.end,
        })
        console.log(`Added ${currentData.end.name} as entity`)

        await tx.insert(dailyGames).values({
          id: currentId,
          displayDate: formateDate,
          start: startCon,
          end: endCon,
          startId: currentData.start.id,
          endId: currentData.end.id,
          parMoves: parData.par,
          solutionPath: parData.path,
        })
      })
      console.log(
        `Added ${currentData.start.title} --> ${currentData.end.name} as daily game.`,
      )
    }

    return 'success'
  } catch (error) {
    console.error(error)
    return 'error'
  }
}

main()
  .then((res) => console.log(res))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
