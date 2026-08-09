import React from 'react'
import { gameAttemptOptionSelect } from '#/lib/options'
import { useSuspenseQuery } from '@tanstack/react-query'
import { MAX_CAST_LINKS, MAX_CREW_LINKS } from '#/lib/constants'

const usePicks = (dailyGameId: number) => {
  const { data } = useSuspenseQuery(
    gameAttemptOptionSelect(dailyGameId, (d) => {
      const foundCrew =
        d?.gameMovesLog.filter(
          (pick) => pick.linkType === 'CREW' && pick.entityType === 'PERSON',
        ) ?? []
      const foundCast =
        d?.gameMovesLog.filter(
          (pick) => pick.linkType === 'CAST' && pick.entityType === 'PERSON',
        ) ?? []

      return {
        cast: foundCast,
        crew: foundCrew,
        castBudget: d?.dailyGame?.castBudget ?? MAX_CAST_LINKS,
        crewBudget: d?.dailyGame?.crewBudget ?? MAX_CREW_LINKS,
      }
    }),
  )

  return React.useMemo(() => {
    const crewScore = {
      max: data.crewBudget,
      curr: data.crew.length,
      canPick: data.crew.length < data.crewBudget,
    }
    const castScore = {
      max: data.castBudget,
      curr: data.cast.length,
      canPick: data.cast.length < data.castBudget,
    }

    return {
      cast: data.cast,
      crew: data.crew,
      scores: { crewScore, castScore },
      hasPicksLeft: crewScore.canPick || castScore.canPick,
    }
  }, [data])
}

type TReturnUsePicks = ReturnType<typeof usePicks>

export default usePicks
export type { TReturnUsePicks }
