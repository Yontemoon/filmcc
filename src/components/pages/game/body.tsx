import React from 'react'

import Spinner from '#/components/ui/spinner'
import DataTable from '#/components/ui/table/headless-table'
import type { UseQueryResult } from '@tanstack/react-query'
import { movieCastCol, movieCrewCol } from './columns'
import type {
  T_TMDB_MOVIE_CREDITS,
  T_TMDB_MOVIE_DETAILS,
  T_TMDB_PERSON_CREDITS,
  T_TMDB_PERSON_DETAILS,
} from '#/types/tmdb.types'
import { reformatForTable } from './utils'
import type {
  TController,
  TMovieController,
  TPersonController,
} from '#/types/client.types'
import type { TMovieCrewCol, TPersonCrewCol } from './types'
import PosterImage from '#/components/poster/poster'
import { Text, Tabs } from '@mantine/core'
import { displayYear } from '#/library/utils'
import Hover from '#/components/ui/hover/hover'
import classes from './game.module.css'

type PropTypes = {
  history: (TMovieController | TPersonController)[]
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
          <div className="grid md:grid-cols-6 grid-cols-3 gap-2">
            {memoData?.type === 'PERSON' &&
              memoData.cast.map((movie) => {
                return (
                  <div
                    key={movie.id}
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
                    <Hover
                      trigger={
                        <PosterImage
                          posterPath={movie.poster_url}
                          id={movie.id.toString()}
                          showExpand={false}
                          hd={true}
                        />
                      }
                    >
                      <Text size="xs">
                        {movie.title} ({movie.date && displayYear(movie.date)}){' '}
                        {movie.role && 'as '}
                        {movie.role && movie.role}
                      </Text>
                    </Hover>
                  </div>
                )
              })}
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="CREW">
          <div className="grid md:grid-cols-6 grid-cols-3 gap-2">
            {memoData?.type === 'PERSON' &&
              memoData.crew.map((movie) => {
                return (
                  <div
                    className={classes.imageLift}
                    key={movie.id}
                    onClick={() => {
                      changeController({
                        id: movie.id,
                        type: 'MOVIE',
                        label: movie.title,
                        img_path: movie.poster_url,
                      })
                    }}
                  >
                    <Hover
                      trigger={
                        <PosterImage
                          posterPath={movie.poster_url}
                          id={movie.id.toString()}
                          showExpand={false}
                          hd={true}
                        />
                      }
                    >
                      <Text size="xs">
                        {movie.title} (
                        {movie.release_date && displayYear(movie.release_date)}){' '}
                        {movie.job && 'as '}
                        {movie.job && movie.job}
                      </Text>
                    </Hover>
                  </div>
                )
              })}
          </div>
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
        crew: TMovieCrewCol[]
        cast: {
          id: number
          name: string
          role: string
          profile_url: string
          already_added: boolean
        }[]
      }
    | undefined
  changeController: (data: TController) => void
}

const TableLayout = ({ memoData, changeController }: TableLayoutProps) => {
  return (
    <>
      {memoData?.type === 'MOVIE' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <DataTable
            data={memoData.cast}
            columns={movieCastCol}
            onClickName={(rowData) => {
              changeController({
                id: rowData.id,
                type: 'PERSON',
                label: rowData.name,
                img_path: rowData.profile_url,
              })
            }}
          />
          <DataTable
            data={memoData.crew}
            columns={movieCrewCol}
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
