import { createFileRoute } from '@tanstack/react-router'
import { tmdbFetch } from '#/lib/fetch'

export const Route = createFileRoute(`/api/credits/person/$person_id`)({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        try {
          const movieId = params.person_id
          console.info(`Fetching movie by id=${movieId}... @`, request.url)
          const movieCredits = await tmdbFetch(
            `/person/${movieId}/movie_credits`,
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
