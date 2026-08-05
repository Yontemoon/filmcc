import { createServerFn } from '@tanstack/react-start'
import type {
  T_TMDB_MOVIE_DETAILS,
  T_TMDB_PERSON_DETAILS,
} from '#/types/tmdb.types'
import { getTmdbPerson, tmdbFetch } from './fetch'
import { POPULARITY_LIMIT, MOVIE_COUNT_LIMIT } from './constants'

import { getRandomNumber } from './utils'

const postCreateRandomDaily = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      return createRandomDaily()
    } catch (error) {
      console.error(error)
    }
  },
)

const createRandomDaily = async () => {
  try {
    let numberOfLoops = 1

    const [movie, people] = await Promise.all([
      getRandomValidMovie(),
      getRandomPopularPerson(),
    ])

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

    console.info('[Number of people fetches]: ', numberOfLoops)

    return { start: movie, end: randomPerson }
  } catch (error) {
    console.error(error)
  }
}

const getRandomValidMovie = async (): Promise<T_TMDB_MOVIE_DETAILS> => {
  let keepLooking = true as boolean
  while (keepLooking) {
    const randomPage = getRandomNumber(100)
    const movies = await tmdbFetch<{ results: T_TMDB_MOVIE_DETAILS[] }>(
      `/discover/movie?include_adult=false&page=${randomPage}&region=us`,
    ).then((res) => res.results)
    const randomIdx = Math.floor(Math.random() * movies.length)
    const randomMovie = movies[randomIdx]
    console.log('page', randomPage)

    const isValid = randomMovie.vote_count > MOVIE_COUNT_LIMIT

    if (isValid) {
      keepLooking = false
      return randomMovie
    }
  }
  console.error(`[getRandomValidMovie]`)
  throw new Error('Failed to find a valid movie')
}

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
    console.error('[getRandomPopularPerson]', error)
    return null
  }
}

const validateRandomPerson = async (personDetails: T_TMDB_PERSON_DETAILS) => {
  try {
    const personInfo = await getTmdbPerson(personDetails.id)
    const isActor =
      personInfo.personDetails.known_for_department === 'Acting' ? true : false

    const popularity = personInfo.personDetails.popularity

    if (popularity < POPULARITY_LIMIT) {
      return false
    }

    if (isActor) {
      const significantRoles = personInfo.personCredits.cast.filter(
        (credit) => credit.vote_count > 500,
      )

      return significantRoles.length >= 3
    } else {
      const significantJobs = personInfo.personCredits.crew.filter(
        (credit) => credit.vote_count > 500,
      )
      return significantJobs.length >= 3
    }
  } catch (error) {
    console.error(error)
    console.error('[validateRandomPerson]: Something went wrong.')
    return false
  }
}

export {
  postCreateRandomDaily,
  createRandomDaily,
  validateRandomPerson,
  getRandomNumber,
  getRandomPopularPerson,
}
