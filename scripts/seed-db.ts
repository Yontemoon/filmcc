import 'dotenv/config'
import db from '../src/lib/db'
import { dailyGames, entities } from '#/lib/db/schema'

const SEED_DATA = [
  {
    dailyGameId: 1,
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
  },
  {
    dailyGameId: 2,
    start: {
      id: 550,
      type: 'MOVIE' as const,
      label: 'Fight Club',
      img_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
      creditInfo: null,
    },
    end: {
      id: 6384,
      type: 'PERSON' as const,
      label: 'Keanu Reeves',
      img_path: '/4D0PpNI0kmP58hgrwGC3wCjxhnm.jpg',
      creditInfo: null,
    },
  },
  {
    dailyGameId: 3,
    start: {
      id: 155,
      type: 'MOVIE' as const,
      label: 'The Dark Knight',
      img_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
      creditInfo: null,
    },
    end: {
      id: 3223,
      type: 'PERSON' as const,
      label: 'Robert Downey Jr.',
      img_path: '/5qHNjhtjMD4YWH3UP0rm4tKwxCL.jpg',
      creditInfo: null,
    },
  },
  {
    dailyGameId: 4,
    start: {
      id: 27205,
      type: 'MOVIE' as const,
      label: 'Inception',
      img_path: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
      creditInfo: null,
    },
    end: {
      id: 1245,
      type: 'PERSON' as const,
      label: 'Scarlett Johansson',
      img_path: '/6NsMbJXRlDZuDzatN2akFdGuTvx.jpg',
      creditInfo: null,
    },
  },
  {
    dailyGameId: 5,
    start: {
      id: 24428,
      type: 'MOVIE' as const,
      label: 'The Avengers',
      img_path: '/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg',
      creditInfo: null,
    },
    end: {
      id: 500,
      type: 'PERSON' as const,
      label: 'Tom Cruise',
      img_path: '/maf8PhSvDCdEwjEMbYfGpojR5RP.jpg',
      creditInfo: null,
    },
  },
  {
    dailyGameId: 6,
    start: {
      id: 969681,
      type: 'MOVIE' as const,
      label: 'Spider-Man: Brand New Day',
      img_path: '/iPOn6DinuVyLY17YM9mKuPofV08.jpg',
      creditInfo: null,
    },
    end: {
      id: 287,
      type: 'PERSON' as const,
      label: 'Brad Pitt',
      img_path: '/kU3B75TyRiCgE270EyZnHjfivoq.jpg',
      creditInfo: null,
    },
  },
  {
    dailyGameId: 7,
    start: {
      id: 76341,
      type: 'MOVIE' as const,
      label: 'Mad Max: Fury Road',
      img_path: '/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg',
      creditInfo: null,
    },
    end: {
      id: 819,
      type: 'PERSON' as const,
      label: 'Edward Norton',
      img_path: '/5XBzD5WuTyVQZeS4VI25z2moMeY.jpg',
      creditInfo: null,
    },
  },
  {
    dailyGameId: 8,
    start: {
      id: 496243,
      type: 'MOVIE' as const,
      label: 'Parasite',
      img_path: '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
      creditInfo: null,
    },
    end: {
      id: 1892,
      type: 'PERSON' as const,
      label: 'Matt Damon',
      img_path: '/aCvBXTAR9B1qRjIRzMBYhhbm1fR.jpg',
      creditInfo: null,
    },
  },
  {
    dailyGameId: 9,
    start: {
      id: 603,
      type: 'MOVIE' as const,
      label: 'The Matrix',
      img_path: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
      creditInfo: null,
    },
    end: {
      id: 117642,
      type: 'PERSON' as const,
      label: 'Jason Momoa',
      img_path: '/3troAR6QbSb6nUFMDu61YCCWLKa.jpg',
      creditInfo: null,
    },
  },
  {
    dailyGameId: 10,
    start: {
      id: 118340,
      type: 'MOVIE' as const,
      label: 'Guardians of the Galaxy',
      img_path: '/r7vmZjiyZw9rpJMQJdXpjgiCOk9.jpg',
      creditInfo: null,
    },
    end: {
      id: 16483,
      type: 'PERSON' as const,
      label: 'Zoe Saldana',
      img_path: '/iOVbUH20il632nj2v3AiIrfrkGW.jpg',
      creditInfo: null,
    },
  },
  {
    dailyGameId: 11,
    start: {
      id: 157336,
      type: 'MOVIE' as const,
      label: 'Interstellar',
      img_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
      creditInfo: null,
    },
    end: {
      id: 10912,
      type: 'PERSON' as const,
      label: 'Eva Green',
      img_path: '/8MqXy7Jd6HsRSBFK05J0KrR2x5Z.jpg',
      creditInfo: null,
    },
  },
  {
    dailyGameId: 12,
    start: {
      id: 335984,
      type: 'MOVIE' as const,
      label: 'Blade Runner 2049',
      img_path: '/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
      creditInfo: null,
    },
    end: {
      id: 64,
      type: 'PERSON' as const,
      label: 'Gary Oldman',
      img_path: '/yhaSM5habNNI1Tf4ALRwRk3VvSZ.jpg',
      creditInfo: null,
    },
  },
  {
    dailyGameId: 13,
    start: {
      id: 68718,
      type: 'MOVIE' as const,
      label: 'Django Unchained',
      img_path: '/7oWY8VDWW7thTzWh3OKYRkWUlD5.jpg',
      creditInfo: null,
    },
    end: {
      id: 59315,
      type: 'PERSON' as const,
      label: 'Olivia Wilde',
      img_path: '/eODi1QKamyVa41eSK2SjU20VAZS.jpg',
      creditInfo: null,
    },
  },
  {
    dailyGameId: 14,
    start: {
      id: 1234821,
      type: 'MOVIE' as const,
      label: 'Jurassic World Rebirth',
      img_path: '/1RICxzeoNCAO5NpcRMIgg1XT6fm.jpg',
      creditInfo: null,
    },
    end: {
      id: 17286,
      type: 'PERSON' as const,
      label: 'Lena Headey',
      img_path: '/cDyZLf8ddz0EgoUjpv4jjzy7qxA.jpg',
      creditInfo: null,
    },
  },
  {
    dailyGameId: 15,
    start: {
      id: 475557,
      type: 'MOVIE' as const,
      label: 'Joker',
      img_path: '/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg',
      creditInfo: null,
    },
    end: {
      id: 18050,
      type: 'PERSON' as const,
      label: 'Elle Fanning',
      img_path: '/ucC5faqfEYVhoC25M6Hi3znZmab.jpg',
      creditInfo: null,
    },
  },
]
const main = async () => {
  try {
    const date = new Date()
    let addDate = 0

    for (const currentData of SEED_DATA) {
      await db.insert(entities).values({
        entityType: currentData.start.type,
        entityId: currentData.start.id,
        label: currentData.start.label,
        imgPath: currentData.start.img_path,
      })
      console.log(`Added ${currentData.start.label} as entity`)

      await db.insert(entities).values({
        entityType: currentData.end.type,
        entityId: currentData.end.id,
        label: currentData.end.label,
        imgPath: currentData.end.img_path,
      })
      console.log(`Added ${currentData.end.label} as entity`)

      await db.insert(dailyGames).values({
        id: currentData.dailyGameId,
        displayDate: date.toDateString(),
        start: currentData.start,
        end: currentData.end,
        startId: currentData.start.id,
        endId: currentData.end.id,
      })
      console.log(
        `Added ${currentData.start.label} --> ${currentData.end.label} as daily game.`,
      )

      addDate++

      date.setDate(date.getDate() + addDate)
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
