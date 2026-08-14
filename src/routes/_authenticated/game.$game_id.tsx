import React from 'react'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import useGame from '#/hooks/use-game'
import { Modal, Title, Text, Flex, Stack, Badge } from '@mantine/core'
import Button from '#/components/ui/button'
import type { TController } from '#/types/client.types'
import Spinner from '#/components/ui/spinner'
import Header from '#/components/pages/game/header'
import { DEMO } from '#/lib/constants'
import MainBody from '#/components/pages/game/body'
import { signInAnon, getSession } from '#/lib/auth.functions'
import { gameAttemptOption, dailyGameOption } from '#/lib/options'
import Poster from '#/components/poster/poster'
import ModalHowTo from '#/components/modals/how-to'
import { ArrowRight } from 'lucide-react'

const USE_DEMO = false as boolean

export const Route = createFileRoute('/_authenticated/game/$game_id')({
  component: RouteComponent,
  beforeLoad: async ({ context, params }) => {
    const { game_id } = params

    const { queryClient } = context
    const game = await queryClient.ensureQueryData(
      dailyGameOption(Number(game_id)),
    )
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
  loader: async ({ context, params }) => {
    const { game_id } = params

    const { game, queryClient } = context

    await queryClient.ensureQueryData(gameAttemptOption(Number(game_id)))
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
  const { user } = Route.useRouteContext()
  const isAnon = user.isAnonymous
  const start = controllerInformation.start
  const end = controllerInformation.end

  const { state, data, actions, stats } = useGame(controllerInformation)
  const status = state.status

  return (
    <React.Suspense>
      <Modal
        opened={status === 'failed'}
        withCloseButton={false}

        onClose={() => {
          return false
        }}

        centered
        title={'You have failed!'}
      >
        <h2>You cannot make any other moves.</h2>

        <div className="w-full grid grid-cols-2 gap-2">
          {isAnon ? (
            <Link to={'/signup'} className="w-full">
              <Button>Sign up to play more</Button>
            </Link>
          ) : (
            <Link to={'/archive'} className="w-full">
              <Button>Check out Archieve</Button>
            </Link>
          )}
        </div>
      </Modal>
      <Modal
        opened={status === 'started'}
        withCloseButton={false}
        onClose={() => {
          return false
        }}
        centered
        title={'You are about to start!'}
      >
        <h2>Are you ready?</h2>

        <Flex
          dir="row"
          justify={'space-between'}
          p={'lg'}
          m={'lg'}
          align={'center'}
        >
          <Stack align="center">
            <Badge variant="light" color={'teal'} size="xs" radius="sm">
              Start
            </Badge>
            <div className="h-36 w-24">
              <Poster id={start.id.toString()} posterPath={start.img_path} />
            </div>
            <Text>{start.label}</Text>
          </Stack>
          <div className="flex items-center">
            <ArrowRight size={'45'} />
          </div>
          <Stack align="center">
            <Badge variant="light" color={'grape'} size="xs" radius="sm">
              Finish
            </Badge>
            <div className="h-36 w-24">
              <Poster id={end.id.toString()} posterPath={end.img_path} />
            </div>
            <Text>{end.label}</Text>
          </Stack>
        </Flex>

        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Button
            className="w-full"
            onClick={() => {
              actions.startGame()
            }}
          >
            I am ready!
          </Button>
          <Button
            variant="transparent"
            onClick={() => {
              ModalHowTo()
            }}
          >
            How to play
          </Button>

          <Button variant="filled" color="red">
            <Link to={'/'}>Go back</Link>
          </Button>
        </div>
      </Modal>
      <div className="mx-auto max-w-200 h-full flex flex-col px-2 relative overflow-hidden">
        {state.status === 'completed' ? (
          <CompletedGame />
        ) : (
          <>
            <div className="shrink-0 pt-1">
              <Header
                start={controllerInformation.start}
                end={controllerInformation.end}
                history={data.history}
                moves={stats.moves}
                picks={data.picks}
              />
            </div>
            <div
              className="flex-1 min-h-0 overflow-y-auto pb-4 scrollbar-none"
              id="main-body"
            >
              <MainBody
                changeController={actions.changeController}
                query={data.credits}
                bodyData={data.bodyData}
                end={end}
              />
            </div>
          </>
        )}
      </div>
    </React.Suspense>
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
