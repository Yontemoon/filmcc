import { getMoves } from '#/lib/server/moves'
import { getHeaderStats } from '#/lib/server/stats'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/stats')({
  component: RouteComponent,
  loader: async () => {
    const data = await getMoves()
    const played = await getHeaderStats()
    console.log(data)
    console.log(played)
    return data
  },
})

function RouteComponent() {
  const data = Route.useLoaderData()
  return <div>{JSON.stringify(data)}</div>
}
