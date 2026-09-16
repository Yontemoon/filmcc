import { ActionIcon, Group, Text, Tooltip, UnstyledButton } from '@mantine/core'
import { ChevronDown, Flag } from 'lucide-react'
import Poster from '#/components/poster/poster'
import ProfileImage from '#/components/profile-image'
import PointTracker from './point-tracker'
import classes from './game.module.css'
import type { ReturnGetUserGameId } from '#/lib/server/attempt'
import ModalGameHistory from '#/components/modals/game-history'
import ModalGenresUsed from '#/components/modals/genres-used'
import ModalConfirmGiveUp from '#/components/modals/confirm-give-up'
import { Button } from '#/components/ui/buttons'
import type { TController, TType } from '#/types/client.types'
import type { TReturnUsePicks } from '#/hooks/use-picks'
import type { TReturnUseGame } from '#/hooks/use-game'
import type { T_TMDB_GENRE } from '#/types/tmdb.types'

type PropTypes = {
  start: TController
  end: TController
  history: ReturnGetUserGameId['gameMovesLog']
  moves: number
  picks: TReturnUsePicks
  giveUp: TReturnUseGame['actions']['gaveUpGame']
  genres: T_TMDB_GENRE[]
}

type PoleVariant = 'now' | 'start' | 'target'

const KICKER_COLOR: Record<PoleVariant, string | undefined> = {
  now: 'var(--mantine-color-dimmed)',
  start: 'var(--mantine-color-teal-7)',
  target: 'var(--mantine-color-grape-7)',
}

const FRAME_ACCENT: Record<PoleVariant, string> = {
  now: '',
  start: classes.poleFrameStart,
  target: classes.poleFrameTarget,
}

const Pole = ({
  variant,
  label,
  imgPath,
  entityType,
}: {
  variant: PoleVariant
  label: string
  imgPath: string | null | undefined
  entityType: TType
}) => {
  const isTarget = variant === 'target'
  const kicker = variant === 'start' ? 'Start' : variant

  const frame = (
    <div className={`${classes.poleFrame} ${FRAME_ACCENT[variant]}`}>
      {entityType === 'MOVIE' ? (
        <Poster
          type="movie"
          posterPath={imgPath}
          id={label}
          altText={label}
          showExpand={false}
        />
      ) : (
        <ProfileImage profilePath={imgPath} creditId={label} />
      )}
    </div>
  )

  return (
    <div className={`${classes.pole} ${isTarget ? classes.poleTarget : ''}`}>
      {!isTarget && frame}
      <div style={{ minWidth: 0, textAlign: isTarget ? 'right' : 'left' }}>
        <div
          className={classes.kicker}
          style={{ color: KICKER_COLOR[variant] }}
        >
          {kicker}
        </div>
        <Text
          fw={isTarget ? 800 : 700}
          size="sm"
          lh={1.25}
          mt={2}
          truncate
          title={label}
        >
          {label}
        </Text>
      </div>
      {isTarget && frame}
    </div>
  )
}

const Header = ({
  start,
  end,
  history,
  moves,
  picks,
  genres,
  giveUp,
}: PropTypes) => {
  const current = history.length > 0 ? history[history.length - 1] : null
  const entity = current?.entity
  const atStart = moves === 0

  // Before the first move the left pole IS the start, so it says so and takes
  // the teal accent. After that it is wherever the player has got to.
  const nowLabel = entity?.label ?? start.label
  const nowImg = entity?.imgPath ?? start.img_path
  const nowType = entity?.entityType ?? start.type

  const spentGenres = Array.from(
    new Map(genres.map((genre) => [genre.id, genre])).values(),
  )

  const openGiveUp = () => ModalConfirmGiveUp(giveUp)

  return (
    <div className={classes.statusBar} id="game-status">
      <div className={classes.poles}>
        <Pole
          variant={atStart ? 'start' : 'now'}
          label={nowLabel}
          imgPath={nowImg}
          entityType={nowType}
        />

        <div className={classes.connector}>
          <svg
            viewBox="0 0 48 8"
            fill="none"
            aria-hidden
            style={{ width: 48, height: 8 }}
          >
            <path
              d="M0 4h41"
              stroke="var(--mantine-color-gray-5)"
              strokeWidth="2"
              strokeDasharray="3 3"
            />
            <path d="M41 1l7 3-7 3z" fill="var(--mantine-color-grape-5)" />
          </svg>
        </div>

        <Pole
          variant="target"
          label={end.label}
          imgPath={end.img_path}
          entityType={end.type}
        />
      </div>

      <div className={classes.budgetRow}>
        <Group gap={14} wrap="nowrap">
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
        </Group>

        <Group gap={6} wrap="nowrap">
          <Tooltip label="See the path you've built" withArrow openDelay={400}>
            <UnstyledButton
              className={`${classes.moveChip} ${atStart ? classes.moveChipEmpty : ''}`}
              onClick={() => ModalGameHistory(history)}
            >
              {moves} {moves === 1 ? 'move' : 'moves'}
            </UnstyledButton>
          </Tooltip>
          <Tooltip
            label="Each genre can only be routed through once"
            withArrow
            openDelay={400}
          >
            <UnstyledButton
              className={`${classes.genreChip} ${
                spentGenres.length === 0 ? classes.genreChipEmpty : ''
              }`}
              onClick={() => ModalGenresUsed(genres)}
            >
              {spentGenres.length}{' '}
              {spentGenres.length === 1 ? 'genre' : 'genres'} spent
              <ChevronDown size={11} strokeWidth={3} aria-hidden />
            </UnstyledButton>
          </Tooltip>

          <ActionIcon
            hiddenFrom="sm"
            variant="subtle"
            color="gray"
            size="sm"
            aria-label="Give up"
            onClick={openGiveUp}
          >
            <Flag size={15} />
          </ActionIcon>
          <Button
            visibleFrom="sm"
            size="compact-xs"
            variant="outline"
            onClick={openGiveUp}
          >
            Give Up
          </Button>
        </Group>
      </div>
    </div>
  )
}

export default Header
