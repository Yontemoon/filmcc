import { fetchMovieCredits, fetchPersonCredits } from '#/library/server'
import { useQuery } from '@tanstack/react-query'
import React from 'react'

type TType = 'movie' | 'person' | undefined

type TController = {
  type: TType
  id: number
}

const useGame = () => {
  const [controller, setController] = React.useState<TController>({
    type: 'movie',
    id: 73,
  })
  const [history, setHistory] = React.useState<{ type: TType; id: number }[]>([
    controller,
  ])

  const checkController = (newController: TController) => {
    const isPresent = history.findIndex((curr) => {
      if (curr.id === newController.id && curr.type === newController.type) {
        return curr
      }
    })

    return isPresent >= 0 ? true : false
  }

  const changeController = (newControll: TController) => {
    const isPresent = checkController(newControll)

    if (isPresent) {
      return {
        changed: false,
        message: 'duplicate controller found',
      }
    }

    setController(newControll)
    setHistory((prev) => [...prev, newControll])
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
        }
      },
    })
  }

  const query = useCredits(controller.type, controller.id)

  return { history, query, changeController }
}

export default useGame
