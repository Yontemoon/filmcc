import type { TUseCreditsResults } from '#/hooks/hooks.types'
import type { ReturnGetUserGameId } from '#/lib/server/game'
import type {
  TMovieCastCol,
  TMovieCrewCol,
  TPersonCastCol,
  TPersonCrewCol,
} from './types'

const reformatForTable = (
  data: TUseCreditsResults['data'],
  history: ReturnGetUserGameId['gameMovesLog'],
) => {
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
          const isDuplicate = history.findIndex((val) => {
            return val.entityId === curr.id && val.entityType === 'PERSON'
          })

          const newReduce = {
            id: curr.id,
            name: curr.name,
            department: curr.department,
            job: curr.job,
            profile_url: curr.profile_path,
            jobs: Array(curr.job),
            already_added: isDuplicate >= 0 ? true : false,
            person_type: 'crew' as const,
          }

          acc.push(newReduce)
          return acc
        }
      },
      [],
    )

    const castCredits = data.credits.cast.map((cast) => {
      const isDuplicate = history.findIndex(
        (val) => val.entityId === cast.id && val.entityType === 'PERSON',
      )
      return {
        id: cast.id,
        name: cast.name,
        role: cast.character,
        profile_url: cast.profile_path,
        already_added: isDuplicate >= 0 ? true : false,
        person_type: 'cast' as const,
      }
    }) as TMovieCastCol[]

    return {
      type: 'MOVIE' as const,
      combined: [...crewCredits, ...castCredits],
    }

    // Person
  } else {
    const castCredits = data.credits.cast
      .map((credit) => {
        const isDuplicate = history.findIndex(
          (val) => val.entityId === credit.id && val.entityType === 'MOVIE',
        )
        return {
          id: credit.id,
          date: credit.release_date,
          title: credit.title,
          role: credit.character,
          poster_url: credit.poster_path,
          already_added: isDuplicate >= 0 ? true : false,
          person_type: 'cast' as const,
        }
      })
      .filter((movie) => movie.poster_url) as TPersonCastCol[]

    const crewCredits = data.credits.crew
      .reduce((acc: TPersonCrewCol[], curr) => {
        const foundIndx = acc.findIndex((val) => val.id === curr.id)
        const isDuplicate = history.findIndex(
          (val) => val.entityId === curr.id && val.entityType === 'MOVIE',
        )

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
            already_added: isDuplicate >= 0 ? true : false,
            person_type: 'crew' as const,
          }

          acc.push(newReduce)
          return acc
        }
      }, [])
      .filter((movie) => movie.poster_url)
      .filter((movie) => movie.poster_url)

    const mergedMap = new Map<
      number,
      { cast: TPersonCastCol | null; crew: TPersonCrewCol | null }
    >(castCredits.map((item) => [item.id, { cast: item, crew: null }]))

    crewCredits.forEach((item) => {
      const existingMap = mergedMap.get(item.id) ?? null
      if (existingMap) {
        mergedMap.set(item.id, {
          cast: mergedMap.get(item.id)?.cast ?? null,
          crew: item,
        })
      } else {
        mergedMap.set(item.id, { cast: null, crew: item })
      }
    })
    const outerJoinArrary = Array.from(mergedMap.values()).sort((a, b) => {
      const aRelease = a.cast?.date ?? a.crew?.release_date
      const bRelease = b.cast?.date ?? b.crew?.release_date

      if (!aRelease && !bRelease) return 0
      if (!aRelease) return 1
      if (!bRelease) return -1

      return bRelease.localeCompare(aRelease)
    })

    return {
      type: 'PERSON' as const,
      crew: crewCredits.filter((movie) => movie.poster_url),
      cast: castCredits.filter((movie) => movie.poster_url),
      combined: outerJoinArrary,
    }
  }
}

export { reformatForTable }
