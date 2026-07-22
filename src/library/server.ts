import { createServerFn } from '@tanstack/react-start'
import type {
  T_TMDB_EXTERNAL_IDS,
  T_TMDB_MOVIE_DETAILS,
  T_TMDB_PERSON_DETAILS,
} from '#/types/tmdb.types'
import { getTmdbMovie, getTmdbPerson, omdbFetch, tmdbFetch } from './fetch'
import { POPULARITY_LIMIT } from './constants'
import type { T_OMDB_PERSON_DETAILS } from '#/types/omdb.types'
import { getRandomNumber } from './utils'

let memory = null as {
  start: T_TMDB_MOVIE_DETAILS
  end: T_TMDB_PERSON_DETAILS
} | null

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

const fetchCreateGame = createServerFn({ method: 'GET' }).handler(async () => {
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
        const isValidPopularPerson = await validateRandomPerson(randomPerson)

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
      return { start: randomMovie, end: randomPerson }
    } else {
      return memory
    }
  } catch (error) {
    console.error(error)
  }
})

const getRandomPopularPerson = async () => {
  try {
    const randomPage = getRandomNumber(100)

    const people = await tmdbFetch<{ results: T_TMDB_PERSON_DETAILS[] }>(
      `/person/popular?language=en-US&page=${randomPage}`,
    )
    const randomIndx = getRandomNumber(people.results.length)

    const tmdbPerson = people.results[randomIndx]

    return tmdbPerson
  } catch (error) {
    console.error(error)
    return null
  }
}

const validateRandomPerson = async (personDetails: T_TMDB_PERSON_DETAILS) => {
  try {
    const externalPersonData = await tmdbFetch<T_TMDB_EXTERNAL_IDS>(
      `/person/${personDetails.id}/external_ids`,
    )

    const imdbId = externalPersonData.imdb_id

    if (imdbId) {
      const omdbData = await omdbFetch<T_OMDB_PERSON_DETAILS>(
        `/person/${imdbId}`,
      )
      return omdbData.popularity > POPULARITY_LIMIT ? true : false
    }
    return false
  } catch (error) {
    console.error('[validateRandomPerson]: Something went wrong.')
    return false
  }
}

export { fetchMovieCredits, fetchPersonCredits, fetchCreateGame }
