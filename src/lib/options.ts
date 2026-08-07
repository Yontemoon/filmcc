import { queryOptions } from '@tanstack/react-query'
import { getDailyGameId } from './server/daily'
import { getUserGameId } from './server/attempt'
import type { ReturnGetUserGameId } from './server/attempt'

type GetUserGameIdReturn = Awaited<ReturnType<typeof getUserGameId>>

interface GameAttemptOptions<TData = ReturnGetUserGameId> {
  gameId: number
  options?: Omit<
    Parameters<typeof queryOptions<GetUserGameIdReturn, Error, TData>>[0],
    'queryKey' | 'queryFn'
  >
}

const dailyGameOption = (dailyGameId: number) => {
  return queryOptions({
    queryKey: ['dailyGame', dailyGameId],
    queryFn: () => {
      const data = { dailyGameId: dailyGameId }
      return getDailyGameId({ data })
    },
  })
}

const gameAttemptOption = <TData = GetUserGameIdReturn>(
  gameId: GameAttemptOptions<TData>['gameId'],
) => {
  return queryOptions({
    queryKey: ['game', gameId],
    queryFn: () => {
      const data = { gameId }
      return getUserGameId({ data })
    },
  })
}

const gameAttemptOptionSelect = <TData = GetUserGameIdReturn>(
  gameId: GameAttemptOptions<TData>['gameId'],
  select?: (data: GetUserGameIdReturn) => TData,
) => {
  return queryOptions({
    queryKey: ['game', gameId],
    queryFn: () => {
      const data = { gameId }
      return getUserGameId({ data })
    },
    select,
  })
}

export { gameAttemptOption, dailyGameOption, gameAttemptOptionSelect }
