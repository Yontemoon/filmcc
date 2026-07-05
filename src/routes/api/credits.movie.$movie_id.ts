import { createFileRoute } from '@tanstack/react-router'
import { tmdbFetch } from '#/library/fetch'
import type { T_TMDB_MOVIE_CREDITS } from '#/types/tmdb.types'

export const Route = createFileRoute(`/api/credits/movie/$movie_id`)({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        try {
          const movieId = params.movie_id
          console.info(
            `Fetching movie by id=${params.movie_id}... @`,
            request.url,
          )
          const movieCredits = await tmdbFetch<T_TMDB_MOVIE_CREDITS>(
            `/movie/${movieId}/credits`,
          )

          return Response.json({
            credits: movieCredits,
          })
        } catch (error) {
          console.error(error)
          return Response.json(
            { error: 'No movie credits found' },
            { status: 404 },
          )
        }
      },
    },
  },
})
