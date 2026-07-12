import { createFileRoute, Link } from '@tanstack/react-router'
import useGame from '#/hooks/use-game'
import { Modal } from '@mantine/core'
import Button from '#/components/ui/button'
import Timer from '#/components/timer'
import { formatTime } from '#/library/utils'
import type { TController } from '#/types/client.types'
import { fetchCreateGame } from '#/library/server'
import type { TUseCreditsResults } from '#/hooks/hooks.types'
import ProfileImage from '#/components/profile-image'
import PosterImage from '#/components/poster-image'

const DEMO = {
  start: {
    type: 'movie',
    id: 73,
    label: 'American History X',
  },
  end: { id: 5655, type: 'person', label: 'Wes Anderson' },
} as { start: TController; end: TController }

const USE_DEMO = true as boolean

const reformatForTable = (data: TUseCreditsResults['data']) => {
  if (!data) {
    return
  }

  if (data.type === 'movie') {
    const castCredits = data.credits.cast.map((cast) => {
      return {
        id: cast.id,
        name: cast.name,
        character: cast.character,
        profile_url: cast.profile_path,
      }
    })

    const crewCredits = data.credits.crew.map((crew) => {
      return {
        id: crew.id,
        department: crew.department,
        job: crew.job,
        profile_url: crew.profile_path,
      }
    })
    return {
      crew: crewCredits,
      cast: castCredits,
    }
  } else {
    const castCredits = data.credits.cast.map((credit) => {
      return {
        date: credit.release_date,
        title: credit.title,
        role: credit.character,
        poster: credit.poster_path,
        id: credit.id,
      }
    })

    const crewCredits = data.credits.crew.map((crew) => {
      return {
        id: crew.id,
        title: crew.title,
        poster_url: crew.poster_path,
        job: crew.job,
        department: crew.department,
      }
    })
    return { crew: crewCredits, cast: castCredits }
  }
}

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

  // const memoTableData = useMemo(() => {
  //   return reformatForTable(current)
  // }, [current])

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
      <div className="flex gap-2">
        <div>History:</div>
        {history.map((ids, i) => {
          return <div key={i}>{ids.label}</div>
        })}
      </div>
      {isLoading && <div>Loading...</div>}
      {error && <div>{error.message}</div>}

      {/* IF A MOVIE PAGE IS SHOWN */}
      {/* {current?.type === 'person' && personTableData && (
        <div className="grid md:grid-cols-2 gap-4 mx-auto px-4 grid-cols-1">
          <TableSort
            data={personTableData}
            onTitleClick={(id, type, label) => {
              changeController({
                id: id,
                type: type,
                label: label,
              })
            }}
          />
        </div>
      )} */}
      {current?.type === 'movie' && (
        <div>
          <h1>{current.details.title}</h1>
          <div className=" mx-auto px-10 grid md:grid-cols-2 w-full gap-5">
            <div className="space-y-3">
              {current.credits.cast.map((credit) => {
                return (
                  <div key={credit.credit_id} className="flex gap-2">
                    <ProfileImage
                      creditId={credit.credit_id}
                      profilePath={credit.profile_path}
                      onClick={() => {
                        changeController({
                          id: credit.id,
                          type: 'person',
                          label: credit.name,
                        })
                      }}
                    />
                    <div>
                      <div
                        className="hover:cursor-pointer hover:underline text-lg"
                        onClick={() => {
                          changeController({
                            id: credit.id,
                            type: 'person',
                            label: credit.name,
                          })
                        }}
                      >
                        {credit.name}
                      </div>
                      <div className="text-sm">{credit.character}</div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="space-y-3">
              {current.credits.crew.map((crew) => {
                return (
                  <div className="flex gap-2" key={crew.credit_id}>
                    <ProfileImage
                      creditId={crew.credit_id}
                      profilePath={crew.profile_path}
                      onClick={() => {
                        changeController({
                          id: crew.id,
                          type: 'person',
                          label: crew.name,
                        })
                      }}
                    />
                    <div>
                      <div
                        className="hover:cursor-pointer hover:underline text-lg"
                        onClick={() => {
                          changeController({
                            id: crew.id,
                            type: 'person',
                            label: crew.name,
                          })
                        }}
                      >
                        {crew.name}
                      </div>
                      <div className="text-sm">
                        {crew.known_for_department} -- {crew.job}
                      </div>
                    </div>
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
            <div className="space-y-3">
              {current.credits.cast.map((credit) => {
                return (
                  <div className="flex gap-2" key={credit.credit_id}>
                    <PosterImage
                      id={credit.id.toString()}
                      posterPath={credit.poster_path}
                      onClick={() => {
                        changeController({
                          id: credit.id,
                          type: 'movie',
                          label: credit.title,
                        })
                      }}
                    />

                    <div>
                      <div
                        className="text-lg hover:cursor-pointer hover:underline"
                        onClick={() => {
                          changeController({
                            id: credit.id,
                            type: 'movie',
                            label: credit.title,
                          })
                        }}
                      >
                        {credit.title}{' '}
                        {credit.release_date && (
                          <span>
                            ({new Date(credit.release_date).getFullYear()})
                          </span>
                        )}
                      </div>
                      <div className="text-sm">{credit.character}</div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="space-y-3">
              {current.credits.crew.map((crew, idx) => {
                return (
                  <div className="flex gap-2" key={`${idx}-${crew.id}`}>
                    <PosterImage
                      id={crew.id.toString()}
                      posterPath={crew.poster_path}
                      onClick={() => {
                        changeController({
                          id: crew.id,
                          type: 'movie',
                          label: crew.title,
                        })
                      }}
                    />

                    <div>
                      <div
                        className="text-lg hover:cursor-pointer hover:underline"
                        onClick={() => {
                          changeController({
                            id: crew.id,
                            type: 'movie',
                            label: crew.title,
                          })
                        }}
                      >
                        {crew.title}
                      </div>
                      <div className="text-sm">{crew.job}</div>
                      <div>{crew.release_date}</div>
                    </div>
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
