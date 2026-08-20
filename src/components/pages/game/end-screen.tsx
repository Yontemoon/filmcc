import { Badge, Divider, Flex, Group, Stack, Text, Title } from '@mantine/core'
import Paper from '#/components/ui/paper/paper'
import { ButtonLink } from '#/components/ui/buttons'
import { GameHistory } from '#/components/modals/game-history'
import type { TController } from '#/types/client.types'
import type { TReturnUseGame } from '#/hooks/use-game'
import type { TReturnUsePicks } from '#/hooks/use-picks'

type TEndStatus = 'completed' | 'failed' | 'gave_up'

type PropTypes = {
  status: TEndStatus
  isAnon: boolean
  start: TController
  end: TController
  history: TReturnUseGame['data']['history']
  moves: number
  picks: TReturnUsePicks
  stuckReason: TReturnUseGame['state']['stuckReason']
}

const STUCK_BLURB = {
  no_picks_left: 'You spent every cast and crew pick you had.',
  board_exhausted: 'Nothing left on this board can be picked.',
} as const

const META: Record<
  TEndStatus,
  { kicker: string; color: string; title: string; pathLabel: string }
> = {
  completed: {
    kicker: 'Solved',
    color: 'teal',
    title: 'You made it!',
    pathLabel: 'Your path',
  },
  failed: {
    kicker: 'Stuck',
    color: 'red',
    title: 'You got stuck',
    pathLabel: 'How far you got',
  },
  gave_up: {
    kicker: 'Gave up',
    color: 'gray',
    title: 'You gave up',
    pathLabel: 'How far you got',
  },
}

const EndScreen = ({
  status,
  isAnon,
  start,
  end,
  history,
  moves,
  picks,
  stuckReason,
}: PropTypes) => {
  const meta = META[status]
  const { castScore, crewScore } = picks.scores
  const solved = status === 'completed'

  const blurb = solved
    ? `${start.label} to ${end.label}`
    : status === 'gave_up'
      ? `You called it before reaching ${end.label}.`
      : stuckReason
        ? STUCK_BLURB[stuckReason]
        : `There was no way left to reach ${end.label}.`

  return (
    <Flex
      w={'100%'}
      direction={'column'}
      h={'100%'}
      gap={'sm'}
      py={'md'}
      style={{ minHeight: 0 }}
    >
      <Paper withBorder radius="sm" p="sm" className="shrink-0">
        <Stack gap={6} align="center">
          <Badge variant="light" color={meta.color} size="sm" radius="sm">
            {meta.kicker}
          </Badge>
          <Title order={2} ta="center">
            {meta.title}
          </Title>
          <Text size="sm" c="dimmed" ta="center">
            {blurb}
          </Text>
          <Group gap="xs" justify="center">
            <Badge variant="light" color="gray" size="lg" radius="sm">
              {moves} moves
            </Badge>
            <Badge variant="light" color="blue" size="lg" radius="sm">
              {castScore.curr}/{castScore.max} cast
            </Badge>
            <Badge variant="light" color="orange" size="lg" radius="sm">
              {crewScore.curr}/{crewScore.max} crew
            </Badge>
          </Group>
        </Stack>
      </Paper>

      <Divider
        label={meta.pathLabel}
        labelPosition="center"
        className="shrink-0"
      />

      {/* The chain scrolls here, so it opts out of its own centering. */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none">
        <GameHistory history={history} centered={false} />
      </div>

      <Stack gap={'xs'} align="center" className="shrink-0">
        <Text size="sm" c="dimmed" ta="center">
          {isAnon
            ? 'Looks like you played your one game as a guest. Sign up to keep playing!'
            : solved
              ? 'Come back tomorrow for the next one.'
              : 'Try another one from the archive.'}
        </Text>
        {isAnon ? (
          <ButtonLink LinkProps={{ to: '/signup' }}>
            Sign up to play more
          </ButtonLink>
        ) : (
          <ButtonLink LinkProps={{ to: '/archive' }}>
            Check out the archive
          </ButtonLink>
        )}
      </Stack>
    </Flex>
  )
}

export default EndScreen
export type { TEndStatus }
