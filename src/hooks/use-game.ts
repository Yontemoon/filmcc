import React from 'react'
import { notifications } from '@mantine/notifications'
import { useCounter, useWindowScroll } from '@mantine/hooks'
import useTimerRef from './use-timer-ref'
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
import type { ReturnGetUserGameId } from '#/lib/server/game'
import { addUserGameId, updateUserStatusGameId } from '#/lib/server/game'
import { gameAttemptOption } from '#/lib/options'
import type { TGameStatuses } from '#/types/server.types'

interface PropTypes {
  dailyGameId: number
  start: TController
  end: TController
}

type TGameState = TGameStatuses

const useGame = ({ dailyGameId, start, end }: PropTypes) => {
  const [initRender, setInitRender] = React.useState<boolean>(true)
  const gameAttemptQuery = useSuspenseQuery(gameAttemptOption(dailyGameId))
  const gameMoves = gameAttemptQuery.data?.gameMovesLog ?? []

  const { startTimer, stopTimer, isTimerRunning, getElapsedMs } = useTimerRef()
  const [count, { increment }] = useCounter(0, { min: 0 })
  const [stats, setStats] = React.useState({
    count: count,
    time: 0,
  })

  const [controller, setController] = React.useState<TController>(() => {
    const last =
      gameAttemptQuery.data?.gameMovesLog[
        gameAttemptQuery.data.gameMovesLog.length - 1
      ]

    if (!last) {
      throw new Error('Something wrong happened')
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
  const queryClient = useQueryClient()

  const [gameState, setGameState] = React.useState<TGameState>(() => {
    const statusInfo = gameAttemptQuery.data
    if (!statusInfo) {
      throw new Error('No Status found')
    }
    return statusInfo.status
  })

  const mutation = useMutation({
    mutationFn: addUserGameId,
    onMutate: async (variables, context) => {
      const newVariables = variables.data
      await context.client.cancelQueries({ queryKey: ['game', dailyGameId] })
      const previousGame = context.client.getQueryData([
        'game',
        dailyGameId,
      ]) as ReturnGetUserGameId

      const newHistory = {
        ...newVariables,
        movieIndex: previousGame.gameMovesLog.length,
      }

      // * This is what causes optimistic updates.
      context.client.setQueryData(
        ['game', dailyGameId],
        (oldGameData: ReturnGetUserGameId) => {
          const optimisticData = {
            ...oldGameData,
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

  React.useEffect(() => {
    if (gameState === 'in_progress') {
      startTimer()
    }
  }, [gameState])

  React.useEffect(() => {
    if (gameState === 'in_progress') {
      setStats((prev) => {
        return { ...prev, count: count }
      })
    }
  }, [count])

  const checkController = (newController: TController) => {
    const isPresent = gameMoves.findIndex((curr) => {
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
    if (gameState === 'in_progress') {
      setGameState('completed')
    }
  }

  // * FETCHES THE CURRENT "CONTROLLER"
  // * USE FOR THE MAIN BODY, WHERE THE CREDITS / CREW INFORMATION IS DISPLAYED
  // * GETS ITS DETAILS AND CREDIT/CREW INFORMATION
  const query = useCredits(controller.type, controller.id)

  // * SIDE EFFECT ONCE CURRENT CONTROLLER CHANGES,
  // * MODIFIES THE HISTORY / GAME MOVES
  React.useEffect(() => {
    if (initRender) {
      setInitRender(false)
      return
    }

    if (gameState === 'in_progress' || gameState === 'started') {
      const { data } = query

      if (gameMoves.find((curr) => curr.entityId === controller.id)) {
        return
      }

      if (!data) {
        return
      }

      const { type: dataType } = data

      if (controller.type === 'MOVIE' && dataType === 'MOVIE') {
        const { type, ...restOfController } = controller

        const prevController = gameMoves[gameMoves.length - 1]
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
            roleType: isCast
              ? 'Acting'
              : creditInfo
                ? creditInfo.job
                : 'unknown',
          }

          mutation.mutate({
            data: mutationData,
          })
        }
      }

      if (controller.type === 'PERSON' && dataType === 'PERSON') {
        const { type, ...restOfController } = controller

        const prevController = gameMoves[gameMoves.length - 1]
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
            roleType: isCast
              ? 'Acting'
              : creditInfo
                ? creditInfo.job
                : 'unknown',
          }

          mutation.mutate({
            data: mutationData,
          })
        }
      }

      if (query.data?.credits) {
        // TODO do the same with Movie Section
        if (data.type === 'PERSON') {
          const historyPersonsIds = gameMoves
            .filter((control) => control.entityType === 'MOVIE')
            .map((control) => control.entityId)

          let NumberOfCastTaken = 0
          const castLength = query.data.credits.cast.length

          for (const movie of query.data.credits.cast) {
            const isTaken = historyPersonsIds.findIndex((id) => id === movie.id)
            if (isTaken >= 0) {
              NumberOfCastTaken++
            }
          }

          if (castLength !== 0 && NumberOfCastTaken === castLength) {
            setGameState('failed')
          }

          let numberofCrewTaken = 0
          const crewLength = query.data.credits.crew.length

          for (const movie of query.data.credits.crew) {
            const isTaken = historyPersonsIds.findIndex((id) => id === movie.id)
            if (isTaken >= 0) {
              numberofCrewTaken++
            }
          }
          if (crewLength !== 0 && numberofCrewTaken === crewLength) {
            setGameState('failed')
          }
        } else {
          const historyPersonsIds = gameMoves
            .filter((control) => control.entityType === 'PERSON')
            .map((control) => control.entityId)

          let NumberOfCastTaken = 0
          const castLength = query.data.credits.cast.length

          for (const movie of query.data.credits.cast) {
            const isTaken = historyPersonsIds.findIndex((id) => id === movie.id)
            if (isTaken >= 0) {
              NumberOfCastTaken++
            }
          }

          if (castLength !== 0 && NumberOfCastTaken === castLength) {
            setGameState('failed')
          }

          let numberofCrewTaken = 0
          const crewLength = query.data.credits.crew.length

          for (const movie of query.data.credits.crew) {
            const isTaken = historyPersonsIds.findIndex((id) => id === movie.id)
            if (isTaken >= 0) {
              numberofCrewTaken++
            }
          }
          if (crewLength !== 0 && numberofCrewTaken === crewLength) {
            setGameState('failed')
          }
        }
      }
    }
  }, [query.data])

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

      if (newControll.id === end.id && newControll.type === end.type) {
        setGameState('completed')
        const attemptId = gameAttemptQuery.data?.id

        if (attemptId) {
          await updateUserStatusGameId({
            data: { gameId: attemptId, status: 'completed' },
          })
        }
        const finalTime = stopTimer()
        setStats({
          count: count + 1,
          time: finalTime,
        })
        return
      }

      setController(newControll)
      increment()
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
    stats,
    time: {
      isTimerRunning,
      getElapsedMs,
      finalTime: stats.time,
    },

    gameState,
    gameMoves,
  }
}

export default useGame
