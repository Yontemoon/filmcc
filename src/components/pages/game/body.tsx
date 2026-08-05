import React from 'react'

import Spinner from '#/components/ui/spinner'
import DataTable from '#/components/ui/table/headless-table'
import type { UseQueryResult } from '@tanstack/react-query'
import { movieCombineCol } from './columns'
import type {
  T_TMDB_MOVIE_CREDITS,
  T_TMDB_MOVIE_DETAILS,
  T_TMDB_PERSON_CREDITS,
  T_TMDB_PERSON_DETAILS,
} from '#/types/tmdb.types'
import { reformatForTable } from './utils'
import type { TController } from '#/types/client.types'
import type {
  TMovieCastCol,
  TMovieCrewCol,
  TPersonCastCol,
  TPersonCrewCol,
} from './types'
import PosterImage from '#/components/poster/poster'
import { Text, Title, Grid, Group } from '@mantine/core'
import { displayYear } from '#/lib/utils'
import ColorSwatch from '#/components/ui/color-swatch/color-swatch'
import classes from './game.module.css'
import type { ReturnGetUserGameId } from '#/lib/server/attempt'

type PropTypes = {
  history: ReturnGetUserGameId['gameMovesLog']
  query: UseQueryResult<
    NoInfer<
      | {
          details: T_TMDB_MOVIE_DETAILS
          credits: T_TMDB_MOVIE_CREDITS
          type: 'MOVIE'
        }
      | {
          details: T_TMDB_PERSON_DETAILS
          credits: T_TMDB_PERSON_CREDITS
          type: 'PERSON'
        }
      | null
    >,
    Error
  >
  changeController: (data: TController) => void
}

const MainBody = ({ history, query, changeController }: PropTypes) => {
  const { isLoading, error, data } = query

  const memoTableData = React.useMemo(() => {
    return reformatForTable(data, history)
  }, [data, history])

  return (
    <div className="mx-1">
      {isLoading && (
        <div className="flex justify-center">
          <Spinner />
        </div>
      )}
      {error && <div>{error.message}</div>}
      {memoTableData?.type === 'MOVIE' && data?.type === 'MOVIE' && (
        <TableLayout
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
  details:
    | {
        details: T_TMDB_PERSON_DETAILS
        credits: T_TMDB_PERSON_CREDITS
        type: 'PERSON'
      }
    | null
    | undefined
  memoData:
    | {
        type: 'PERSON'
        crew: TPersonCrewCol[]
        cast: {
          date: string | null
          title: string
          role: string
          poster_url: string
          id: number
          already_added: boolean
        }[]
        combined: {
          cast: TPersonCastCol | null
          crew: TPersonCrewCol | null
        }[]
      }
    | undefined
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
        {details?.details.name} ({combinedLength})
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
      </Grid>
    </div>
  )
}

type TableLayoutProps = {
  details:
    | {
        details: T_TMDB_MOVIE_DETAILS
        credits: T_TMDB_MOVIE_CREDITS
        type: 'MOVIE'
      }
    | {
        details: T_TMDB_PERSON_DETAILS
        credits: T_TMDB_PERSON_CREDITS
        type: 'PERSON'
      }
    | null
    | undefined
  memoData:
    | {
        type: 'MOVIE'

        combined: (TMovieCastCol | TMovieCrewCol)[]
      }
    | undefined
  changeController: (data: TController) => void
}

const TableLayout = ({ memoData, changeController }: TableLayoutProps) => {
  return (
    <>
      {memoData?.type === 'MOVIE' && (
        <div className="grid grid-cols-1 gap-2">
          <DataTable
            data={memoData.combined}
            columns={movieCombineCol}
            highlightOnHover={false}
            onClickName={(rowData) => {
              changeController({
                id: rowData.id,
                type: 'PERSON',
                label: rowData.name,
                img_path: rowData.profile_url,
              })
            }}
          />
        </div>
      )}
    </>
  )
}

export default MainBody
