import React from 'react'
import Spinner from '#/components/ui/spinner'
import { reformatForTable } from './utils'
import type { TReturnReformatTable } from './utils'
import type { TController } from '#/types/client.types'
import PosterImage from '#/components/poster/poster'
import type { TReturnUseCredits } from '#/hooks/use-credits'
import { Text, Title, Grid, Group, Badge } from '@mantine/core'
import { TRACKER_META } from './point-tracker'
import { displayYear } from '#/lib/utils'
import ColorSwatch from '#/components/ui/color-swatch/color-swatch'
import classes from './game.module.css'
import type { ReturnGetUserGameId } from '#/lib/server/attempt'
import type { TReturnUsePicks } from '#/hooks/use-picks'

type PropTypes = {
  picks: TReturnUsePicks
  history: ReturnGetUserGameId['gameMovesLog']
  query: TReturnUseCredits
  changeController: (data: TController) => void
}

const MainBody = ({ history, query, changeController, picks }: PropTypes) => {
  const { isLoading, error, data } = query

  const memoTableData = React.useMemo(() => {
    return reformatForTable(data, history, picks)
  }, [data, history, picks])

  return (
    <div className="mx-1">
      {isLoading && (
        <div className="flex justify-center">
          <Spinner />
        </div>
      )}
      {error && <div>{error.message}</div>}
      {memoTableData?.type === 'MOVIE' && data?.type === 'MOVIE' && (
        <GridLayout
          details={data}
          memoData={memoTableData}
          changeController={changeController}
        />
      )}
      {memoTableData?.type === 'PERSON' && data?.type === 'PERSON' && (
        <GridLayout
          details={data}
          memoData={memoTableData}
          changeController={changeController}
        />
      )}
    </div>
  )
}

type GridLayoutProps = {
  details: TReturnUseCredits['data']
  memoData: TReturnReformatTable
  changeController: (data: TController) => void
}
const GridLayout = ({
  memoData,
  changeController,
  details,
}: GridLayoutProps) => {
  const combinedLength = memoData?.combined.length

  return (
    <div className="py-3">
      <Title mb={'md'}>
        {details?.type == 'MOVIE'
          ? details.details.title
          : details?.details.name}{' '}
        ({combinedLength})
      </Title>
      <Grid>
        {memoData?.type === 'PERSON' &&
          memoData.combined.map(({ cast, crew }) => {
            const credit = cast ?? crew
            if (!credit) return null

            const id = credit.id
            const title = credit.title
            const posterUrl = credit.poster_url

            const date = cast?.date ?? crew?.release_date
            const added = credit.already_added
            const jobs = crew ? [...new Set(crew.jobs)] : []

            return (
              <Grid.Col key={id} span={{ base: 4, md: 3, lg: 2 }}>
                <div
                  className={classes.imageLift}
                  onClick={() => {
                    changeController({
                      id,
                      type: 'MOVIE',
                      label: title,
                      img_path: posterUrl,
                    })
                  }}
                >
                  <PosterImage
                    posterPath={posterUrl}
                    id={id.toString()}
                    showExpand={false}
                    hd={true}
                    overlay={added}
                  />
                  <Group className={classes.posterInfo}>
                    {added ? (
                      <ColorSwatch
                        color="var(--mantine-color-red-5)"
                        size={20}
                      />
                    ) : (
                      <ColorSwatch
                        color="var(--mantine-color-teal-5)"
                        size={20}
                      />
                    )}
                  </Group>
                </div>
                <div className={classes.movieInfo}>
                  <Text
                    classNames={{
                      root: classes.movieInfo,
                    }}
                    size="sm"
                  >
                    {title}
                  </Text>
                  {date && (
                    <Text c="dimmed" className={classes.movieInfo} size="xs">
                      {displayYear(date)}
                    </Text>
                  )}
                  {cast?.role && (
                    <Text
                      c="dimmed"
                      className={classes.movieInfo}
                      size="xs"
                      title={cast.role}
                    >
                      as {cast.role}
                    </Text>
                  )}
                  {jobs.length > 0 && (
                    <Text
                      c="dimmed"
                      className={classes.movieInfo}
                      size="xs"
                      title={jobs.join(', ')}
                    >
                      {jobs.join(', ')}
                    </Text>
                  )}
                </div>
              </Grid.Col>
            )
          })}

        {memoData?.type === 'MOVIE' &&
          memoData.combined.map((person) => {
            const { already_added, can_be_picked, id, name, profile_url } =
              person

            const meta =
              TRACKER_META[person.person_type === 'cast' ? 'CAST' : 'CREW']

            // Two reasons a tile can be dead, and they need different copy:
            // it's already in your chain, or that pick type is spent.
            const disabled = already_added || !can_be_picked
            const blockedReason = already_added
              ? 'Used'
              : can_be_picked
                ? null
                : 'None left'

            return (
              <Grid.Col key={person.id} span={{ base: 4, md: 3, lg: 2 }}>
                <div
                  className={`${classes.imageLift} ${classes.personFrame} ${
                    disabled ? classes.personDisabled : ''
                  }`}
                  style={
                    {
                      '--tile-accent': disabled
                        ? 'var(--mantine-color-gray-5)'
                        : `var(--mantine-color-${meta.color}-5)`,
                    } as React.CSSProperties
                  }
                  onClick={() => {
                    if (disabled) return
                    changeController({
                      id,
                      type: 'PERSON',
                      label: name,
                      img_path: profile_url,
                    })
                  }}
                >
                  <PosterImage
                    posterPath={profile_url}
                    id={id.toString()}
                    showExpand={false}
                    hd={true}
                    overlay={disabled}
                  />
                  {/* Text label as well as hue — never colour alone. */}
                  <Group
                    className={classes.posterInfo}
                    justify="space-between"
                    gap={4}
                    wrap="nowrap"
                  >
                    <Badge
                      variant="filled"
                      color={disabled ? 'gray' : meta.color}
                      size="xs"
                      radius="sm"
                    >
                      {meta.label}
                    </Badge>
                    {blockedReason && (
                      <Badge
                        variant="filled"
                        color="dark"
                        size="xs"
                        radius="sm"
                      >
                        {blockedReason}
                      </Badge>
                    )}
                  </Group>
                </div>
                <div className={classes.movieInfo}>
                  <Text
                    classNames={{
                      root: classes.movieInfo,
                    }}
                    size="sm"
                  >
                    {name}
                  </Text>
                  {person.person_type === 'cast' && (
                    <Text
                      size="xs"
                      c={disabled ? 'dimmed' : meta.color}
                      className={classes.movieInfo}
                      title={person.role}
                    >
                      as {person.role}
                    </Text>
                  )}
                  {person.person_type === 'crew' && (
                    <Text
                      size="xs"
                      c={disabled ? 'dimmed' : meta.color}
                      className={classes.movieInfo}
                      title={person.jobs.join(', ')}
                    >
                      {[...new Set(person.jobs)].join(', ')}
                    </Text>
                  )}
                </div>
              </Grid.Col>
            )
          })}
      </Grid>
    </div>
  )
}

export default MainBody
