import React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import useGame from '#/hooks/use-game'
import { Modal, Group } from '@mantine/core'
import Button from '#/components/ui/button'
import Timer from '#/components/timer'
import { formatTime } from '#/library/utils'
import type { TController } from '#/types/client.types'
import { fetchCreateGame } from '#/library/server'
import Spinner from '#/components/ui/spinner'
import History from '#/components/pages/game/history'
import DataTable from '#/components/ui/table/headless-table'
import {
  movieCastCol,
  movieCrewCol,
  personCastCol,
  personCrewCol,
} from '#/components/pages/game/columns'
import { reformatForTable } from '#/components/pages/game/utils'
import { DEMO } from '#/library/constants'

const USE_DEMO = false as boolean

export const Route = createFileRoute('/game')({
  component: RouteComponent,
  loader: async () => {
    return fetchCreateGame()
  },
  pendingComponent: () => {
    return (
      <div className="flex justify-center">
        <Spinner />
      </div>
    )
  },
})

function RouteComponent() {
  const data = Route.useLoaderData()

  const controllerInformation = USE_DEMO
    ? DEMO
    : ({
        start: { id: data?.start.id, label: data?.start.title, type: 'MOVIE' },
        end: { id: data?.end.id, label: data?.end.name, type: 'PERSON' },
      } as { start: TController; end: TController })

  const {
    startGame,
    changeController,
    stayInGame,
    query: { isLoading, data: current, error },
    history,
    gameState,
    stats,
    time,
  } = useGame(controllerInformation)

  const memoTableData = React.useMemo(() => {
    return reformatForTable(current, history)
  }, [current, history])

  return (
    <Group>
      <Modal
        opened={gameState === 'START'}
        onClose={() => {
          console.log('passing here')
        }}
        centered
        title={'You are about to start!'}
      >
        <h2>Are you ready?</h2>
        <p>
          You are on {controllerInformation.start.label} and have to get to{' '}
          {controllerInformation.end.label}
        </p>

        <div className="w-full grid grid-cols-2 gap-2">
          <Button
            className="w-full"
            onClick={() => {
              startGame()
            }}
          >
            I am ready!
          </Button>
          <Link to={'/'} className="w-full">
            <Button>Go back</Button>
          </Link>
        </div>
      </Modal>
      <Modal
        opened={gameState === 'END'}
        onClose={() => {
          stayInGame()
        }}
        centered
        title={'You finished!'}
      >
        <h2>Stats</h2>
        <p>count: {stats.count}</p>
        <p>time: {formatTime(stats.time)}</p>
        <div className="w-full grid grid-cols-2 gap-2">
          <Button
            className="w-full"
            onClick={() => {
              stayInGame()
            }}
          >
            Stay & Explore
          </Button>
          <Link to={'/'} className="w-full">
            <Button>Go back</Button>
          </Link>
        </div>
      </Modal>
      <div className="mx-auto max-w-275 w-full my-0 flex flex-col min-h-screen">
        <div id="header">
          <div>Start: {controllerInformation.start.label}</div>
          <div>End: {controllerInformation.end.label}</div>
          <Timer
            getElapsedMs={time.getElapsedMs}
            finalElapsedMs={time.finalTime}
            isRunning={time.isTimerRunning}
          />
        </div>

        <div className="flex-1" id="main-body">
          {isLoading && (
            <div className="flex justify-center">
              <Spinner />
            </div>
          )}
          {error && <div>{error.message}</div>}

          {memoTableData?.type === 'MOVIE' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 ">
              <DataTable
                data={memoTableData.cast}
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
                data={memoTableData.crew}
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
          {memoTableData?.type === 'PERSON' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 ">
              <DataTable
                data={memoTableData.cast}
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
                data={memoTableData.crew}
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
        </div>

        <History history={history} />
      </div>
    </Group>
  )
}
