import { createFileRoute } from '@tanstack/react-router'
import { getDailyGameId } from '#/lib/server/game'

export const Route = createFileRoute('/_authenticated/game/$game_id')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const { game_id } = params
    const data = { dailyGameId: Number(game_id) }

    const dataRes = await getDailyGameId({ data })

    return dataRes
  },
})

function RouteComponent() {
  const gameInfo = Route.useLoaderData()

  return <div>{JSON.stringify(gameInfo)}</div>
}
