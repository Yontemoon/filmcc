import 'dotenv/config'
import db from '../src/lib/db'
import { dailyGames } from '#/lib/db/schema'

const DEMO = {
  dailyGameId: 3,
  start: {
    id: 1368337,
    type: 'MOVIE',
    label: 'The Odyssey',
    creditInfo: null,
    img_path: '/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg',
  },
  end: {
    id: 28846,
    type: 'PERSON',
    label: 'Alexander Skarsgard',
    creditInfo: null,
    img_path: '/6VNNddrSrIVgdzhXr4Zg89gmOzY.jpg',
  },
}

const main = async () => {
  try {
    const date = new Date()
    date.setFullYear(2026)
    date.setMonth(6)
    date.setDate(31)

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
