import { queryOptions } from '@tanstack/react-query'
import { getDailyGameId } from './server/daily'
import { getUserGameId } from './server/attempt'

const dailyGameOption = (dailyGameId: number) => {
  return queryOptions({
    queryKey: ['dailyGame', dailyGameId],
    queryFn: () => {
      const data = { dailyGameId: dailyGameId }
      return getDailyGameId({ data })
    },
  })
}

const gameAttemptOption = (gameId: number) => {
  return queryOptions({
    queryKey: ['game', gameId],
    queryFn: () => {
      const data = { gameId: gameId }
      return getUserGameId({ data })
    },
  })
}

export { gameAttemptOption, dailyGameOption }
