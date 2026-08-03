import React from 'react'
import {
  createFileRoute,
  Link,
  redirect,
  useRouter,
} from '@tanstack/react-router'
import useGame from '#/hooks/use-game'
import { AppShell, Modal, ScrollArea, Title, Text, Flex } from '@mantine/core'
import Button from '#/components/ui/button'
import type { TController } from '#/types/client.types'
import Spinner from '#/components/ui/spinner'
import History from '#/components/pages/game/history'
import Header from '#/components/pages/game/header'
import { DEMO } from '#/lib/constants'
import MainBody from '#/components/pages/game/body'
import { signInAnon, getSession } from '#/lib/auth.functions'
import GameHeader from '#/components/game-header'
import { gameAttemptOption, dailyGameOption } from '#/lib/options'

const USE_DEMO = false as boolean

const HISTORY_HEIGHT = '5.5rem'

export const Route = createFileRoute('/_authenticated/game/')({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const { queryClient } = context
    const game = await queryClient.ensureQueryData(dailyGameOption(1))
    const session = await getSession()

    if (!game) {
      redirect({
        to: '/',
      })
    }

    if (!session) {
      const authSession = await signInAnon()
      return { session: authSession, game: game ?? null }
    }
    return { session: session.user, game: game ?? null }
  },
  loader: async ({ context }) => {
    const { game, queryClient } = context

    await queryClient.ensureQueryData(gameAttemptOption(1))
    if (USE_DEMO) {
      return { ...DEMO }
    } else {
      const controllerInformation = {
        dailyGameId: game?.id,
        start: {
          id: game?.start.id,
          label: game?.start.label,
          type: game?.start.type,
          img_path: game?.start.img_path,
        },
        end: {
          id: game?.end.id,
          label: game?.end.label,
          type: game?.end.type,
          img_path: game?.end.img_path,
        },
      } as { dailyGameId: number; start: TController; end: TController }
      return { ...controllerInformation }
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
    query,
    gameState,
    stats,
    time,
    gameMoves,
  } = useGame(controllerInformation)

  return (
    <AppShell header={{ height: 60 }}>
      <React.Suspense>
        <Modal
          opened={gameState === 'failed'}
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
          opened={gameState === 'started'}
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
              onClick={async () => {
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

        <AppShell.Header>
          <GameHeader />
        </AppShell.Header>
        <div className="mx-auto max-w-400 w-full flex flex-col h-screen px-2 relative pt-15">
          {gameState === 'completed' ? (
            <CompletedGame />
          ) : (
            <>
              {/* Fixed header: journey context, always visible */}

              <div className="shrink-0 pt-1 px-5 ">
                <Header
                  start={controllerInformation.start}
                  end={controllerInformation.end}
                  history={gameMoves}
                  moves={stats.count}
                  time={time}
                />
              </div>

              <ScrollArea className="flex-1 min-h-0 px-5 ">
                <div className="px-2 pb-4 max-w-[800px] mx-auto" id="main-body">
                  <MainBody
                    changeController={changeController}
                    history={gameMoves}
                    query={query}
                  />
                </div>
              </ScrollArea>

              <div className="shrink-0" style={{ height: HISTORY_HEIGHT }}>
                <History gameMoves={gameMoves} />
              </div>
            </>
          )}
        </div>
      </React.Suspense>
    </AppShell>
  )
}

const CompletedGame = () => {
  const context = Route.useRouteContext()
  const { session } = context
  const guest = session.isAnonymous
  return (
    guest && (
      <Flex
        w={'100%'}
        direction={'column'}
        m={'sm'}
        align={'center'}
        justify={'center'}
        h={'100%'}
        gap={'md'}
      >
        <Title>You have completed the game</Title>
        <Text size="lg">Display stats</Text>
        <Text size="md">Looks like you played your one game as a guest</Text>
        <Text>Sign up to keep playing!</Text>
        <Link to={'/signup'}>
          <Button>Sign Up</Button>
        </Link>
      </Flex>
    )
  )
}
