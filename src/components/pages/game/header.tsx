import type { TController } from '#/types/client.types'
import { Group, Stack, Text, Badge, ThemeIcon, Divider } from '@mantine/core'
import PosterImage from '#/components/poster/poster'
import ProfileImage from '#/components/profile-image'
import Timer from '#/components/timer'
import Paper from '#/components/ui/paper/paper'
import { ArrowRight } from 'lucide-react'
import classes from './game.module.css'
import type { ReturnGetUserGameId } from '#/lib/server/game'

// type HistoryItem = TMovieController | TPersonController
type HistoryItem = ReturnGetUserGameId['gameMovesLog'][0]

type PropTypes = {
  start: TController
  end: TController
  // history: HistoryItem[]
  history: ReturnGetUserGameId['gameMovesLog']
  moves: number
  time: {
    isTimerRunning: boolean
    getElapsedMs: () => number
    finalTime: number | null
  }
}

const Endpoint = ({
  kicker,
  color,
  controller,
  align,
}: {
  kicker: string
  color: string
  controller: TController
  align: 'start' | 'end'
}) => {
  const reversed = align === 'end'
  return (
    <Group
      gap="sm"
      wrap="nowrap"
      style={{
        flexDirection: reversed ? 'row-reverse' : 'row',
        minWidth: 0,
      }}
    >
      {controller.type === 'MOVIE' ? (
        <div className="h-12 w-9">
          <PosterImage
            posterPath={controller.img_path}
            id={controller.id.toString()}
            altText={`${controller.img_path}-${controller.id}`}
          />
        </div>
      ) : (
        <div className="h-10 w-10">
          <ProfileImage
            profilePath={controller.img_path}
            creditId={controller.id}
          />
        </div>
      )}

      <div style={{ minWidth: 0, textAlign: reversed ? 'right' : 'left' }}>
        <Badge variant="light" color={color} size="xs" radius="sm">
          {kicker}
        </Badge>
        <Text fw={700} size="sm" truncate title={controller.label}>
          {controller.label}
        </Text>
      </div>
    </Group>
  )
}

const CurrentImage = ({ current }: { current: HistoryItem }) => {
  if (current.entityType === 'MOVIE') {
    return (
      <div className="h-10 w-7">
        <PosterImage
          posterPath={current.entity?.imgPath}
          id={current.entityId.toString()}
          altText={`${current.entity?.imgPath}-${current.entityId}`}
        />
      </div>
    )
  }
  return (
    <div className="h-9 w-9">
      <ProfileImage
        profilePath={current.entity?.imgPath}
        creditId={current.entityId}
      />
    </div>
  )
}

const Header = ({ start, end, history, moves, time }: PropTypes) => {
  const current = history.length > 0 ? history[history.length - 1] : null

  return (
    <div className={classes.headerSticky} id="header">
      <Paper withBorder radius="lg" p="sm" mb="xs" shadow="xs">
        {/* Journey: start -> target */}
        <Group justify="space-between" wrap="nowrap" gap="sm">
          <Endpoint
            kicker="Start"
            color="teal"
            controller={start}
            align="start"
          />

          <Stack align="center" gap={2} px="xs">
            <ThemeIcon variant="subtle" color="gray" size="md">
              <ArrowRight />
            </ThemeIcon>
            <Text size="xs" c="dimmed" fw={600} tt="uppercase">
              Goal
            </Text>
          </Stack>

          <Endpoint
            kicker="Target"
            color="grape"
            controller={end}
            align="end"
          />
        </Group>

        <Divider my={6} />

        {/* Now + stats */}
        <Group justify="space-between" wrap="wrap" gap="sm">
          <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
            <Text size="xs" c="dimmed" fw={600} tt="uppercase">
              Now
            </Text>
            {current ? (
              <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
                <CurrentImage current={current} />
                <Text fw={700} size="sm" truncate title={current.entity?.label}>
                  {current.entity?.label}
                </Text>
              </Group>
            ) : (
              <Text size="sm" c="dimmed" truncate>
                {start.label}
              </Text>
            )}
          </Group>

          <Group gap="xs" wrap="nowrap">
            <Badge
              className="w-42"
              variant="light"
              color="cyan"
              size="lg"
              radius="sm"
              leftSection="Time"
            >
              <Timer
                label=""
                isRunning={time.isTimerRunning}
                getElapsedMs={time.getElapsedMs}
                finalElapsedMs={time.finalTime}
              />
            </Badge>
            <Badge variant="light" color="gray" size="lg" radius="sm">
              {moves} moves
            </Badge>
          </Group>
        </Group>
      </Paper>
    </div>
  )
}

export default Header
