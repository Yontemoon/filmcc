import 'dotenv/config'
import db from '../src/lib/db'
import { dailyGames } from '#/lib/db/schema'
import { DEMO } from '#/lib/constants'
import { randomUUID } from 'node:crypto'

const main = async () => {
  try {
    await db.insert(dailyGames).values({
      id: randomUUID(),
      dailyNumber: 1,
      displayDate: new Date().toDateString(),
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
