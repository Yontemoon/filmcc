import React from 'react'
import { notifications } from '@mantine/notifications'
import { useCounter } from '@mantine/hooks'
import useTimerRef from './use-timer-ref'
import type {
  TController,
  TMovieController,
  TPersonController,
} from '#/types/client.types'
import useCredits from '#/hooks/use-credits'

interface PropTypes {
  start: TController
  end: TController
}

const useGame = ({ start, end }: PropTypes) => {
  const [controller, setController] = React.useState<TController>(start)
  const { startTimer, stopTimer, isTimerRunning, getElapsedMs } = useTimerRef()
  const [gameOver, setGameOver] = React.useState(false)
  const [history, setHistory] = React.useState<
    Array<TMovieController | TPersonController>
  >([])
  const [count, { increment }] = useCounter(0, { min: 0 })
  React.useEffect(() => {
    startTimer()
  }, [])

  const [stats, setStats] = React.useState({
    count: count,
    time: 0,
  })

  React.useEffect(() => {
    setStats((prev) => {
      return { ...prev, count: count }
    })
  }, [count])

  const checkController = (newController: TController) => {
    const isPresent = history.findIndex((curr) => {
      if (curr.id === newController.id && curr.type === newController.type) {
        return curr
      }
    })

    return isPresent >= 0 ? true : false
  }

  const changeController = (newControll: TController): void => {
    const isPresent = checkController(newControll)

    if (isPresent) {
      notifications.show({
        title: 'Depicate',
        message: `${newControll.label} is already in your history.`,
      })
      return
    }

    if (newControll.id === end.id && newControll.type === end.type) {
      setGameOver(true)

      const finalTime = stopTimer()
      setStats({
        count: count + 1,
        time: finalTime,
      })
    }

    setController(newControll)

    increment()
  }

  const query = useCredits(controller.type, controller.id)

  React.useEffect(() => {
    const { data } = query

    if (history.find((curr) => curr.id === controller.id)) {
      return
    }

    if (!data) {
      return
    }

    const { type: dataType } = data

    if (controller.type === 'MOVIE' && dataType === 'MOVIE') {
      const { type, ...restOfController } = controller

      setHistory((prev) => [
        ...prev,
        {
          ...restOfController,
          type,
          details: data.details,
        },
      ])
    }

    if (controller.type === 'PERSON' && dataType === 'PERSON') {
      const { type, ...restOfController } = controller

      setHistory((prev) => [
        ...prev,
        {
          ...restOfController,
          type,
          details: data.details,
        },
      ])
    }
  }, [query.data])

  return {
    history,
    query,
    changeController,
    gameOver,
    stats,
    time: {
      isTimerRunning,
      getElapsedMs,
      finalTime: stats.time,
    },
  }
}

export default useGame
