import React from 'react'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import useGame from '#/hooks/use-game'
import {
  Modal,
  Text,
  Flex,
  Stack,
  Badge,
  SimpleGrid,
  Title,
} from '@mantine/core'
import Button from '#/components/ui/buttons/button'
import type { TController } from '#/types/client.types'
import Spinner from '#/components/ui/spinner'
import Header from '#/components/pages/game/header'
import { DEMO } from '#/lib/constants'
import MainBody from '#/components/pages/game/body'
import { signInAnon, getSession } from '#/lib/auth.functions'
import { gameAttemptOption, dailyGameOption } from '#/lib/options'
import Poster from '#/components/poster/poster'
import ModalHowTo from '#/components/modals/how-to'
import EndScreen from '#/components/pages/game/end-screen'
import type { TEndStatus } from '#/components/pages/game/end-screen'
import { ArrowLeft, ArrowRight } from 'lucide-react'

const USE_DEMO = false as boolean

const END_STATUSES: Array<TEndStatus> = ['completed', 'failed', 'gave_up']

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
      <Flex justify={'center'} align={'center'} h={'100%'}>
        <Spinner />
      </Flex>
    )
  },
})

function RouteComponent() {
  const controllerInformation = Route.useLoaderData()
  const router = useRouter()
  const { user } = Route.useRouteContext()
  const isAnon = user.isAnonymous ?? false
  const start = controllerInformation.start
  const end = controllerInformation.end

  const { state, data, actions, stats } = useGame(controllerInformation)
  const status = state.status
  const endStatus = END_STATUSES.includes(status as TEndStatus)
    ? (status as TEndStatus)
    : null

  return (
    <React.Suspense>
      <Modal
        opened={status === 'started'}
        closeOnClickOutside={false}
        onClose={() => {
          router.history.back()
        }}
        closeButtonProps={{
          icon: <ArrowLeft size={40} />,
        }}
        centered
      >
        <Stack align="center" w={'100%'}>
          <Title order={2}>Are you ready?</Title>

          <Flex dir="row" justify={'space-between'} align={'center'}>
            <Stack align="center">
              <Badge variant="light" color={'teal'} size="xs" radius="sm">
                Start
              </Badge>
              <div className="h-36 w-24">
                <Poster
                  id={start.id.toString()}
                  posterPath={start.img_path}
                  type="movie"
                />
              </div>
              <Text>{start.label}</Text>
            </Stack>
            <ArrowRight size={'45'} />
            <Stack align="center">
              <Badge variant="light" color={'grape'} size="xs" radius="sm">
                Finish
              </Badge>
              <div className="h-36 w-24">
                <Poster
                  id={end.id.toString()}
                  posterPath={end.img_path}
                  type="person"
                />
              </div>
              <Text size="md" style={{}}>
                {end.label}
              </Text>
            </Stack>
          </Flex>

          <SimpleGrid cols={{ base: 1, xs: 2 }} w={'100%'}>
            <Button
              data-autofocus
              className="w-full"
              onClick={() => {
                actions.startGame()
              }}
            >
              I am ready!
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                ModalHowTo()
              }}
            >
              How to play
            </Button>
          </SimpleGrid>
        </Stack>
      </Modal>
      <div className="mx-auto max-w-200 h-full flex flex-col px-2 relative overflow-hidden">
        {endStatus ? (
          <EndScreen
            status={endStatus}
            isAnon={isAnon}
            start={start}
            end={end}
            history={data.history}
            moves={stats.moves}
            picks={data.picks}
            stuckReason={state.stuckReason}
          />
        ) : (
          <>
            <div className="shrink-0 pt-1">
              <Header
                start={controllerInformation.start}
                end={controllerInformation.end}
                history={data.history}
                moves={stats.moves}
                picks={data.picks}
                giveUp={actions.gaveUpGame}
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
