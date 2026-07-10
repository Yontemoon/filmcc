import { createServerFn } from '@tanstack/react-start'
import type {
  T_TMDB_MOVIE_CREDITS,
  T_TMDB_MOVIE_DETAILS,
  T_TMDB_PERSON_CREDITS,
  T_TMDB_PERSON_DETAILS,
} from '#/types/tmdb.types'
import { tmdbFetch } from './fetch'

const fetchMovieCredits = createServerFn({ method: 'GET' })
  .validator((data: { movieId: number }) => data)
  .handler(async ({ data }) => {
    const movieId = data.movieId

    const [movieDetails, movieCredits] = await Promise.all([
      tmdbFetch<T_TMDB_MOVIE_DETAILS>(`/movie/${movieId}?language=en-US`),
      tmdbFetch<T_TMDB_MOVIE_CREDITS>(`/movie/${movieId}/credits`),
    ])

    const movie = 'movie' as const
    const res = {
      details: movieDetails,
      credits: movieCredits,
      type: 'movie' as typeof movie,
    }

    return res
  })

const fetchPersonCredits = createServerFn({ method: 'GET' })
  .validator((data: { personId: number }) => data)
  .handler(async ({ data }) => {
    const personId = data.personId

    const [personDetails, personCredits] = await Promise.all([
      tmdbFetch<T_TMDB_PERSON_DETAILS>(`/person/${personId}?language=en-US`),
      tmdbFetch<T_TMDB_PERSON_CREDITS>(`/person/${personId}/movie_credits`),
    ])

    const res = {
      details: personDetails,
      credits: personCredits,
      type: 'person' as const,
    }
    return res
  })

const fetchCreateGame = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const randomOrder = Math.floor(Math.random() * 2)
    const [movies, people] = await Promise.all([
      tmdbFetch<{ results: T_TMDB_MOVIE_DETAILS[] }>(
        `/discover/movie?include_adult?sort_by=popularity.desc`,
      ).then((res) => res.results),
      tmdbFetch<{ results: T_TMDB_PERSON_DETAILS[] }>(`/person/popular`).then(
        (res) => res.results,
      ),
    ])

    const randomMovieNum = Math.floor(Math.random() * movies.length)
    const randomPersonNum = Math.floor(Math.random() * people.length)
    const randomMovie = movies[randomMovieNum]
    const randomPerson = people[randomPersonNum]

    return randomOrder === 0
      ? { start: randomMovie, end: randomPerson }
      : { start: randomPerson, end: randomMovie }
  } catch (error) {
    console.error(error)
  }
})

export { fetchMovieCredits, fetchPersonCredits, fetchCreateGame }
