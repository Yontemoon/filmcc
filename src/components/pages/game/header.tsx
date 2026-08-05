import type { TController } from '#/types/client.types'
import { Group, Stack, Text, Badge, ThemeIcon, Divider } from '@mantine/core'
import PosterImage from '#/components/poster/poster'
import ProfileImage from '#/components/profile-image'
import Timer from '#/components/timer'
import Paper from '#/components/ui/paper/paper'
import { ArrowRight } from 'lucide-react'
import classes from './game.module.css'
import type { ReturnGetUserGameId } from '#/lib/server/attempt'
import OpenPersonImageExpand from '#/components/modals/image-expand'
import { TMDB_IMAGE_POSTER_URL_EXPAND } from '#/lib/constants'
import History from './history'

type HistoryItem = ReturnGetUserGameId['gameMovesLog'][0]

type PropTypes = {
  start: TController
  end: TController
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
  const expandedProfileUrl = controller.img_path
    ? `${TMDB_IMAGE_POSTER_URL_EXPAND}${controller.img_path}`
    : ''

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
            onClick={(e) => {
              e.stopPropagation()
              OpenPersonImageExpand(true, expandedProfileUrl)
            }}
            posterPath={controller.img_path}
            id={controller.id.toString()}
            altText={`${controller.img_path}-${controller.id}`}
          />
        </div>
      ) : (
        <div className="h-12 w-9">
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
    const expandedProfileUrl = current.entity?.imgPath
      ? `${TMDB_IMAGE_POSTER_URL_EXPAND}${current.entity.imgPath}`
      : ''

    return (
      <div className="h-12 w-9">
        <PosterImage
          onClick={(e) => {
            e.stopPropagation()
            OpenPersonImageExpand(true, expandedProfileUrl)
          }}
          posterPath={current.entity?.imgPath}
          id={current.entityId.toString()}
          altText={`${current.entity?.imgPath}-${current.entityId}`}
        />
      </div>
    )
  } else {
    return (
      <div className="h-12 w-9">
        <ProfileImage
          profilePath={current.entity?.imgPath}
          creditId={current.entityId}
        />
      </div>
    )
  }
}

const Header = ({ start, end, history, moves, time }: PropTypes) => {
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

        {/* History + stats */}
        <Group justify="space-between" wrap="wrap" gap="sm">
          <Group gap="xs" wrap="nowrap">
            {/* <Badge
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
            </Badge> */}
            <Badge variant="light" color="gray" size="lg" radius="sm">
              {moves} moves
            </Badge>
          </Group>
          <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
            <History gameMoves={history} />
          </Group>
        </Group>
      </Paper>
    </div>
  )
}

export default Header
