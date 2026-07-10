import React from 'react'
import { fetchMovieCredits, fetchPersonCredits } from '#/library/server'
import { useQuery } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'
import { useCounter } from '@mantine/hooks'
import useTimerRef from './use-timer-ref'

type TType = 'movie' | 'person' | undefined

type TController = {
  type: TType
  id: number
  label: string
}

type EndType = Omit<TController, 'label'>

const useGame = ({ end }: { end: EndType }) => {
  const [controller, setController] = React.useState<TController>({
    type: 'movie',
    id: 73,
    label: 'American History X',
  })

  const { startTimer, stopTimer, isTimerRunning, getElapsedMs } = useTimerRef()

  const [gameOver, setGameOver] = React.useState(false)

  const [history, setHistory] = React.useState<TController[]>([controller])
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
        message: `This is already in your history.`,
      })
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
    setHistory((prev) => [...prev, newControll])
    increment()
  }

  const useCredits = (type: TType, id: number | undefined) => {
    return useQuery({
      queryKey: [type, id],
      queryFn: async () => {
        try {
          if (!type || !id) {
            throw new Error('No Id or Type')
          }

          if (type === 'movie') {
            const res = await fetchMovieCredits({ data: { movieId: id } })
            return res
          } else {
            const res = await fetchPersonCredits({ data: { personId: id } })
            return res
          }
        } catch (error) {
          console.error(`[useCredits]: `, error)
          return null
        }
      },
    })
  }

  const query = useCredits(controller.type, controller.id)

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
