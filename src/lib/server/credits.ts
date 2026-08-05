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

const regexSelf = /\bself\b/i
const fetchPersonCredits = createServerFn({ method: 'GET' })
  .validator((data: { personId: number }) => data)
  .handler(async ({ data }) => {
    const personId = data.personId

    const { personDetails, personCredits } = await getTmdbPerson(personId)

    personCredits.cast = personCredits.cast
      .filter((curr) => curr.release_date)
      .filter((curr) => !regexSelf.test(curr.character))
      .filter((curr) => curr.character !== '')
      .sort((a, b) => {
        if (!a.release_date) return 1
        if (!b.release_date) return -1
        return b.release_date.localeCompare(a.release_date)
      })

    personCredits.crew = personCredits.crew
      .filter((curr) => curr.release_date)
      .sort((a, b) => {
        if (!a.release_date) return 1
        if (!b.release_date) return -1
        return b.release_date.localeCompare(a.release_date)
      })

    const res = {
      details: personDetails,
      credits: personCredits,
      type: 'PERSON' as const,
    }
    return res
  })

export { fetchMovieCredits, fetchPersonCredits }
