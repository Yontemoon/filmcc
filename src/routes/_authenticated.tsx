import { createFileRoute, Outlet } from '@tanstack/react-router'
import { getSession, signInAnon } from '#/lib/auth.functions'
import { AppShell } from '@mantine/core'
import GameHeader from '#/components/game-header'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    const session = await getSession()

    if (!session) {
      const anonUserData = await signInAnon()
      return { user: anonUserData.user }
    }

    return { user: session.user }
  },
  component: () => (
    <AppShell header={{ height: 60 }} zIndex={1000}>
      <AppShell.Header>
        <GameHeader />
      </AppShell.Header>
      {/* h-dvh + overflow-y-auto: Main is the only scroll container. Pages that
          fit (the game) can use h-full and manage their own inner scrolling,
          pages that don't (the archive) just scroll here. */}
      <AppShell.Main className="h-dvh overflow-y-auto">
        <Outlet />
      </AppShell.Main>
    </AppShell>
  ),
})
