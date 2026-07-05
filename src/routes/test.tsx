import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { tmdbFetch } from '#/library/fetch'
import type {
  T_TMDB_MOVIE_CREDITS,
  T_TMDB_PERSON_CREDITS,
} from '#/types/tmdb.types'

type TType = 'movie' | 'person' | undefined

const fetchMovieCredits = createServerFn({ method: 'GET' })
  .validator((data: { movieId: number }) => data)
  .handler(async ({ data }) => {
    const movieId = data.movieId
    console.info(`Fetching movie by id=${movieId}... `)
    const movieCredits = await tmdbFetch<T_TMDB_MOVIE_CREDITS>(
      `/movie/${movieId}/credits`,
    )
    const movie = 'movie' as const
    const reformatted = { ...movieCredits, type: 'movie' as typeof movie }

    return reformatted
  })

const fetchPersonCredits = createServerFn({ method: 'GET' })
  .validator((data: { personId: number }) => data)
  .handler(async ({ data }) => {
    const personId = data.personId
    console.info(`Fetching person by id=${personId}... @`)
    const personCredits = await tmdbFetch<T_TMDB_PERSON_CREDITS>(
      `/person/${personId}/movie_credits`,
    )

    return { ...personCredits, type: 'person' as const }
  })

export const Route = createFileRoute('/test')({
  component: RouteComponent,
})

const useCredits = (type: TType, id: number | undefined) => {
  return useQuery({
    // enabled: false,
    queryKey: [type, id],
    queryFn: async () => {
      try {
        if (!type || !id) {
          throw new Error('No Id or Type')
        }
        console.log(type, id)
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

function RouteComponent() {
  // const data = Route.useLoaderData()
  const [controller, setController] = useState<{ type: TType; id: number }>({
    type: 'movie',
    id: 73,
  })

  const {
    data: current,
    isLoading,
    error,
  } = useCredits(controller.type, controller.id)
  console.log(current)

  return (
    <div>
      <div>{JSON.stringify(controller)}</div>
      {isLoading && <div>Loading...</div>}
      {error && <div>{error.message}</div>}
      {/* IF A MOVIE PAGE IS SHOWN */}
      {current?.type === 'movie' && (
        <div>
          <h1>{current.id}</h1>
          <div className=" mx-auto px-10 grid md:grid-cols-2 w-full gap-5">
            <div>
              {current.cast.map((credit) => {
                return (
                  <div
                    className="hover:underline hover:cursor-pointer"
                    key={credit.credit_id}
                    onClick={() => {
                      console.log(`[CLICKED CAST MEMBER]: ${credit.id}`)
                      setController({
                        id: credit.id,
                        type: 'person',
                      })
                    }}
                  >
                    {credit.name} -- {credit.character}
                  </div>
                )
              })}
            </div>
            <div>
              {current.crew.map((crew) => {
                return (
                  <div
                    className="hover:underline hover:cursor-pointer"
                    key={crew.credit_id}
                    onClick={() => {
                      console.log(`[CLICKED CREW MEMBER]: ${crew.id}`)
                      setController({
                        id: crew.id,
                        type: 'person',
                      })
                    }}
                  >
                    {crew.name} -- {crew.known_for_department} --{' '}
                    {crew.department}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* IF A PERSON (ACTOR/PERSON) IS SHOWN */}
      {current?.type === 'person' && (
        <div>
          <h1>{current.id}</h1>
          <div className=" mx-auto px-10 grid md:grid-cols-2 w-full gap-5">
            <div>
              {current.cast.map((credit) => {
                return (
                  <div
                    className="hover:underline hover:cursor-pointer"
                    key={credit.credit_id}
                    onClick={() => {
                      console.log(`[CLICKED CAST MEMBER]: ${credit.id}`)
                      setController({
                        id: credit.id,
                        type: 'movie',
                      })
                    }}
                  >
                    {credit.title} -- {credit.character}
                  </div>
                )
              })}
            </div>
            <div>
              {current.crew.map((crew, idx) => {
                return (
                  <div
                    className="hover:underline hover:cursor-pointer"
                    key={idx}
                    onClick={() => {
                      console.log(`[CLICKED CREW MEMBER]: ${crew.id}`)
                      setController({
                        id: crew.id,
                        type: 'movie',
                      })
                    }}
                  >
                    {crew.title} -- {crew.job} -- {crew.department}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
