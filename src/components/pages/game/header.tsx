import type { TController } from '#/types/client.types'
import { Group, Text, Badge, Divider, Flex, Stack, Button } from '@mantine/core'
import Poster from '#/components/poster/poster'
import ProfileImage from '#/components/profile-image'
import PointTracker from './point-tracker'
import Paper from '#/components/ui/paper/paper'
import classes from './game.module.css'
import type { ReturnGetUserGameId } from '#/lib/server/attempt'
import OpenPersonImageExpand from '#/components/modals/image-expand'
import {
  TMDB_IMAGE_POSTER_URL_EXPAND,
  TMDB_IMAGE_PROFILE_URL_EXPAND,
} from '#/lib/constants'
import ModalGameHistory from '#/components/modals/game-history'
import type { TReturnUsePicks } from '#/hooks/use-picks'
import type { TReturnUseGame } from '#/hooks/use-game'

type HistoryItem = ReturnGetUserGameId['gameMovesLog'][0]

type PropTypes = {
  start: TController
  end: TController
  history: ReturnGetUserGameId['gameMovesLog']
  moves: number
  picks: TReturnUsePicks
  giveUp: TReturnUseGame['actions']['gaveUpGame']
}

const Endpoint = ({
  kicker,
  controller,
  variant,
}: {
  kicker: string
  controller: TController
  variant: 'origin' | 'target'
}) => {
  const isTarget = variant === 'target'
  const expandedProfileUrl = controller.img_path
    ? `${TMDB_IMAGE_POSTER_URL_EXPAND}${controller.img_path}`
    : ''

  // Both image components fill their wrapper, so the wrapper carries the 2:3
  // sizing. The target is roughly 1.6x the origin.
  const frame = isTarget
    ? `${classes.targetFrame} h-[66px] w-11`
    : `${classes.startFrame} h-[42px] w-7`

  return (
    <Group
      gap={isTarget ? 'sm' : 'xs'}
      wrap="nowrap"
      style={{
        flexDirection: isTarget ? 'row-reverse' : 'row',
        minWidth: 0,
      }}
    >
      {controller.type === 'MOVIE' ? (
        <div className={frame}>
          <Poster
            onClick={(e) => {
              e.stopPropagation()
              OpenPersonImageExpand(true, expandedProfileUrl)
            }}
            type="movie"
            posterPath={controller.img_path}
            id={controller.id.toString()}
            altText={`${controller.img_path}-${controller.id}`}
          />
        </div>
      ) : (
        <div className={frame}>
          <ProfileImage
            profilePath={controller.img_path}
            creditId={controller.id}
          />
        </div>
      )}

      <div style={{ minWidth: 0, textAlign: isTarget ? 'right' : 'left' }}>
        <Badge
          variant={isTarget ? 'filled' : 'transparent'}
          color={isTarget ? 'grape' : 'gray'}
          size="xs"
          radius="sm"
          px={isTarget ? 8 : 0}
        >
          {kicker}
        </Badge>
        <Text
          fw={isTarget ? 800 : 500}
          size={isTarget ? 'lg' : 'xs'}
          c={isTarget ? undefined : 'dimmed'}
          lh={1.2}
          truncate
          title={controller.label}
        >
          {controller.label}
        </Text>
      </div>
    </Group>
  )
}

const CurrentImage = ({ current }: { current: HistoryItem }) => {
  const expandedProfileUrl =
    current.entityType === 'MOVIE'
      ? `${TMDB_IMAGE_POSTER_URL_EXPAND}${current.entity?.imgPath}`
      : `${TMDB_IMAGE_PROFILE_URL_EXPAND}${current.entity?.imgPath}`
  if (current.entityType === 'MOVIE') {
    return (
      <div className="h-12 w-9">
        <Poster
          type="movie"
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
        <Poster
          type="person"
          posterPath={current.entity?.imgPath}
          id={current.entityId.toString()}
          onClick={(e) => {
            e.stopPropagation()
            OpenPersonImageExpand(
              true,
              `${TMDB_IMAGE_PROFILE_URL_EXPAND}${current.entity?.imgPath}`,
            )
          }}
        />
      </div>
    )
  }
}

const Header = ({ start, end, history, moves, picks, giveUp }: PropTypes) => {
  const current = history.length > 0 ? history[history.length - 1] : null
  return (
    <div className={classes.headerSticky} id="header">
      <Paper withBorder radius="sm" p="sm" mb="xs">
        <Group wrap="nowrap" gap="xs" align="center">
          <div style={{ flex: '0 1 auto', minWidth: 0 }}>
            <Endpoint kicker="From" controller={start} variant="origin" />
          </div>

          <div style={{ flex: '1 1 auto', minWidth: 0 }}>
            <Endpoint kicker="TARGET" controller={end} variant="target" />
          </div>
        </Group>
        <Divider my={6} />
        <Group justify="space-between" wrap="wrap" gap="sm">
          <Group
            gap="xs"
            wrap="nowrap"
            flex={'row'}
            w="100%"
            justify="space-between"
          >
            <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
              <Text size="xs" c="dimmed" fw={600} tt="uppercase">
                Now
              </Text>
              {current ? (
                <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
                  <CurrentImage current={current} />
                  <Text
                    fw={700}
                    size="sm"
                    truncate
                    title={current.entity?.label}
                  >
                    {current.entity?.label}
                  </Text>
                </Group>
              ) : (
                <Text size="sm" c="dimmed" truncate>
                  {start.label}
                </Text>
              )}
            </Group>
            <Flex direction={'column'} gap={6} align="flex-end">
              <Badge
                variant="light"
                color="gray"
                size="lg"
                radius="sm"
                onClick={() => {
                  ModalGameHistory(history)
                }}
              >
                {moves} moves
              </Badge>
              <Stack gap={3}>
                <PointTracker
                  type="CAST"
                  curr={picks.scores.castScore.curr}
                  max={picks.scores.castScore.max}
                />
                <PointTracker
                  type="CREW"
                  curr={picks.scores.crewScore.curr}
                  max={picks.scores.crewScore.max}
                />
              </Stack>
            </Flex>
            <Button
              size="xs"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()

                giveUp()
              }}
            >
              Give Up
            </Button>
          </Group>
        </Group>
      </Paper>
    </div>
  )
}

export default Header
