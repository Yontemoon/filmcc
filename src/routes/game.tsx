import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import useGame from '#/hooks/use-game'
import { Modal, Group } from '@mantine/core'
import Button from '#/components/ui/button'
import { formatTime } from '#/library/utils'
import type { TController } from '#/types/client.types'
import { fetchCreateGame } from '#/library/server'
import Spinner from '#/components/ui/spinner'
import History from '#/components/pages/game/history'
import Header from '#/components/pages/game/header'
import { DEMO } from '#/library/constants'
import MainBody from '#/components/pages/game/body'

const USE_DEMO = false as boolean

export const Route = createFileRoute('/game')({
  component: RouteComponent,
  loader: async () => {
    return fetchCreateGame()
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
  const data = Route.useLoaderData()
  const router = useRouter()

  const controllerInformation = USE_DEMO
    ? DEMO
    : ({
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
      } as { start: TController; end: TController })

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
    <Group>
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
      <div className="mx-auto max-w-275 w-full space-y-3 flex flex-col min-h-screen px-2 my-2">
        <div id="header">
          <Header
            start={controllerInformation.start}
            end={controllerInformation.end}
            history={history}
            moves={stats.count}
            time={time}
          />
        </div>
        <div className="flex-1" id="main-body">
          <MainBody
            changeController={changeController}
            history={history}
            query={query}
          />
        </div>
        <History history={history} />
      </div>
    </Group>
  )
}
