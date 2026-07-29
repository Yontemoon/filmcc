import { createFileRoute, Outlet } from '@tanstack/react-router'
import { getSession, signInAnon } from '#/lib/auth.functions'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    const session = await getSession()

    if (!session) {
      const anonUserData = await signInAnon()
      return { user: anonUserData.user }
    }

    return { user: session.user }
  },
  component: () => <Outlet />,
})
