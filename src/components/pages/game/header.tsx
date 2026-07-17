import type {
  TController,
  TMovieController,
  TPersonController,
} from '#/types/client.types'
import {
  Paper,
  Group,
  Stack,
  Text,
  Badge,
  ThemeIcon,
  Divider,
} from '@mantine/core'
import PosterImage from '#/components/poster-image'
import ProfileImage from '#/components/profile-image'
import Timer from '#/components/timer'
import { Film, User } from 'lucide-react'

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

const FilmIcon = () => (
  <svg
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <Film />
  </svg>
)

const PersonIcon = () => (
  <svg
    width="18"
    height="18"
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <User />
  </svg>
)

const ArrowIcon = () => (
  <svg
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14 5l7 7-7 7M21 12H3"
    />
  </svg>
)

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
      <ThemeIcon variant="light" color={color} size={40} radius="md">
        {controller.type === 'MOVIE' ? <FilmIcon /> : <PersonIcon />}
      </ThemeIcon>
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
      <PosterImage
        className="h-12 w-9"
        posterPath={current.details.poster_path}
        id={current.id.toString()}
      />
    )
  }
  return (
    <ProfileImage
      className="h-12 w-12"
      profilePath={current.details.profile_path}
      creditId={current.id}
    />
  )
}

const Header = ({ start, end, history, moves, time }: PropTypes) => {
  const current = history.length > 0 ? history[history.length - 1] : null

  return (
    <Paper withBorder radius="lg" p="md" mb="md" shadow="xs">
      {/* Journey: start -> target */}
      <Group justify="space-between" wrap="nowrap" gap="sm">
        <div style={{ flex: 1, minWidth: 0 }}>
          <Endpoint
            kicker="Start"
            color="teal"
            controller={start}
            align="start"
          />
        </div>

        <Stack align="center" gap={2} px="xs">
          <ThemeIcon variant="subtle" color="gray" size="sm">
            <ArrowIcon />
          </ThemeIcon>
          <Text size="xs" c="dimmed" fw={600} tt="uppercase">
            Goal
          </Text>
        </Stack>

        <div style={{ flex: 1, minWidth: 0 }}>
          <Endpoint
            kicker="Target"
            color="grape"
            controller={end}
            align="end"
          />
        </div>
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
            variant="light"
            color="teal"
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
  )
}

export default Header
