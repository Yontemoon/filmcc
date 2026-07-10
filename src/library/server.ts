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

export { fetchMovieCredits, fetchPersonCredits }
