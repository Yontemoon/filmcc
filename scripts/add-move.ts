import 'dotenv/config'
import db from '../src/lib/db'
import { entities, gameMoves } from '#/lib/db/schema'
import { DEMO } from '#/lib/constants'

const main = async () => {
  try {
    db.transaction(async (tx) => {
      const res = await tx
        .insert(entities)
        .values({
          entityId: DEMO.start.id,
          entityType: DEMO.start.type,
          label: DEMO.start.label,
          imgPath: DEMO.start.img_path,
        })
        .returning({
          entityId: entities.entityId,
          entityType: entities.entityType,
        })
        .then((e) => e[0])
      console.log('Added entity')

      await tx.insert(gameMoves).values({
        attemptId: '6ad2da54-e556-407e-a588-962d0abe3517',
        userId: '0ac485e3-a4ff-44e8-bab0-e8fac3f266e4',
        entityType: res.entityType,
        entityId: res.entityId,
        moveIndex: 0,
      })
      console.log('Added first game attempt')
    })

    return 'success'
  } catch (error) {
    console.error(error)
    return 'error'
  }
}

main().catch((error) => {
  console.error('Something went wrong.')
  console.error(error)
  process.exit(1)
})
