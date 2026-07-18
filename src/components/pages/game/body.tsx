import React from 'react'
import Spinner from '#/components/ui/spinner'
import DataTable from '#/components/ui/table/headless-table'
import type { UseQueryResult } from '@tanstack/react-query'
import {
  movieCastCol,
  movieCrewCol,
  personCastCol,
  personCrewCol,
} from './columns'
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
import PosterImage from '#/components/poster-image'
import { HoverCard, Text, Group } from '@mantine/core'
import { displayYear } from '#/library/utils'

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

      {memoTableData?.type === 'MOVIE' ? (
        <TableLayout
          details={data}
          memoData={memoTableData}
          changeController={changeController}
        />
      ) : (
        <GridLayout
          details={data}
          memoData={memoTableData}
          changeController={changeController}
        />
      )}
    </div>
  )
}

type LayoutProps = {
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
const GridLayout = ({ memoData, changeController, details }: LayoutProps) => {
  const showCastFirst =
    details?.type === 'PERSON' &&
    details.details.known_for_department === 'Acting'
  return (
    <div className="grid md:grid-cols-6 grid-cols-3 gap-2">
      {showCastFirst &&
        memoData?.type === 'PERSON' &&
        memoData.cast.map((movie) => {
          return (
            <div
              key={movie.id}
              onClick={() => {
                changeController({
                  id: movie.id,
                  type: 'MOVIE',
                  label: movie.title,
                })
              }}
            >
              <Group>
                <HoverCard
                  openDelay={100}
                  withArrow
                  position="top"
                  arrowSize={15}
                >
                  <HoverCard.Target>
                    <PosterImage
                      posterPath={movie.poster_url}
                      id={movie.id.toString()}
                      className="w-full h-full"
                      showExpand={false}
                      hd={true}
                    />
                  </HoverCard.Target>
                  <HoverCard.Dropdown>
                    <Text size="sm">
                      {movie.title} ({movie.date && displayYear(movie.date)}){' '}
                      {movie.role && 'as '}
                      {movie.role && movie.role}
                    </Text>
                  </HoverCard.Dropdown>
                </HoverCard>
              </Group>
            </div>
          )
        })}
      {!showCastFirst &&
        memoData?.type === 'PERSON' &&
        memoData.crew.map((movie) => {
          return (
            <div
              key={movie.id}
              onClick={() => {
                changeController({
                  id: movie.id,
                  type: 'MOVIE',
                  label: movie.title,
                })
              }}
            >
              <Group>
                <HoverCard
                  openDelay={100}
                  withArrow
                  position="top"
                  arrowSize={15}
                >
                  <HoverCard.Target>
                    <PosterImage
                      posterPath={movie.poster_url}
                      id={movie.id.toString()}
                      className="w-full h-full"
                      showExpand={false}
                      hd={true}
                    />
                  </HoverCard.Target>
                  <HoverCard.Dropdown>
                    <Text size="sm">
                      {movie.title} (
                      {movie.release_date && displayYear(movie.release_date)}){' '}
                      {movie.job && 'as '}
                      {movie.job && movie.job}
                    </Text>
                  </HoverCard.Dropdown>
                </HoverCard>
              </Group>
            </div>
          )
        })}
    </div>
  )
}

const TableLayout = ({ memoData, changeController }: LayoutProps) => {
  return (
    <>
      {memoData?.type === 'MOVIE' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 ">
          <DataTable
            data={memoData.cast}
            columns={movieCastCol}
            onClickName={(rowData) => {
              changeController({
                id: rowData.id,
                type: 'PERSON',
                label: rowData.name,
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
              })
            }}
          />
        </div>
      )}
      {memoData?.type === 'PERSON' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 ">
          <DataTable
            data={memoData.cast}
            columns={personCastCol}
            onClickName={(rowData) => {
              changeController({
                id: rowData.id,
                type: 'MOVIE',
                label: rowData.title,
              })
            }}
          />
          <DataTable
            data={memoData.crew}
            columns={personCrewCol}
            onClickName={(rowData) => {
              changeController({
                id: rowData.id,
                type: 'MOVIE',
                label: rowData.title,
              })
            }}
          />
        </div>
      )}
    </>
  )
}

export default MainBody
