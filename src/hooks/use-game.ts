import React from 'react'
import { notifications } from '@mantine/notifications'
import { useCounter, useWindowScroll } from '@mantine/hooks'
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

type TGameState = 'START' | 'IN_PROGRESS' | 'END' | 'STAYED' | 'FAILED'

const useGame = ({ start, end }: PropTypes) => {
  const [controller, setController] = React.useState<TController>(start)
  const [scroll, scrollTo] = useWindowScroll()

  const { startTimer, stopTimer, isTimerRunning, getElapsedMs } = useTimerRef()
  const [gameState, setGameState] = React.useState<TGameState>('START')
  const [history, setHistory] = React.useState<
    Array<TMovieController | TPersonController>
  >([])
  const [count, { increment }] = useCounter(0, { min: 0 })
  const [stats, setStats] = React.useState({
    count: count,
    time: 0,
  })

  React.useEffect(() => {
    if (gameState === 'IN_PROGRESS') {
      startTimer()
    }
  }, [gameState])

  React.useEffect(() => {
    if (gameState === 'IN_PROGRESS') {
      setStats((prev) => {
        return { ...prev, count: count }
      })
    }
  }, [count])

  const checkController = (newController: TController) => {
    const isPresent = history.findIndex((curr) => {
      if (curr.id === newController.id && curr.type === newController.type) {
        return curr
      }
    })

    return isPresent >= 0 ? true : false
  }

  const startGame = () => {
    if (gameState === 'START') {
      setGameState('IN_PROGRESS')
    }
  }
  const stayInGame = () => {
    if (gameState === 'END') {
      setGameState('STAYED')
    }
  }
  const gameOver = () => {
    if (gameState === 'IN_PROGRESS') {
      setGameState('END')
    }
  }

  const query = useCredits(controller.type, controller.id)

  React.useEffect(() => {
    if (gameState === 'IN_PROGRESS' || gameState === 'START') {
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

      if (query.data?.credits) {
        // TODO do the same with Movie Section
        if (data.type === 'PERSON') {
          const historyPersonsIds = history
            .filter((control) => control.type === 'MOVIE')
            .map((control) => control.id)

          let NumberOfCastTaken = 0
          const castLength = query.data.credits.cast.length

          for (const movie of query.data.credits.cast) {
            const isTaken = historyPersonsIds.findIndex((id) => id === movie.id)
            if (isTaken >= 0) {
              NumberOfCastTaken++
            }
          }

          if (castLength !== 0 && NumberOfCastTaken === castLength) {
            setGameState('FAILED')
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
            setGameState('FAILED')
          }
        } else {
          const historyPersonsIds = history
            .filter((control) => control.type === 'PERSON')
            .map((control) => control.id)

          let NumberOfCastTaken = 0
          const castLength = query.data.credits.cast.length

          for (const movie of query.data.credits.cast) {
            const isTaken = historyPersonsIds.findIndex((id) => id === movie.id)
            if (isTaken >= 0) {
              NumberOfCastTaken++
            }
          }

          if (castLength !== 0 && NumberOfCastTaken === castLength) {
            setGameState('FAILED')
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
            setGameState('FAILED')
          }
        }
      }
    }
  }, [query.data])

  const changeController = (newControll: TController): void => {
    if (gameState === 'IN_PROGRESS') {
      const isPresent = checkController(newControll)

      if (isPresent) {
        notifications.show({
          title: 'Already chosen!',
          message: `${newControll.label} is already in your history.`,
        })
        return
      }

      if (newControll.id === end.id && newControll.type === end.type) {
        setGameState('END')

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
    stayInGame,
    gameState,
  }
}

export default useGame
