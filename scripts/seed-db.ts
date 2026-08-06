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
      id: 27205,
      type: 'MOVIE' as const,
      label: 'Inception',
      img_path: '/oYu2T1L1N97R8392.jpg',
      creditInfo: null,
    },
    end: {
      id: 1245,
      type: 'PERSON' as const,
      label: 'Scarlett Johansson',
      img_path: '/sJPc2hBpn09281.jpg',
      creditInfo: null,
    },
  },
  {
    dailyGameId: 3,
    start: {
      id: 496243,
      type: 'MOVIE' as const,
      label: 'Parasite',
      img_path: '/pPc2hBpn09281.jpg',
      creditInfo: null,
    },
    end: {
      id: 31,
      type: 'PERSON' as const,
      label: 'Tom Hanks',
      img_path: '/tHPc2hBpn09281.jpg',
      creditInfo: null,
    },
  },
  {
    dailyGameId: 4,
    start: {
      id: 603,
      type: 'MOVIE' as const,
      label: 'The Matrix',
      img_path: '/tMPc2hBpn09281.jpg',
      creditInfo: null,
    },
    end: {
      id: 204,
      type: 'PERSON' as const,
      label: 'Kate Winslet',
      img_path: '/kWPc2hBpn09281.jpg',
      creditInfo: null,
    },
  },
  {
    dailyGameId: 5,
    start: {
      id: 155,
      type: 'MOVIE' as const,
      label: 'The Dark Knight',
      img_path: '/tDK2hBpn09281.jpg',
      creditInfo: null,
    },
    end: {
      id: 2231,
      type: 'PERSON' as const,
      label: 'Samuel L. Jackson',
      img_path: '/sLJ2hBpn09281.jpg',
      creditInfo: null,
    },
  },
  {
    dailyGameId: 6,
    start: {
      id: 11,
      type: 'MOVIE' as const,
      label: 'Star Wars: A New Hope',
      img_path: '/sWPc2hBpn09281.jpg',
      creditInfo: null,
    },
    end: {
      id: 21684,
      type: 'PERSON' as const,
      label: 'Song Kang-ho',
      img_path: '/sKPc2hBpn09281.jpg',
      creditInfo: null,
    },
  },
  {
    dailyGameId: 7,
    start: {
      id: 550,
      type: 'MOVIE' as const,
      label: 'Fight Club',
      img_path: '/pBSc2hBpn09281.jpg',
      creditInfo: null,
    },
    end: {
      id: 2,
      type: 'PERSON' as const,
      label: 'Mark Hamill',
      img_path: '/mHPc2hBpn09281.jpg',
      creditInfo: null,
    },
  },
  {
    dailyGameId: 8,
    start: {
      id: 120,
      type: 'MOVIE' as const,
      label: 'The Lord of the Rings: The Fellowship of the Ring',
      img_path: '/lTR2hBpn09281.jpg',
      creditInfo: null,
    },
    end: {
      id: 287,
      type: 'PERSON' as const,
      label: 'Brad Pitt',
      img_path: '/bPSc2hBpn09281.jpg',
      creditInfo: null,
    },
  },
  {
    dailyGameId: 9,
    start: {
      id: 680,
      type: 'MOVIE' as const,
      label: 'Pulp Fiction',
      img_path: '/pFPc2hBpn09281.jpg',
      creditInfo: null,
    },
    end: {
      id: 10296,
      type: 'PERSON' as const,
      label: 'Matthew McConaughey',
      img_path: '/mMc2hBpn09281.jpg',
      creditInfo: null,
    },
  },
  {
    dailyGameId: 10,
    start: {
      id: 157336,
      type: 'MOVIE' as const,
      label: 'Interstellar',
      img_path: '/gEU2Q3L1N97R8392.jpg',
      creditInfo: null,
    },
    end: {
      id: 6384,
      type: 'PERSON' as const,
      label: 'Keanu Reeves',
      img_path: '/kRPc2hBpn09281.jpg',
      creditInfo: null,
    },
  },
  {
    dailyGameId: 11,
    start: {
      id: 13,
      type: 'MOVIE' as const,
      label: 'Forrest Gump',
      img_path: '/fGPc2hBpn09281.jpg',
      creditInfo: null,
    },
    end: {
      id: 6193,
      type: 'PERSON' as const,
      label: 'Leonardo DiCaprio',
      img_path: '/wo2hBpn09281.jpg',
      creditInfo: null,
    },
  },
  {
    dailyGameId: 12,
    start: {
      id: 24428,
      type: 'MOVIE' as const,
      label: 'The Avengers',
      img_path: '/tAV2hBpn09281.jpg',
      creditInfo: null,
    },
    end: {
      id: 85272,
      type: 'PERSON' as const,
      label: 'Makoto Shinkai',
      img_path: '/mSPc2hBpn09281.jpg',
      creditInfo: null,
    },
  },
  {
    dailyGameId: 13,
    start: {
      id: 597,
      type: 'MOVIE' as const,
      label: 'Titanic',
      img_path: '/tTPc2hBpn09281.jpg',
      creditInfo: null,
    },
    end: {
      id: 3894,
      type: 'PERSON' as const,
      label: 'Christian Bale',
      img_path: '/cBPC2hBpn09281.jpg',
      creditInfo: null,
    },
  },
  {
    dailyGameId: 14,
    start: {
      id: 372058,
      type: 'MOVIE' as const,
      label: 'Your Name.',
      img_path: '/yNPc2hBpn09281.jpg',
      creditInfo: null,
    },
    end: {
      id: 3223,
      type: 'PERSON' as const,
      label: 'Robert Downey Jr.',
      img_path: '/rDJ2hBpn09281.jpg',
      creditInfo: null,
    },
  },
  {
    dailyGameId: 15,
    start: {
      id: 299536,
      type: 'MOVIE' as const,
      label: 'Avengers: Infinity War',
      img_path: '/aIW2hBpn09281.jpg',
      creditInfo: null,
    },
    end: {
      id: 109,
      type: 'PERSON' as const,
      label: 'Elijah Wood',
      img_path: '/eWPc2hBpn09281.jpg',
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
