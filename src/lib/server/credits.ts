import { createServerFn } from '@tanstack/react-start'
import { getTmdbMovie, getTmdbPerson } from '../fetch'

const fetchMovieCredits = createServerFn({ method: 'GET' })
  .validator((data: { movieId: number }) => data)
  .handler(async ({ data }) => {
    const movieId = data.movieId

    const { movieDetails, movieCredits } = await getTmdbMovie(movieId)

    const movie = 'MOVIE' as const
    const res = {
      details: movieDetails,
      credits: movieCredits,
      type: 'MOVIE' as typeof movie,
    }

    return res
  })

const fetchPersonCredits = createServerFn({ method: 'GET' })
  .validator((data: { personId: number }) => data)
  .handler(async ({ data }) => {
    const personId = data.personId

    const { personDetails, personCredits } = await getTmdbPerson(personId)

    const res = {
      details: personDetails,
      credits: personCredits,
      type: 'PERSON' as const,
    }
    return res
  })

export { fetchMovieCredits, fetchPersonCredits }
