import { createFileRoute } from '@tanstack/react-router'
import { tmdbFetch } from '#/lib/fetch'
import { getRandomPopularPerson, validateRandomPerson } from '#/lib/server'
import type {
  T_TMDB_MOVIE_DETAILS,
  T_TMDB_PERSON_DETAILS,
} from '#/types/tmdb.types'

let memory = null as {
  start: T_TMDB_MOVIE_DETAILS
  end: T_TMDB_PERSON_DETAILS
} | null

export const Route = createFileRoute(`/api/game`)({
  server: {
    handlers: {
      POST: async () => {
        try {
          let numberOfLoops = 1

          if (!memory) {
            const [movies, people] = await Promise.all([
              tmdbFetch<{ results: T_TMDB_MOVIE_DETAILS[] }>(
                `/discover/movie?include_adult?sort_by=popularity.desc`,
              ).then((res) => res.results),
              getRandomPopularPerson(),
            ])
            const randomMovieNum = Math.floor(Math.random() * movies.length)

            let randomPerson = people
            let continueSearchingPerson = true

            if (randomPerson) {
              const isValidPopularPerson =
                await validateRandomPerson(randomPerson)

              if (isValidPopularPerson) {
                continueSearchingPerson = false
              }
            }

            while (continueSearchingPerson || !randomPerson) {
              numberOfLoops++
              const randomTmdbPerson = await getRandomPopularPerson()

              if (!randomTmdbPerson) {
                continue
              }
              const isValid = await validateRandomPerson(randomTmdbPerson)

              if (isValid) {
                continueSearchingPerson = false
                randomPerson = randomTmdbPerson
              }
            }

            const randomMovie = movies[randomMovieNum]
            console.info('[Number of people fetches]: ', numberOfLoops)
            memory = { start: randomMovie, end: randomPerson }
            return Response.json({ start: randomMovie, end: randomPerson })
          } else {
            return Response.json(memory)
          }
        } catch (error) {
          console.error(error)
          return Response.json(
            { error: 'Something went wrong' },
            { status: 404 },
          )
        }
      },
    },
  },
})
