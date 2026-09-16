import React from 'react'
import { Text } from '@mantine/core'
import { Search } from 'lucide-react'
import Spinner from '#/components/ui/spinner'
import SegmentedControl from '#/components/ui/segmented-control'
import { TextInput } from '#/components/ui/input'
import Poster from '#/components/poster/poster'
import { TRACKER_META } from './point-tracker'
import { displayCrew, movieRowToMove, personRowToMove } from './utils'
import type { TReturnReformatTable } from './utils'
import type { TController, TlinkType, TMove } from '#/types/client.types'
import type { TReturnUseCredits } from '#/hooks/use-credits'
import type { TReturnUsePicks } from '#/hooks/use-picks'
import type { T_TMDB_GENRE } from '#/types/tmdb.types'
import { displayYear } from '#/lib/utils'
import { useEntitiesProvider } from '#/provider/entites'
import classes from './game.module.css'

type PropTypes = {
  query: TReturnUseCredits
  changeController: (move: TMove) => void
  bodyData: TReturnReformatTable
  end: TController
  genres: T_TMDB_GENRE[]
  picks: TReturnUsePicks
}

type BoardRow = {
  key: string
  id: number
  title: string
  subtitle: string | null
  imgPath: string | null
  posterType: 'movie' | 'person'
  linkType: TlinkType
  genreName: string | null
  blocked: string | null
  isTarget: boolean
  move: TMove
}

type TFilter = 'ALL' | 'OPEN'
type TSort = 'NEWEST' | 'AZ'

const joinDetail = (year: number | null, detail: string | null) =>
  [year, detail].filter(Boolean).join(' · ') || null

const buildRows = (
  bodyData: TReturnReformatTable,
  end: TController,
  genres: T_TMDB_GENRE[],
): BoardRow[] => {
  if (!bodyData) return []

  if (bodyData.type === 'PERSON') {
    const spent = new Set(genres.map((genre) => genre.id))

    return bodyData.combined.map((curr) => {
      const isTarget = end.type === 'MOVIE' && end.id === curr.id
      const jobs =
        curr.person_type === 'crew' ? [...new Set(curr.jobs)] : undefined
      const date = curr.person_type === 'crew' ? curr.release_date : curr.date

      const blocked = isTarget
        ? null
        : curr.already_added
          ? 'In your path'
          : spent.has(curr.genre.id)
            ? `${curr.genre.name} spent`
            : !curr.can_be_picked
              ? 'No picks left'
              : null

      return {
        key: `${curr.person_type}-${curr.id}`,
        id: curr.id,
        title: curr.title,
        subtitle: joinDetail(
          date ? displayYear(date) : null,
          curr.person_type === 'cast'
            ? curr.role
              ? `as ${curr.role}`
              : null
            : jobs!.map((job) => displayCrew(job)).join(', '),
        ),
        imgPath: curr.poster_url,
        posterType: 'movie',
        linkType: curr.person_type === 'cast' ? 'CAST' : 'CREW',
        genreName: curr.genre.name,
        blocked,
        isTarget,
        move: personRowToMove(curr),
      }
    })
  }

  return bodyData.combined.map((person) => {
    const isTarget = end.type === 'PERSON' && end.id === person.id
    const isCast = person.person_type === 'cast'

    const blocked = isTarget
      ? null
      : person.already_added
        ? 'In your path'
        : !person.can_be_picked
          ? `No ${isCast ? 'cast' : 'crew'} picks`
          : null

    return {
      key: `${person.person_type}-${person.id}`,
      id: person.id,
      title: person.name,
      subtitle: isCast
        ? person.role
          ? `as ${person.role}`
          : null
        : [...new Set(person.jobs.map((job) => displayCrew(job)))].join(', '),
      imgPath: person.profile_url,
      posterType: 'person',
      linkType: isCast ? 'CAST' : 'CREW',
      genreName: null,
      blocked,
      isTarget,
      move: movieRowToMove(person),
    }
  })
}

const Tile = ({
  row,
  onPick,
}: {
  row: BoardRow
  onPick: (move: TMove) => void
}) => {
  const disabled = row.blocked !== null
  const meta = TRACKER_META[row.linkType]

  return (
    <button
      type="button"
      disabled={disabled}
      className={`${classes.tileButton} ${disabled ? classes.tileBlocked : ''}`}
      onClick={() => onPick(row.move)}
      title={row.title}
    >
      <div
        className={`${classes.tileFrame} ${
          row.isTarget ? classes.tileFrameTarget : ''
        }`}
      >
        <Poster
          type={row.posterType}
          posterPath={row.imgPath}
          id={row.id.toString()}
          altText={row.title}
          showExpand={false}
          toggleImageExpand={false}
          hd={true}
        />

        {row.isTarget ? (
          <div className={`${classes.tileBand} ${classes.tileBandTarget}`}>
            Target — finish
          </div>
        ) : row.blocked ? (
          <div className={`${classes.tileBand} ${classes.tileBandBlocked}`}>
            {row.blocked}
          </div>
        ) : row.genreName ? (
          <div className={classes.tileTag}>{row.genreName}</div>
        ) : (
          <div
            className={classes.tileDot}
            style={{
              backgroundColor: `var(--mantine-color-${meta.color}-5)`,
            }}
          />
        )}
      </div>

      <Text
        size="sm"
        fw={700}
        lh={1.25}
        className={`${classes.tileText} ${classes.tileTitle}`}
      >
        {row.title}
      </Text>
      {row.subtitle && (
        <Text
          size="xs"
          lh={1.3}
          c={disabled ? 'dimmed' : row.genreName ? 'dimmed' : meta.color}
          className={classes.tileText}
        >
          {row.subtitle}
        </Text>
      )}
    </button>
  )
}

const Section = ({
  label,
  color,
  note,
  rows,
  onPick,
}: {
  label: string
  color: string
  note: string
  rows: BoardRow[]
  onPick: (move: TMove) => void
}) => {
  if (rows.length === 0) return null

  return (
    <>
      <div className={classes.sectionHead}>
        <div
          className={classes.sectionLabel}
          style={{ color: `var(--mantine-color-${color}-7)` }}
        >
          {label}
        </div>
        <div
          className={classes.sectionRule}
          style={{ backgroundColor: `var(--mantine-color-${color}-5)` }}
        />
        <Text size="10px" fw={700} c="dimmed" tt="uppercase">
          {note}
        </Text>
      </div>
      <div className={classes.tileGrid}>
        {rows.map((row) => (
          <Tile key={row.key} row={row} onPick={onPick} />
        ))}
      </div>
    </>
  )
}

const MainBody = ({
  query,
  changeController,
  bodyData,
  end,
  genres,
  picks,
}: PropTypes) => {
  const { isLoading, error } = query
  const { showUsedEntities } = useEntitiesProvider()

  const [search, setSearch] = React.useState('')
  const [sort, setSort] = React.useState<TSort>('NEWEST')

  React.useEffect(() => {
    setSearch('')
  }, [bodyData])

  const rows = React.useMemo(
    () => buildRows(bodyData, end, genres),
    [bodyData, end, genres],
  )

  const filter: TFilter = showUsedEntities ? 'ALL' : 'OPEN'

  const visible = React.useMemo(() => {
    const query_ = search.trim().toLowerCase()

    const kept = rows.filter((row) => {
      // The winning move is never filtered out from under the player.
      if (row.isTarget) return true
      if (filter === 'OPEN' && row.blocked) return false
      if (query_ && !row.title.toLowerCase().includes(query_)) return false
      return true
    })

    return sort === 'AZ'
      ? [...kept].sort((a, b) => a.title.localeCompare(b.title))
      : kept
  }, [rows, filter, search, sort])

  const isPersonBoard = bodyData?.type === 'PERSON'

  return (
    <div>
      {isLoading && (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      )}
      {error && <div className="px-3 py-4">{error.message}</div>}

      {!isLoading && !error && !bodyData && (
        <Text className={classes.emptyBoard} c="dimmed" size="sm">
          Couldn’t load this board. Check your connection and try again.
        </Text>
      )}

      {!isLoading && !error && bodyData && (
        <>
          <div className={classes.boardControls}>
            {isPersonBoard && (
              <SegmentedControl
                size="xs"
                value={sort}
                onChange={(value) => setSort(value as TSort)}
                data={[
                  { label: 'Newest', value: 'NEWEST' },
                  { label: 'A-Z', value: 'AZ' },
                ]}
              />
            )}

            <TextInput
              size="xs"
              className={classes.searchInput}
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
              placeholder={
                isPersonBoard
                  ? `Search ${rows.length} films`
                  : `Search ${rows.length} people`
              }
              leftSection={<Search size={13} />}
              aria-label="Search this board"
            />
          </div>

          <div className="px-3 pb-4 pt-3 flex flex-col gap-3">
            {visible.length === 0 ? (
              <Text className={classes.emptyBoard} c="dimmed" size="sm">
                {search.trim()
                  ? `Nothing here matches “${search.trim()}”.`
                  : 'Nothing on this board can be picked.'}
              </Text>
            ) : isPersonBoard ? (
              <Section
                label="Films"
                color="cyan"
                note="Spends a genre"
                rows={visible}
                onPick={changeController}
              />
            ) : (
              <>
                <Section
                  label="Crew"
                  color="orange"
                  note={`Spends 1 — ${
                    picks.scores.crewScore.max - picks.scores.crewScore.curr
                  } left`}
                  rows={visible.filter((row) => row.linkType === 'CREW')}
                  onPick={changeController}
                />
                <Section
                  label="Cast"
                  color="blue"
                  note={`Spends 1 — ${
                    picks.scores.castScore.max - picks.scores.castScore.curr
                  } left`}
                  rows={visible.filter((row) => row.linkType === 'CAST')}
                  onPick={changeController}
                />
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default MainBody
