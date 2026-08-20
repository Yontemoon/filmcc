import React from 'react'
import Spinner from '#/components/ui/spinner'
import type { TReturnReformatTable } from './utils'
import { displayCrew, movieRowToMove, personRowToMove } from './utils'
import type { TController, TMove } from '#/types/client.types'
import Poster from '#/components/poster/poster'
import type { TReturnUseCredits } from '#/hooks/use-credits'
import { Text, Title, Grid, Group, Badge } from '@mantine/core'
import { TRACKER_META } from './point-tracker'
import { displayYear } from '#/lib/utils'
import classes from './game.module.css'
import { useEntitiesProvider } from '#/provider/entites'

type PropTypes = {
  query: TReturnUseCredits
  changeController: (move: TMove) => void
  bodyData: TReturnReformatTable
  end: TController
}

const MainBody = ({ query, changeController, bodyData, end }: PropTypes) => {
  const { isLoading, error, data } = query

  const { hideUsedEntities } = useEntitiesProvider()

  const filteredEntites = React.useMemo(() => {
    if (hideUsedEntities || !bodyData) {
      return bodyData
    } else {
      if (bodyData.type === 'MOVIE') {
        const filter = bodyData.combined.filter((entity) => {
          const isEndPoint = end.id === entity.id
          const added = entity.already_added
          const disabled = !isEndPoint && (added || !entity.can_be_picked)
          return disabled === false
        })

        return { type: bodyData.type, combined: filter }
      } else {
        const filter = bodyData.combined.filter((entity) => {
          const isEndPoint = end.id === entity.id
          const added = entity.already_added
          const disabled = !isEndPoint && (added || !entity.can_be_picked)
          return disabled === false
        })

        return { type: 'PERSON' as const, combined: filter }
      }
    }
  }, [hideUsedEntities, bodyData])

  return (
    <div className="mx-1">
      {isLoading && (
        <div className="flex justify-center">
          <Spinner />
        </div>
      )}
      {error && <div>{error.message}</div>}
      {filteredEntites?.type === 'MOVIE' && data?.type === 'MOVIE' && (
        <GridLayout
          details={data}
          memoData={filteredEntites}
          changeController={changeController}
          end={end}
        />
      )}
      {filteredEntites?.type === 'PERSON' && data?.type === 'PERSON' && (
        <GridLayout
          details={data}
          memoData={filteredEntites}
          changeController={changeController}
          end={end}
        />
      )}
    </div>
  )
}

type GridLayoutProps = {
  memoData: TReturnReformatTable
  changeController: (move: TMove) => void
  details: TReturnUseCredits['data']
  end: TController
}
const GridLayout = ({
  memoData,
  changeController,
  details,
  end,
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
      <Grid gap={'lg'}>
        {memoData?.type === 'PERSON' &&
          memoData.combined.map((curr) => {
            const id = curr.id
            const title = curr.title
            const posterUrl = curr.poster_url

            const date =
              curr.person_type === 'crew' ? curr.release_date : curr.date
            const added = curr.already_added

            const isEndPoint = end.id === curr.id
            const disabled = !isEndPoint && (added || !curr.can_be_picked)
            const jobs =
              curr.person_type === 'crew' ? [...new Set(curr.jobs)] : []
            return (
              <Grid.Col key={id} span={{ base: 4, md: 3, lg: 2 }}>
                <div
                  className={classes.imageLift}
                  onClick={() => {
                    if (disabled) return
                    changeController(personRowToMove(curr))
                  }}
                >
                  <Poster
                    posterPath={posterUrl}
                    id={id.toString()}
                    showExpand={false}
                    hd={true}
                    overlay={disabled}
                  />
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
                  {curr.person_type === 'cast' && curr.role && (
                    <Text
                      c="dimmed"
                      className={classes.movieInfo}
                      size="xs"
                      title={curr.role}
                    >
                      as {curr.role}
                    </Text>
                  )}
                  {jobs.length > 0 && (
                    <Text
                      c="dimmed"
                      className={classes.movieInfo}
                      size="xs"
                      title={jobs.join(', ')}
                    >
                      {jobs.map((job) => displayCrew(job)).join(', ')}
                    </Text>
                  )}
                </div>
              </Grid.Col>
            )
          })}

        {memoData?.type === 'MOVIE' &&
          memoData.combined.map((person, indx) => {
            const { already_added, can_be_picked, id, name, profile_url } =
              person

            const meta =
              TRACKER_META[person.person_type === 'cast' ? 'CAST' : 'CREW']

            const isEndPoint = end.id === person.id

            const disabled = !isEndPoint && (already_added || !can_be_picked)
            const blockedReason = already_added
              ? 'Used'
              : can_be_picked
                ? null
                : 'None left'

            return (
              <Grid.Col
                key={`${indx}-${person.id}`}
                span={{ base: 4, md: 3, lg: 2 }}
              >
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
                    changeController(movieRowToMove(person))
                  }}
                >
                  <Poster
                    posterPath={profile_url}
                    id={id.toString()}
                    showExpand={false}
                    hd={true}
                    overlay={disabled}
                  />

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
                      {[
                        ...new Set(person.jobs.map((job) => displayCrew(job))),
                      ].join(', ')}
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
