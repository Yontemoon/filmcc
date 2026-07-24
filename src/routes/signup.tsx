import { SignUpComp } from '#/components/pages/auth'
import { getSession } from '#/lib/auth.functions'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/signup')({
  beforeLoad: async ({ location }) => {
    const session = await getSession()

    if (session) {
      throw redirect({
        to: '/',
        search: { redirect: location.href },
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <SignUpComp />
}
