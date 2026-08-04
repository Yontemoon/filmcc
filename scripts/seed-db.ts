import 'dotenv/config'
import db from '../src/lib/db'
import { dailyGames, entities } from '#/lib/db/schema'

const DEMO = {
  dailyGameId: 3,
  start: {
    id: 1083381,
    type: 'MOVIE' as const,
    label: 'Backrooms',
    img_path: '/rhGx6E3qRNMgj3i5su2oukNHwIQ.jpg',
    creditInfo: null,
  },
  end: {
    id: 2638587,
    type: 'PERSON' as const,
    label: 'Inde Navarrette',
    img_path: '/8mYBaOximzwBgXOYRzbS6eUnoMX.jpg',
    creditInfo: null,
  },
}

const main = async () => {
  try {
    const date = new Date()
    date.setFullYear(2026)
    date.setMonth(6)
    date.setDate(31)

    await db.insert(entities).values({
      entityType: DEMO.start.type,
      entityId: DEMO.start.id,
      label: DEMO.start.label,
      imgPath: DEMO.start.img_path,
    })

    await db.insert(entities).values({
      entityType: DEMO.end.type,
      entityId: DEMO.end.id,
      label: DEMO.end.label,
      imgPath: DEMO.end.img_path,
    })

    await db.insert(dailyGames).values({
      id: DEMO.dailyGameId,
      displayDate: date.toDateString(),
      start: DEMO.start,
      end: DEMO.end,
      startId: DEMO.start.id,
      endId: DEMO.end.id,
    })
    return 'success'
  } catch (error) {
    console.error(error)
    return 'error'
  }
}

main()
  .then((res) => console.log(res))
  .catch((error) => console.error(error))
