import type { TUseCreditsResults } from '#/hooks/hooks.types'
import type { TMovieCrewCol, TPersonCrewCol } from './types'

const reformatForTable = (data: TUseCreditsResults['data']) => {
  if (!data) {
    return
  }

  if (data.type === 'MOVIE') {
    const crewCredits = data.credits.crew.reduce(
      (acc: TMovieCrewCol[], curr) => {
        const foundIndx = acc.findIndex((val) => val.id === curr.id)

        if (foundIndx >= 0) {
          acc[foundIndx].jobs = [...acc[foundIndx].jobs, curr.job]
          return acc
        } else {
          const newReduce = {
            id: curr.id,
            name: curr.name,
            department: curr.department,
            job: curr.job,
            profile_url: curr.profile_path,
            jobs: Array(curr.job),
          }

          acc.push(newReduce)
          return acc
        }
      },
      [],
    )

    const castCredits = data.credits.cast.map((cast) => {
      return {
        id: cast.id,
        name: cast.name,
        role: cast.character,
        profile_url: cast.profile_path,
      }
    })

    return {
      type: 'MOVIE' as const,
      crew: crewCredits,
      cast: castCredits,
    }
  } else {
    const castCredits = data.credits.cast.map((credit) => {
      return {
        date: credit.release_date,
        title: credit.title,
        role: credit.character,
        poster_url: credit.poster_path,
        id: credit.id,
      }
    })

    const crewCredits = data.credits.crew.reduce(
      (acc: TPersonCrewCol[], curr) => {
        const foundIndx = acc.findIndex((val) => val.id === curr.id)

        if (foundIndx >= 0) {
          acc[foundIndx].jobs = [...acc[foundIndx].jobs, curr.job]
          return acc
        } else {
          const newReduce = {
            id: curr.id,
            title: curr.title,
            department: curr.department,
            job: curr.job,
            release_date: curr.release_date,
            poster_url: curr.poster_path,
            jobs: Array(curr.job),
          }

          acc.push(newReduce)
          return acc
        }
      },
      [],
    )
    return { type: 'PERSON' as const, crew: crewCredits, cast: castCredits }
  }
}

export { reformatForTable }
