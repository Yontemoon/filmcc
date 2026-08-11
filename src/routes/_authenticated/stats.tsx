import { getMoves } from '#/lib/server/moves'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/stats')({
  component: RouteComponent,
  loader: async () => {
    const data = await getMoves()
    return data
  },
})

function RouteComponent() {
  const data = Route.useLoaderData()
  return <div>{JSON.stringify(data)}</div>
}
