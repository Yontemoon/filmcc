import type {
  TController,
  TMovieController,
  TPersonController,
} from '#/types/client.types'
import { Group, Stack, Text, Badge, ThemeIcon, Divider } from '@mantine/core'
import PosterImage from '#/components/poster/poster'
import ProfileImage from '#/components/profile-image'
import Timer from '#/components/timer'
import Paper from '#/components/ui/paper/paper'
import { ArrowRight } from 'lucide-react'
import classes from './game.module.css'

type HistoryItem = TMovieController | TPersonController

type PropTypes = {
  start: TController
  end: TController
  history: HistoryItem[]
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
        <div className="h-15 w-12">
          <PosterImage
            posterPath={controller.img_path}
            id={controller.id.toString()}
            altText={`${controller.img_path}-${controller.id}`}
          />
        </div>
      ) : (
        <div className="h-12 w-12">
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
  if (current.type === 'MOVIE') {
    return (
      <div className="h-12 w-9">
        <PosterImage
          posterPath={current.details.poster_path}
          id={current.id.toString()}
          altText={`${current.img_path}-${current.id}`}
        />
      </div>
    )
  }
  return (
    <div className="h-12 w-12">
      <ProfileImage
        profilePath={current.details.profile_path}
        creditId={current.id}
      />
    </div>
  )
}

const Header = ({ start, end, history, moves, time }: PropTypes) => {
  const current = history.length > 0 ? history[history.length - 1] : null

  return (
    <div className={classes.headerSticky} id="header">
      <Paper withBorder radius="lg" p="md" mb="md" shadow="xs">
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

        <Divider my="sm" />

        {/* Now + stats */}
        <Group justify="space-between" wrap="wrap" gap="sm">
          <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
            <Text size="xs" c="dimmed" fw={600} tt="uppercase">
              Now
            </Text>
            {current ? (
              <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
                <CurrentImage current={current} />
                <Text fw={700} size="sm" truncate title={current.label}>
                  {current.label}
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
