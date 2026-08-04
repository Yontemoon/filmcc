import {
  Badge,
  Card,
  Divider,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Footprints, Lock, TimerReset, Trophy } from 'lucide-react'
import Poster from '#/components/poster/poster'
import ProfileImage from '#/components/profile-image'
import Button from '#/components/ui/button'
import type { TArchivedGame } from '#/lib/server/game'
import type { TController } from '#/types/client.types'
import { formatDisplayDate, formatTime } from '#/lib/utils'
import { STATUS_META, getArchiveStatus, getAttempt, isLocked } from './utils'
import classes from './archive.module.css'

type PropTypes = {
  game: TArchivedGame
}

const CTA_LABEL = {
  unplayed: 'Play',
  in_progress: 'Resume',
  completed: 'Play again',
  failed: 'Try again',
  gave_up: 'Try again',
} as const

const Endpoint = ({
  controller,
  kicker,
  color,
}: {
  controller: TController
  kicker: string
  color: string
}) => {
  return (
    <Stack gap={6} align="center" className={classes.endpoint}>
      <div className={classes.artFrame}>
        {controller.type === 'MOVIE' ? (
          <div className={classes.posterBox}>
            <Poster
              posterPath={controller.img_path}
              id={controller.id.toString()}
              altText={controller.label}
              showExpand={false}
            />
          </div>
        ) : (
          <div className={classes.profileBox}>
            <ProfileImage
              profilePath={controller.img_path}
              creditId={controller.id}
            />
          </div>
        )}
      </div>

      <Badge variant="light" color={color} size="xs" radius="sm">
        {kicker}
      </Badge>

      <Text
        fw={700}
        size="sm"
        lineClamp={2}
        title={controller.label}
        className={classes.label}
      >
        {controller.label}
      </Text>
    </Stack>
  )
}

const GameCard = ({ game }: PropTypes) => {
  const status = getArchiveStatus(game)
  const attempt = getAttempt(game)
  const locked = isLocked(game)
  const meta = STATUS_META[status]
  const StatusIcon = meta.icon

  return (
    <Card
      withBorder
      radius="lg"
      padding="md"
      shadow="xs"
      className={`${classes.card} ${locked ? classes.cardLocked : ''}`}
    >
      <Card.Section inheritPadding py="xs" className={classes.cardHeader}>
        <Group justify="space-between" wrap="nowrap">
          <Badge variant="light" color="blue" radius="sm">
            No. {game.id}
          </Badge>
          <Text size="xs" c="dimmed" fw={600} tt="uppercase">
            {formatDisplayDate(game.displayDate)}
          </Text>
        </Group>
      </Card.Section>

      <Group justify="space-between" wrap="nowrap" gap="xs" mt="md">
        <Endpoint controller={game.start} kicker="Start" color="teal" />

        <ThemeIcon variant="light" color="gray" radius="xl" size="md">
          <ArrowRight size={16} />
        </ThemeIcon>

        <Endpoint controller={game.end} kicker="Target" color="grape" />
      </Group>

      <Divider my="sm" />

      <Group justify="space-between" wrap="nowrap" gap="xs">
        <Badge
          variant="light"
          color={locked ? 'gray' : meta.color}
          radius="sm"
          leftSection={locked ? <Lock size={12} /> : <StatusIcon size={12} />}
        >
          {locked ? 'Locked' : meta.label}
        </Badge>

        {game.parMoves ? (
          <Tooltip label="Moves in the shortest known solution" withArrow>
            <Badge
              variant="default"
              radius="sm"
              leftSection={<Trophy size={12} />}
            >
              Par {game.parMoves}
            </Badge>
          </Tooltip>
        ) : null}
      </Group>

      {attempt ? (
        <Group gap="xs" mt="xs" wrap="nowrap">
          <Group gap={4} wrap="nowrap">
            <Footprints size={14} />
            <Text size="xs" c="dimmed">
              {attempt.moves} {attempt.moves === 1 ? 'move' : 'moves'}
            </Text>
          </Group>
          {attempt.elapsedMs ? (
            <Group gap={4} wrap="nowrap">
              <TimerReset size={14} />
              <Text size="xs" c="dimmed">
                {formatTime(attempt.elapsedMs)}
              </Text>
            </Group>
          ) : null}
        </Group>
      ) : (
        <Text size="xs" c="dimmed" mt="xs">
          {locked ? 'Unlocks on its release date' : 'No attempt yet'}
        </Text>
      )}

      {locked ? (
        <Button fullWidth mt="md" variant="light" disabled>
          Locked
        </Button>
      ) : (
        <Link
          to="/game/$game_id"
          params={{ game_id: String(game.id) }}
          className={classes.playLink}
        >
          <Button fullWidth mt="md" variant={attempt ? 'light' : 'filled'}>
            {CTA_LABEL[status]}
          </Button>
        </Link>
      )}
    </Card>
  )
}

export default GameCard
