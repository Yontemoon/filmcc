import type { TUseCreditsResults } from '#/hooks/hooks.types'
import { FILTERED_CREW_TYPES } from '#/lib/constants'
import type { ReturnGetUserGameId } from '#/lib/server/attempt'
import type { TMove } from '#/types/client.types'
import type {
  TMovieCastCol,
  TMovieCrewCol,
  TPersonCastCol,
  TPersonCrewCol,
} from './types'

type TPickBudget = {
  castCanPick: boolean
  crewCanPick: boolean
}

const reformatForTable = (
  data: TUseCreditsResults['data'],
  history: ReturnGetUserGameId['gameMovesLog'],
  budget: TPickBudget,
) => {
  if (!data) {
    return
  }

  const { castCanPick, crewCanPick } = budget

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
            can_be_picked: crewCanPick,
          }

          acc.push(newReduce)
          return acc
        }
      },
      [],
    )

    crewCredits.forEach((crew) => {
      crew.jobs.sort((a, b) => {
        const indexA = FILTERED_CREW_TYPES.includes(a)
          ? FILTERED_CREW_TYPES.indexOf(a)
          : 999
        const indexB = FILTERED_CREW_TYPES.includes(b)
          ? FILTERED_CREW_TYPES.indexOf(b)
          : 999

        return indexA - indexB
      })
    })

    crewCredits.sort((a, b) => {
      const indexA = FILTERED_CREW_TYPES.includes(a.jobs[0])
        ? FILTERED_CREW_TYPES.indexOf(a.jobs[0])
        : 999
      const indexB = FILTERED_CREW_TYPES.includes(b.jobs[0])
        ? FILTERED_CREW_TYPES.indexOf(b.jobs[0])
        : 999

      return indexA - indexB
    })

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
        can_be_picked: castCanPick,
      }
    }) as TMovieCastCol[]

    return {
      type: 'MOVIE' as const,
      combined: [...crewCredits, ...castCredits],
    }

    // Person
  } else {
    const movieCanBePicked = castCanPick || crewCanPick
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
          can_be_picked: movieCanBePicked,
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
            can_be_picked: movieCanBePicked,
          }

          acc.push(newReduce)
          return acc
        }
      }, [])
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
      combined: outerJoinArrary
        .map((arr) => arr.cast ?? arr.crew)
        .filter((arr) => arr !== null),
    }
  }
}

type TReturnReformatTable = ReturnType<typeof reformatForTable>
type TStuckReason = 'no_picks_left' | 'board_exhausted'

const stuckReason = (
  bodyData: TReturnReformatTable,
  hasPicksLeft: boolean,
): TStuckReason | null => {
  if (!hasPicksLeft) {
    return 'no_picks_left'
  }

  if (!bodyData || bodyData.combined.length === 0) {
    return null
  }

  const rows: Array<{ already_added: boolean; can_be_picked: boolean }> =
    bodyData.combined

  return rows.every((row) => row.already_added || !row.can_be_picked)
    ? 'board_exhausted'
    : null
}

const movieRowToMove = (row: TMovieCastCol | TMovieCrewCol): TMove =>
  row.person_type === 'cast'
    ? {
        entityId: row.id,
        entityType: 'PERSON',
        label: row.name,
        imgPath: row.profile_url,
        linkType: 'CAST',
        roleName: row.role,
        roleType: 'Acting',
      }
    : {
        entityId: row.id,
        entityType: 'PERSON',
        label: row.name,
        imgPath: row.profile_url,
        linkType: 'CREW',
        roleName: null,
        roleType: row.job,
      }

const personRowToMove = (row: TPersonCastCol | TPersonCrewCol): TMove =>
  row.person_type === 'cast'
    ? {
        entityId: row.id,
        entityType: 'MOVIE',
        label: row.title,
        imgPath: row.poster_url,
        linkType: 'CAST',
        roleName: row.role,
        roleType: 'Acting',
      }
    : {
        entityId: row.id,
        entityType: 'MOVIE',
        label: row.title,
        imgPath: row.poster_url,
        linkType: 'CREW',
        roleName: null,
        roleType: row.job,
      }

export { reformatForTable, stuckReason, movieRowToMove, personRowToMove }
export type { TReturnReformatTable, TPickBudget, TStuckReason }
