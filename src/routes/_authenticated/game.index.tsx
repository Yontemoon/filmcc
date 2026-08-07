import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/game/')({
  beforeLoad: async () => {
    const one = 1

    throw redirect({
      to: '/game/$game_id',
      params: {
        game_id: one.toString(),
      },
    })
  },
})
