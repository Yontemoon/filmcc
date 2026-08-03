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
import type { TMovieCastCol, TMovieCrewCol, TPersonCrewCol } from './types'
import PosterImage from '#/components/poster/poster'
import { Text, Tabs, Grid, Group } from '@mantine/core'
import { displayYear } from '#/lib/utils'
import ColorSwatch from '#/components/ui/color-swatch/color-swatch'
import classes from './game.module.css'
import type { ReturnGetUserGameId } from '#/lib/server/game'

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
  console.log(memoTableData)
  return (
    <div className="">
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
      }
    | undefined
  changeController: (data: TController) => void
}
const GridLayout = ({
  memoData,
  changeController,
  details,
}: GridLayoutProps) => {
  const [activeTab, setActiveTab] = React.useState<string | null>('CREW')
  React.useEffect(() => {
    if (details)
      setActiveTab(() => {
        return details.details.known_for_department === 'Acting'
          ? 'CAST'
          : 'CREW'
      })
  }, [details])

  const castCreditLength = details?.credits.cast.length
  const crewCreditLength = details?.credits.crew.length

  return (
    <Tabs value={activeTab} onChange={setActiveTab}>
      <Tabs.List>
        <Tabs.Tab value="CAST" disabled={castCreditLength === 0}>
          Cast ({castCreditLength})
        </Tabs.Tab>
        <Tabs.Tab value="CREW" disabled={crewCreditLength === 0}>
          Crew ({crewCreditLength})
        </Tabs.Tab>
      </Tabs.List>
      <div className="py-7">
        <Tabs.Panel value="CAST">
          <Grid>
            {memoData?.type === 'PERSON' &&
              memoData.cast.map((movie) => {
                const added = movie.already_added
                return (
                  <Grid.Col key={movie.id} span={{ base: 4, md: 3, lg: 1.5 }}>
                    <div
                      className={classes.imageLift}
                      onClick={() => {
                        changeController({
                          id: movie.id,
                          type: 'MOVIE',
                          label: movie.title,
                          img_path: movie.poster_url,
                        })
                      }}
                    >
                      <PosterImage
                        posterPath={movie.poster_url}
                        id={movie.id.toString()}
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
                        {movie.title}
                      </Text>
                      <Text c="dimmed" className={classes.movieInfo} size="xs">
                        {movie.date && displayYear(movie.date)}
                        {movie.date && ' ·'} {movie.role}
                      </Text>
                    </div>
                  </Grid.Col>
                )
              })}
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="CREW">
          <Grid>
            {memoData?.type === 'PERSON' &&
              memoData.crew.map((movie) => {
                const added = movie.already_added

                return (
                  <Grid.Col key={movie.id} span={{ base: 4, md: 2, lg: 1.5 }}>
                    <div
                      className={classes.imageLift}
                      onClick={() => {
                        changeController({
                          id: movie.id,
                          type: 'MOVIE',
                          label: movie.title,
                          img_path: movie.poster_url,
                        })
                      }}
                    >
                      <PosterImage
                        posterPath={movie.poster_url}
                        id={movie.id.toString()}
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
                        {movie.title}
                      </Text>
                      <Text c="dimmed" className={classes.movieInfo} size="xs">
                        {movie.release_date && displayYear(movie.release_date)}
                        {movie.release_date && ' ·'} {movie.job}
                      </Text>
                    </div>
                  </Grid.Col>
                )
              })}
          </Grid>
        </Tabs.Panel>
      </div>
    </Tabs>
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
