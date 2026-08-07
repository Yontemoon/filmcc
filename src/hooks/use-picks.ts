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
      }
    }),
  )

  const scores = React.useMemo(() => {
    const crewScore = {
      max: MAX_CREW_LINKS,
      curr: data.crew.length,
      canPick: data.crew.length < MAX_CREW_LINKS,
    }
    const castScore = {
      max: MAX_CAST_LINKS,
      curr: data.cast.length,
      canPick: data.cast.length < MAX_CAST_LINKS,
    }

    return {
      crewScore,
      castScore,
    }
  }, [data])

  const checkUsedUpAllPoints = React.useCallback(() => {
    const total = MAX_CREW_LINKS + MAX_CAST_LINKS
    const currentTotal = scores.castScore.curr + scores.crewScore.curr
    return currentTotal < total
  }, [scores])

  return { cast: data.cast, crew: data.crew, scores, checkUsedUpAllPoints }
}

type TReturnUsePicks = ReturnType<typeof usePicks>

export default usePicks
export type { TReturnUsePicks }
