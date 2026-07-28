import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import useGame from '#/hooks/use-game'
import { AppShell, Group, Modal, ScrollArea } from '@mantine/core'
import Button from '#/components/ui/button'
import { formatTime } from '#/lib/utils'
import type { TController } from '#/types/client.types'
import { fetchCreateGame } from '#/lib/server'
import Spinner from '#/components/ui/spinner'
import History from '#/components/pages/game/history'
import Header from '#/components/pages/game/header'
import { DEMO } from '#/lib/constants'
import MainBody from '#/components/pages/game/body'

import { signInAnon, getSession } from '#/lib/auth.functions'
import GameHeader from '#/components/game-header'

const USE_DEMO = true as boolean

const HISTORY_HEIGHT = '5.5rem'

export const Route = createFileRoute('/game')({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await getSession()
    if (!session) {
      const authSession = await signInAnon()
      console.log('[Created anon]', authSession)
      return authSession
    }
    return session
  },
  loader: async () => {
    if (USE_DEMO) {
      return DEMO
    } else {
      const data = await fetchCreateGame()
      const controllerInformation = {
        start: {
          id: data?.start.id,
          label: data?.start.title,
          type: 'MOVIE',
          img_path: data?.start.poster_path,
        },
        end: {
          id: data?.end.id,
          label: data?.end.name,
          type: 'PERSON',
          img_path: data?.end.profile_path,
        },
      } as { start: TController; end: TController }
      return controllerInformation
    }
  },
  pendingComponent: () => {
    return (
      <div className="flex justify-center">
        <Spinner />
      </div>
    )
  },
})

function RouteComponent() {
  const controllerInformation = Route.useLoaderData()
  const router = useRouter()

  const {
    startGame,
    changeController,
    stayInGame,
    query,
    history,
    gameState,
    stats,
    time,
  } = useGame(controllerInformation)

  return (
    <AppShell header={{ height: 60 }}>
      <Modal
        opened={gameState === 'FAILED'}
        onClose={() => {
          console.log('passing here')
        }}
        centered
        title={'You have failed!'}
      >
        <h2>You cannot make any other moves.</h2>

        <div className="w-full grid grid-cols-2 gap-2">
          <Button
            className="w-full"
            onClick={() => {
              router.invalidate()
            }}
          >
            Redo
          </Button>
          <Link to={'/'} className="w-full">
            <Button>Go home</Button>
          </Link>
        </div>
      </Modal>
      <Modal
        opened={gameState === 'START'}
        onClose={() => {
          console.log('passing here')
        }}
        centered
        title={'You are about to start!'}
      >
        <h2>Are you ready?</h2>
        <p>
          You are on {controllerInformation.start.label} and have to get to{' '}
          {controllerInformation.end.label}
        </p>

        <div className="w-full grid grid-cols-2 gap-2">
          <Button
            className="w-full"
            onClick={() => {
              startGame()
            }}
          >
            I am ready!
          </Button>
          <Link to={'/'} className="w-full">
            <Button>Go back</Button>
          </Link>
        </div>
      </Modal>
      <Modal
        opened={gameState === 'END'}
        onClose={() => {
          stayInGame()
        }}
        centered
        title={'You finished!'}
      >
        <h2>Stats</h2>
        <p>count: {stats.count}</p>
        <p>time: {formatTime(stats.time)}</p>
        <div className="w-full grid grid-cols-2 gap-2">
          <Button
            className="w-full"
            onClick={() => {
              stayInGame()
            }}
          >
            Stay & Explore
          </Button>
          <Link to={'/'} className="w-full">
            <Button>Go back</Button>
          </Link>
        </div>
      </Modal>
      <AppShell.Header>
        <GameHeader />
      </AppShell.Header>
      <div className="mx-auto max-w-400 w-full flex flex-col h-screen px-2 relative pt-15">
        {/* Fixed header: journey context, always visible */}
        <div className="shrink-0 pt-1 px-5 ">
          <Header
            start={controllerInformation.start}
            end={controllerInformation.end}
            history={history}
            moves={stats.count}
            time={time}
          />
        </div>

        <ScrollArea className="flex-1 min-h-0 px-5">
          <div className="px-2 pb-4" id="main-body">
            <MainBody
              changeController={changeController}
              history={history}
              query={query}
            />
          </div>
        </ScrollArea>

        <div className="shrink-0" style={{ height: HISTORY_HEIGHT }}>
          <History history={history} />
        </div>
      </div>
    </AppShell>
  )
}
