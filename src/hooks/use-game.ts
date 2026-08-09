import React from 'react'
import { notifications } from '@mantine/notifications'
import { useWindowScroll } from '@mantine/hooks'
import type { TController } from '#/types/client.types'
import useCredits from '#/hooks/use-credits'
import {
  useQueryClient,
  useMutation,
  useSuspenseQuery,
} from '@tanstack/react-query'
import type {
  T_TMDB_MOVIE_CREDITS,
  T_TMDB_MOVIE_DETAILS,
  T_TMDB_PERSON_CREDITS,
  T_TMDB_PERSON_DETAILS,
} from '#/types/tmdb.types'
import type { ReturnGetUserGameId } from '#/lib/server/attempt'
import { addUserGameId, updateUserStatusGameId } from '#/lib/server/attempt'
import { gameAttemptOption } from '#/lib/options'
import type { TGameStatuses } from '#/types/server.types'
import usePicks from './use-picks'
import { reformatForTable } from '#/components/pages/game/utils'

interface PropTypes {
  dailyGameId: number
  end: TController
}

type TGameState = TGameStatuses

const useGame = ({ dailyGameId, end }: PropTypes) => {
  const [initRender, setInitRender] = React.useState<boolean>(true)
  const picks = usePicks(dailyGameId)
  const queryClient = useQueryClient()

  const canKeepPlay = picks.checkUsedUpAllPoints()

  const gameAttemptQuery = useSuspenseQuery(gameAttemptOption(dailyGameId))
  const history = gameAttemptQuery.data?.gameMovesLog ?? []

  const [controller, setController] = React.useState<TController>(() => {
    const last =
      gameAttemptQuery.data?.gameMovesLog[
        gameAttemptQuery.data.gameMovesLog.length - 1
      ]

    if (!last) {
      throw new Error('No last')
    }

    if (!last.entity) {
      console.error(`No entity was found for ID ${last.entityId}`)
      throw new Error('No movie or person was found.')
    }

    const format = {
      type: last.entity.entityType,
      id: last.entityId,
      label: last.entity.label,
      img_path: last.entity.imgPath,
    }
    return format
  })

  const [_scroll, scrollTo] = useWindowScroll()

  const [gameState, setGameState] = React.useState<TGameState>(() => {
    const statusInfo = gameAttemptQuery.data
    if (!statusInfo) {
      throw new Error('No Status found')
    }
    return statusInfo.status
  })

  React.useEffect(() => {
    console.log(canKeepPlay)
    if (canKeepPlay === false) {
      setGameState('failed')
    }
  }, [canKeepPlay])

  const mutation = useMutation({
    mutationFn: addUserGameId,
    onMutate: async (variables, context) => {
      const newVariables = variables.data
      await context.client.cancelQueries({ queryKey: ['game', dailyGameId] })
      const previousGame = context.client.getQueryData([
        'game',
        dailyGameId,
      ]) as ReturnGetUserGameId
      const isGoal =
        newVariables.entityId === end.id && newVariables.entityType === end.type

      if (isGoal) {
        gameOver()
      }

      const newHistory = {
        ...newVariables,
        movieIndex: previousGame.gameMovesLog.length,
        is_goal: isGoal,
      }

      // * This is what causes optimistic updates.
      context.client.setQueryData(
        ['game', dailyGameId],
        (oldGameData: ReturnGetUserGameId) => {
          const optimisticData = {
            ...oldGameData,
            status: isGoal ? 'completed' : 'in_progress',
            gameMovesLog: [...oldGameData.gameMovesLog, newHistory],
          }

          return optimisticData
        },
      )

      return { previousGame }
    },
    onError: (_error, _variables, onMutateResult, context) => {
      context.client.setQueryData(
        ['game', dailyGameId],
        onMutateResult?.previousGame,
      )
    },

    onSettled: (_data, _error, _variables, _onMutateResult, context) => {
      context.client.invalidateQueries({ queryKey: ['game', dailyGameId] })
    },
  })

  const checkController = (newController: TController) => {
    const isPresent = history.findIndex((curr) => {
      if (
        curr.entityId === newController.id &&
        curr.entityType === newController.type
      ) {
        return curr
      }
    })

    return isPresent >= 0 ? true : false
  }

  const startGame = async () => {
    if (gameState === 'started') {
      const attemptId = gameAttemptQuery.data?.id
      console.log(attemptId)
      if (attemptId) {
        await updateUserStatusGameId({
          data: { gameId: attemptId, status: 'in_progress' },
        })

        setGameState('in_progress')
      }
    }
  }

  const gameOver = () => {
    setGameState('completed')
  }

  // * FETCHES THE CURRENT "CONTROLLER"
  // * USE FOR THE MAIN BODY, WHERE THE CREDITS / CREW INFORMATION IS DISPLAYED
  // * GETS ITS DETAILS AND CREDIT/CREW INFORMATION
  const query = useCredits(controller.type, controller.id)

  // * SIDE EFFECT ONCE CURRENT CONTROLLER CHANGES,
  // * MODIFIES THE HISTORY
  React.useEffect(() => {
    if (initRender) {
      setInitRender(false)
      return
    }

    const { data } = query

    if (history.find((curr) => curr.entityId === controller.id)) {
      return
    }

    if (!data) {
      return
    }

    const { type: dataType } = data

    if (controller.type === 'MOVIE' && dataType === 'MOVIE') {
      const { type, ...restOfController } = controller

      const prevController = history[history.length - 1]
      const prevControlId = prevController.entityId
      const prevControlCache = queryClient.getQueryData([
        'PERSON',
        prevControlId,
      ]) as {
        details: T_TMDB_PERSON_DETAILS
        credits: T_TMDB_PERSON_CREDITS
        type: 'PERSON'
      }

      const creditInfo =
        prevControlCache.credits.cast.find((c) => c.id === controller.id) ??
        prevControlCache.credits.crew.find((c) => c.id === controller.id)

      const isCast = creditInfo && 'character' in creditInfo

      if (gameAttemptQuery.data) {
        const mutationData = {
          attemptId: gameAttemptQuery.data.id,

          entityId: restOfController.id,
          entityType: type,
          imgPath: restOfController.img_path,
          label: restOfController.label,
          roleName: isCast ? creditInfo.character : null,
          roleType: isCast ? 'Acting' : creditInfo ? creditInfo.job : 'unknown',
          linkType: isCast ? ('CAST' as const) : ('CREW' as const),
        }

        mutation.mutate({
          data: mutationData,
        })
      }
    }

    if (controller.type === 'PERSON' && dataType === 'PERSON') {
      const { type, ...restOfController } = controller

      const prevController = history[history.length - 1]
      const prevControlId = prevController.entityId
      const prevControlCache = queryClient.getQueryData([
        'MOVIE',
        prevControlId,
      ]) as {
        details: T_TMDB_MOVIE_DETAILS
        credits: T_TMDB_MOVIE_CREDITS
        type: 'MOVIE'
      }

      const creditInfo =
        prevControlCache.credits.cast.find((c) => c.id === controller.id) ??
        prevControlCache.credits.crew.find((c) => c.id === controller.id)

      const isCast = creditInfo && 'character' in creditInfo

      if (gameAttemptQuery.data) {
        const mutationData = {
          attemptId: gameAttemptQuery.data.id,
          entityId: restOfController.id,
          entityType: type,
          imgPath: restOfController.img_path,
          label: restOfController.label,
          roleName: isCast ? creditInfo.character : null,
          roleType: isCast ? 'Acting' : creditInfo ? creditInfo.job : 'unknown',

          linkType: isCast ? ('CAST' as const) : ('CREW' as const),
        }

        mutation.mutate({
          data: mutationData,
        })
      }
    }
  }, [query.data, history, picks])

  const memoTableData = React.useMemo(() => {
    const formatData = reformatForTable(query.data, history, picks)

    return formatData
  }, [query.data, history, picks])

  React.useEffect(() => {
    if (!initRender) {
      const total = memoTableData?.combined.length
      if (total) {
        if (memoTableData.type === 'MOVIE') {
          const movieSec = memoTableData.combined.filter(
            (curr) => curr.already_added || curr.can_be_picked === false,
          ).length

          if (movieSec >= total) {
            setGameState('failed')
          }
        } else {
          const numAdded = memoTableData.combined.filter((curr) => {
            return curr.already_added
          }).length

          if (numAdded >= total) {
            setGameState('failed')
          }
        }
      }
    }
  }, [memoTableData])

  // * FUNCTION THAT GETS CALLED TO CHANGE THE CONTROLLER => TRIGGERS THE USECREDITS HOOK.
  const changeController = async (newControll: TController): Promise<void> => {
    if (gameState === 'in_progress') {
      const isPresent = checkController(newControll)

      if (isPresent) {
        notifications.show({
          title: 'Already chosen!',
          message: `${newControll.label} is already in your history.`,
        })
        return
      }

      setController(newControll)

      scrollTo({
        y: 0,
      })
    }
  }

  return {
    startGame,
    query,
    changeController,
    gameOver,
    stats: {
      count: history.length - 1,
    },
    gameState,
    history,
    picks,
    bodyData: memoTableData,
  }
}

type TReturnUseGame = ReturnType<typeof useGame>

export default useGame
export type { TReturnUseGame }
