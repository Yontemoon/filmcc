import { createFileRoute, Link } from '@tanstack/react-router'
import useGame from '#/hooks/use-game'
import { Modal } from '@mantine/core'
import Button from '#/components/ui/button'
import Timer from '#/components/timer'
import { formatTime } from '#/library/utils'
import type { TController } from '#/types/client.types'
import { fetchCreateGame } from '#/library/server'

const DEMO = {
  start: {
    type: 'movie',
    id: 73,
    label: 'American History X',
  },
  end: { id: 5655, type: 'person', label: 'Wes Anderson' },
} as { start: TController; end: TController }

const USE_DEMO = true as boolean

export const Route = createFileRoute('/test')({
  component: RouteComponent,
  loader: async () => {
    return fetchCreateGame()
  },
  pendingComponent: () => {
    return <div>Loading...</div>
  },
})

function RouteComponent() {
  const data = Route.useLoaderData()

  const controllerInformation = USE_DEMO
    ? DEMO
    : ({
        start: { id: data?.start.id, label: data?.start.title, type: 'movie' },
        end: { id: data?.end.id, label: data?.end.name, type: 'person' },
      } as { start: TController; end: TController })

  const {
    changeController,
    query: { isLoading, data: current, error },
    history,
    gameOver,
    stats,
    time,
  } = useGame(controllerInformation)

  return (
    <div>
      <div>Start: {controllerInformation.start.label}</div>
      <div>End: {controllerInformation.end.label}</div>
      <Timer
        getElapsedMs={time.getElapsedMs}
        finalElapsedMs={time.finalTime}
        isRunning={time.isTimerRunning}
      />
      <Modal
        opened={gameOver}
        withCloseButton={false}
        onClose={() => {
          console.log('Closing Modal')
        }}
        centered
        title={'You finished!'}
      >
        <h2>Stats</h2>
        <p>count: {stats.count}</p>
        <p>time: {formatTime(stats.time)}</p>

        <Link to={'/'}>
          <Button>Go back</Button>
        </Link>
      </Modal>
      <div className="flex gap-3">
        {history.map((ids, i) => {
          return <div key={i}>{ids.label}</div>
        })}
      </div>
      {isLoading && <div>Loading...</div>}
      {error && <div>{error.message}</div>}

      {/* IF A MOVIE PAGE IS SHOWN */}
      {current?.type === 'movie' && (
        <div>
          <h1>{current.details.title}</h1>
          <div className=" mx-auto px-10 grid md:grid-cols-2 w-full gap-5">
            <div>
              {current.credits.cast.map((credit) => {
                return (
                  <div
                    className="hover:underline hover:cursor-pointer"
                    key={credit.credit_id}
                    onClick={() => {
                      changeController({
                        id: credit.id,
                        type: 'person',
                        label: credit.name,
                      })
                    }}
                  >
                    {credit.name} -- {credit.character}
                  </div>
                )
              })}
            </div>
            <div>
              {current.credits.crew.map((crew) => {
                return (
                  <div
                    className="hover:underline hover:cursor-pointer"
                    key={crew.credit_id}
                    onClick={() => {
                      changeController({
                        id: crew.id,
                        type: 'person',
                        label: crew.name,
                      })
                    }}
                  >
                    {crew.name} -- {crew.known_for_department} --{' '}
                    {crew.department}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* IF A PERSON (ACTOR/PERSON) IS SHOWN */}
      {current?.type === 'person' && (
        <div>
          <h1>{current.details.name}</h1>
          <div className=" mx-auto px-10 grid md:grid-cols-2 w-full gap-5">
            <div>
              {current.credits.cast.map((credit) => {
                return (
                  <div
                    className="hover:underline hover:cursor-pointer"
                    key={credit.credit_id}
                    onClick={() => {
                      changeController({
                        id: credit.id,
                        type: 'movie',
                        label: credit.title,
                      })
                    }}
                  >
                    {credit.title} -- {credit.character} --{' '}
                    {credit.release_date}
                  </div>
                )
              })}
            </div>
            <div>
              {current.credits.crew.map((crew, idx) => {
                return (
                  <div
                    className="hover:underline hover:cursor-pointer"
                    key={idx}
                    onClick={() => {
                      changeController({
                        id: crew.id,
                        type: 'movie',
                        label: crew.title,
                      })
                    }}
                  >
                    {crew.title} -- {crew.job} -- {crew.department} --{' '}
                    {crew.release_date}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
