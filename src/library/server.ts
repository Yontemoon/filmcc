import { createServerFn } from '@tanstack/react-start'
import type {
  T_TMDB_MOVIE_CREDITS,
  T_TMDB_PERSON_CREDITS,
} from '#/types/tmdb.types'
import { tmdbFetch } from './fetch'

const fetchMovieCredits = createServerFn({ method: 'GET' })
  .validator((data: { movieId: number }) => data)
  .handler(async ({ data }) => {
    const movieId = data.movieId
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
    const personCredits = await tmdbFetch<T_TMDB_PERSON_CREDITS>(
      `/person/${personId}/movie_credits`,
    )

    return { ...personCredits, type: 'person' as const }
  })

export { fetchMovieCredits, fetchPersonCredits }
