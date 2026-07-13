import { fetchMovieCredits, fetchPersonCredits } from '#/library/server'
import type { TType } from '#/types/client.types'
import { useQuery } from '@tanstack/react-query'

const useCredits = (type: TType, id: number | undefined) => {
  return useQuery({
    queryKey: [type, id],
    queryFn: async () => {
      try {
        if (!id) {
          throw new Error('No Id or Type')
        }

        if (type === 'MOVIE') {
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

export default useCredits
