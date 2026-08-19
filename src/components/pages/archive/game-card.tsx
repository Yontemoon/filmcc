import {
  Badge,
  Card,
  Divider,
  Group,
  Image,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Footprints, Lock, Trophy } from 'lucide-react'
import Button from '#/components/ui/buttons/button'
import type { TArchivedGame } from '#/lib/server/daily'
import type { TController } from '#/types/client.types'
import { formatDisplayDate } from '#/lib/utils'
import { STATUS_META, getArchiveStatus, isLocked } from './utils'
import classes from './archive.module.css'
import { TMDB_IMAGE_POSTER_URL, TMDB_IMAGE_PROFILE_URL } from '#/lib/constants'

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
            <Image
              src={`${TMDB_IMAGE_POSTER_URL}${controller.img_path}`}
              id={controller.id.toString()}
              alt={controller.id.toString()}
              fit="contain"
              // altText={controller.label}
              // showExpand={false}
            />
          </div>
        ) : (
          <div className={classes.profileBox}>
            <Image
              src={`${TMDB_IMAGE_PROFILE_URL}${controller.img_path}`}
              alt={controller.id.toString()}
              fit="contain"
            />
          </div>
        )}
      </div>

      <Badge variant="light" color={color} size="xs" radius="sm">
        {kicker}
      </Badge>

      {/* <Text
        fw={700}
        size="sm"
        lineClamp={2}
        title={controller.label}
        className={classes.label}
      >
        {controller.label}
      </Text> */}
    </Stack>
  )
}

const GameCard = ({ game }: PropTypes) => {
  const status = getArchiveStatus(game.attempt)
  const attempt = game.movesCount
  const locked = isLocked(game.game)
  const meta = STATUS_META[status]
  const StatusIcon = meta.icon

  return (
    <Card
      withBorder
      radius="lg"
      padding={0}
      shadow="xs"
      className={`${classes.card} ${locked ? classes.cardLocked : ''}`}
    >
      <Card.Section
        inheritPadding
        py="xs"
        px="md"
        className={classes.cardHeader}
      >
        <Group justify="space-between" wrap="nowrap">
          <Badge variant="light" color="blue" radius="sm">
            No. {game.game.id}
          </Badge>
          <Text size="xs" c="dimmed" fw={600} tt="uppercase">
            {formatDisplayDate(game.game.displayDate)}
          </Text>
        </Group>
      </Card.Section>

      <Group
        justify="space-between"
        wrap="nowrap"
        gap="0"
        pos={'relative'}
        p={'0'}
      >
        <ThemeIcon
          variant="light"
          color="gray"
          radius="xl"
          size="md"
          pos={'absolute'}

          className={classes.arrowRight}

          // top={'50%'}
          // bottom={'50%'}
        >
          <ArrowRight size={16} />
        </ThemeIcon>
        <Endpoint controller={game.game.start} kicker="Start" color="teal" />
        <Divider orientation="vertical" />
        <Endpoint controller={game.game.end} kicker="Target" color="grape" />
      </Group>

      <Divider my="md" />

      <Group justify="space-between" wrap="nowrap" gap="xs" px="md">
        <Badge
          variant="light"
          color={locked ? 'gray' : meta.color}
          radius="sm"
          leftSection={locked ? <Lock size={12} /> : <StatusIcon size={12} />}
        >
          {locked ? 'Locked' : meta.label}
        </Badge>

        {game.movesCount ? (
          <Tooltip label="Moves in the shortest known solution" withArrow>
            <Badge
              variant="default"
              radius="sm"
              leftSection={<Trophy size={12} />}
            >
              Par {game.game.parMoves}
            </Badge>
          </Tooltip>
        ) : null}
      </Group>

      {attempt ? (
        <Group gap="xs" mt="xs" wrap="nowrap" px="md">
          <Group gap={4} wrap="nowrap">
            <Footprints size={14} />
            <Text size="xs" c="dimmed">
              {attempt} {attempt === 1 ? 'move' : 'moves'}
            </Text>
          </Group>
        </Group>
      ) : (
        <Text size="xs" c="dimmed" mt="xs">
          {locked ? 'Unlocks on its release date' : 'No attempt yet'}
        </Text>
      )}

      <Group gap="xs" my="xs" wrap="nowrap" px="md">
        {locked ? (
          <Button fullWidth mt="md" variant="light" disabled>
            Locked
          </Button>
        ) : (
          <Link
            to="/game/$game_id"
            params={{ game_id: String(game.game.id) }}
            className={classes.playLink}
          >
            <Button fullWidth mt="md" variant={attempt ? 'light' : 'filled'}>
              {CTA_LABEL[status]}
            </Button>
          </Link>
        )}
      </Group>
    </Card>
  )
}

export default GameCard
