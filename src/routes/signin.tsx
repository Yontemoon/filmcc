import { createFileRoute, redirect } from '@tanstack/react-router'
import { SigninComp } from '#/components/pages/auth'
import { getSession } from '#/lib/auth.functions'

export const Route = createFileRoute('/signin')({
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
  return <SigninComp />
}
