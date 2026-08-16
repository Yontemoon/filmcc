import React from 'react'
import { notifications } from '@mantine/notifications'
import { useWindowScroll } from '@mantine/hooks'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import type { TController, TMove } from '#/types/client.types'
import type { TGameStatuses } from '#/types/server.types'
import type { ReturnGetUserGameId } from '#/lib/server/attempt'
import { addUserGameId, updateUserStatusGameId } from '#/lib/server/attempt'
import { gameAttemptOption } from '#/lib/options'
import useCredits from '#/hooks/use-credits'
import usePicks from '#/hooks/use-picks'
import { reformatForTable, stuckReason } from '#/components/pages/game/utils'
import type { TStuckReason } from '#/components/pages/game/utils'

interface PropTypes {
  dailyGameId: number
  end: TController
}

type TAttempt = ReturnGetUserGameId
type TMoveEntry = TAttempt['gameMovesLog'][number]

const gameKey = (dailyGameId: number) => ['game', dailyGameId]

const TERMINAL_STATUSES: ReadonlyArray<TGameStatuses> = [
  'completed',
  'failed',
  'gave_up',
]

const useGame = ({ dailyGameId, end }: PropTypes) => {
  const [, scrollTo] = useWindowScroll()

  const attemptQuery = useSuspenseQuery(gameAttemptOption(dailyGameId))
  const picks = usePicks(dailyGameId)

  const attempt = attemptQuery.data
  if (!attempt) {
    throw new Error(`No game attempt found for daily game ${dailyGameId}`)
  }

  const history = attempt.gameMovesLog

  const lastMove = history.at(-1)
  const lastEntity = lastMove?.entity
  if (!lastEntity) {
    throw new Error(
      `Move log has no playable entity (entityId ${lastMove ? lastMove.entityId : 'none'})`,
    )
  }

  const controller = React.useMemo<TController>(
    () => ({
      type: lastEntity.entityType,
      id: lastEntity.entityId,
      label: lastEntity.label,
      img_path: lastEntity.imgPath,
    }),
    [lastEntity],
  )

  const credits = useCredits(controller.type, controller.id)

  const bodyData = React.useMemo(
    () =>
      reformatForTable(credits.data, history, {
        castCanPick: picks.scores.castScore.canPick,
        crewCanPick: picks.scores.crewScore.canPick,
      }),
    [credits.data, history, picks.scores],
  )

  const reason = React.useMemo(() => {
    return stuckReason(bodyData, picks.hasPicksLeft)
  }, [bodyData, picks.hasPicksLeft])

  const status: TGameStatuses = TERMINAL_STATUSES.includes(attempt.status)
    ? attempt.status
    : reason
      ? 'failed'
      : attempt.status

  const statusMutation = useMutation({
    mutationFn: updateUserStatusGameId,
    onMutate: async (variables, context) => {
      await context.client.cancelQueries({ queryKey: gameKey(dailyGameId) })
      const previous = context.client.getQueryData<TAttempt>(
        gameKey(dailyGameId),
      )

      context.client.setQueryData<TAttempt>(gameKey(dailyGameId), (old) =>
        old
          ? variables.data.message
            ? {
                ...old,
                status: variables.data.status,
                message: variables.data.message,
              }
            : {
                ...old,
                status: variables.data.status,
              }
          : old,
      )

      return { previous }
    },
    onError: (_error, _variables, onMutateResult, context) => {
      if (onMutateResult?.previous) {
        context.client.setQueryData(
          gameKey(dailyGameId),
          onMutateResult.previous,
        )
      }
    },
    onSettled: (_data, _error, _variables, _onMutateResult, context) => {
      context.client.invalidateQueries({ queryKey: gameKey(dailyGameId) })
    },
  })

  const moveMutation = useMutation({
    mutationFn: addUserGameId,
    onMutate: async (variables, context) => {
      const move = variables.data

      await context.client.cancelQueries({ queryKey: gameKey(dailyGameId) })
      const previous = context.client.getQueryData<TAttempt>(
        gameKey(dailyGameId),
      )
      if (!previous) {
        return { previous }
      }

      const isGoal = move.entityId === end.id && move.entityType === end.type
      const now = new Date()

      const optimisticMove: TMoveEntry = {
        isStart: false,
        attemptId: move.attemptId,
        userId: previous.userId ?? '',
        moveIndex: previous.gameMovesLog.length,
        entityId: move.entityId,
        entityType: move.entityType,
        roleName: move.roleName,
        roleType: move.roleType,
        linkType: move.linkType,
        isGoal,
        createdAt: now,
        entity: {
          entityId: move.entityId,
          entityType: move.entityType,
          label: move.label,
          imgPath: move.imgPath,
          popularity: null,
          metadata: null,
          createdAt: now,
          updatedAt: now,
        },
      }

      context.client.setQueryData<TAttempt>(gameKey(dailyGameId), (old) =>
        old
          ? {
              ...old,
              status: isGoal ? 'completed' : 'in_progress',
              gameMovesLog: [...old.gameMovesLog, optimisticMove],
            }
          : old,
      )

      return { previous }
    },
    onError: (_error, _variables, onMutateResult, context) => {
      if (onMutateResult?.previous) {
        context.client.setQueryData(
          gameKey(dailyGameId),
          onMutateResult.previous,
        )
      }
    },
    onSettled: (_data, _error, _variables, _onMutateResult, context) => {
      context.client.invalidateQueries({ queryKey: gameKey(dailyGameId) })
    },
  })

  const { mutate: mutateStatus } = statusMutation

  const startGame = () => {
    if (attempt.status !== 'started') {
      return
    }
    mutateStatus({ data: { gameId: attempt.id, status: 'in_progress' } })
  }

  const failedGame = React.useCallback(
    (message: TStuckReason | string) => {
      if (attempt.status !== 'in_progress') {
        return
      }
      mutateStatus({
        data: { gameId: attempt.id, status: 'failed', message: message },
      })
    },
    [attempt.status, attempt.id, mutateStatus],
  )

  const failureWritten = React.useRef(false)

  React.useEffect(() => {
    if (!reason || attempt.status !== 'in_progress' || failureWritten.current) {
      return
    }

    failureWritten.current = true
    failedGame(reason)
  }, [reason, attempt.status, failedGame])

  const gaveUpGame = () => {
    if (attempt.status !== 'in_progress') {
      return
    }
    mutateStatus({
      data: { gameId: attempt.id, status: 'gave_up' },
    })
  }

  const changeController = (move: TMove) => {
    if (status !== 'in_progress') {
      return
    }

    const alreadyVisited = history.some(
      (curr) =>
        curr.entityId === move.entityId && curr.entityType === move.entityType,
    )

    if (alreadyVisited) {
      notifications.show({
        title: 'Already chosen!',
        message: `${move.label} is already in your history.`,
      })
      return
    }

    moveMutation.mutate({ data: { attemptId: attempt.id, ...move } })
    scrollTo({ y: 0 })
  }

  return {
    state: {
      status,
      stuckReason: reason,
      isMoving: moveMutation.isPending,
    },
    data: {
      controller,
      history,
      picks,
      bodyData,
      credits,
    },
    actions: {
      startGame,
      gaveUpGame,
      changeController,
    },
    stats: {
      moves: history.length - 1,
    },
  }
}

type TReturnUseGame = ReturnType<typeof useGame>

export default useGame
export type { TReturnUseGame }
