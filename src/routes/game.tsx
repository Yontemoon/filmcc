import { createFileRoute, Link } from '@tanstack/react-router'
import useGame from '#/hooks/use-game'
import { Modal, Group } from '@mantine/core'
import Button from '#/components/ui/button'
import Timer from '#/components/timer'
import { formatTime } from '#/library/utils'
import type { TController } from '#/types/client.types'
import { fetchCreateGame } from '#/library/server'
import ProfileImage from '#/components/profile-image'
import Spinner from '#/components/ui/spinner'
import PosterImage from '#/components/poster-image'
import { CircleCheck } from 'lucide-react'
import History from '#/components/pages/game/history'

const DEMO = {
  start: {
    type: 'MOVIE',
    id: 73,
    label: 'American History X',
  },
  end: { id: 5655, type: 'PERSON', label: 'Wes Anderson' },
} as { start: TController; end: TController }

const USE_DEMO = true as boolean

// const reformatForTable = (data: TUseCreditsResults['data']) => {
//   if (!data) {
//     return
//   }

//   if (data.type === 'movie') {
//     const castCredits = data.credits.cast.map((cast) => {
//       return {
//         id: cast.id,
//         name: cast.name,
//         character: cast.character,
//         profile_url: cast.profile_path,
//       }
//     })

//     const crewCredits = data.credits.crew.map((crew) => {
//       return {
//         id: crew.id,
//         department: crew.department,
//         job: crew.job,
//         profile_url: crew.profile_path,
//       }
//     })
//     return {
//       crew: crewCredits,
//       cast: castCredits,
//     }
//   } else {
//     const castCredits = data.credits.cast.map((credit) => {
//       return {
//         date: credit.release_date,
//         title: credit.title,
//         role: credit.character,
//         poster: credit.poster_path,
//         id: credit.id,
//       }
//     })

//     const crewCredits = data.credits.crew.map((crew) => {
//       return {
//         id: crew.id,
//         title: crew.title,
//         poster_url: crew.poster_path,
//         job: crew.job,
//         department: crew.department,
//       }
//     })
//     return { crew: crewCredits, cast: castCredits }
//   }
// }

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
    changeController,
    query: { isLoading, data: current, error },
    history,
    gameOver,
    stats,
    time,
  } = useGame(controllerInformation)
  console.log(current)

  // const memoTableData = useMemo(() => {
  //   return reformatForTable(current)
  // }, [current])

  return (
    <Group>
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
        <div className="w-full grid grid-cols-2 gap-2">
          <Button className="w-full">Stay & Explore</Button>
          <Link to={'/'} className="w-full">
            <Button>Go back</Button>
          </Link>
        </div>
      </Modal>
      <div className="mx-auto max-w-275 w-full my-0 flex flex-col min-h-screen">
        {isLoading && (
          <div className="flex justify-center">
            <Spinner />
          </div>
        )}
        {error && <div>{error.message}</div>}
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
          {/* IF A MOVIE PAGE IS SHOWN */}
          {current?.type === 'MOVIE' && (
            <div>
              <h1>{current.details.title}</h1>
              <div className=" mx-auto px-10 grid md:grid-cols-2 w-full gap-5">
                <div className="space-y-3">
                  {current.credits.cast.map((credit) => {
                    const isUsed = history
                      .filter((val) => val.type === 'PERSON')
                      .find((val) => val.id === credit.id)
                    return (
                      <div
                        key={credit.credit_id}
                        className="flex justify-between"
                      >
                        <div className="flex gap-2">
                          <ProfileImage
                            creditId={credit.credit_id}
                            profilePath={credit.profile_path}
                            onClick={() => {
                              changeController({
                                id: credit.id,
                                type: 'PERSON',
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
                                  type: 'PERSON',
                                  label: credit.name,
                                })
                              }}
                            >
                              {credit.name}
                            </div>
                            <div className="text-sm">{credit.character}</div>
                          </div>
                        </div>

                        {isUsed && (
                          <div>
                            <CircleCheck className="text-red-500" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className="space-y-3">
                  {current.credits.crew.map((crew) => {
                    const isUsed = history
                      .filter((val) => val.type === 'PERSON')
                      .find((val) => val.id === crew.id)
                    return (
                      <div
                        className="flex justify-between w-full"
                        key={crew.credit_id}
                      >
                        <div className="flex gap-2">
                          <ProfileImage
                            creditId={crew.credit_id}
                            profilePath={crew.profile_path}
                            onClick={() => {
                              changeController({
                                id: crew.id,
                                type: 'PERSON',
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
                                  type: 'PERSON',
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
                        {isUsed && (
                          <div>
                            <CircleCheck className="text-red-500" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* IF A PERSON (ACTOR/PERSON) IS SHOWN */}
          {current?.type === 'PERSON' && (
            <div>
              <h1>{current.details.name}</h1>
              <div className=" mx-auto px-10 grid md:grid-cols-2 w-full gap-5 text-sm">
                <div className="space-y-3">
                  {current.credits.cast.map((credit) => {
                    const isUsed = history
                      .filter((val) => val.type === 'MOVIE')
                      .find((val) => val.id === credit.id)
                    return (
                      <div className="flex gap-2 w-full" key={credit.credit_id}>
                        <div className="flex justify-between w-full">
                          <div className="flex gap-2">
                            <PosterImage
                              id={credit.id.toString()}
                              posterPath={credit.poster_path}
                              onClick={() => {
                                changeController({
                                  id: credit.id,
                                  type: 'MOVIE',
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
                                    type: 'MOVIE',
                                    label: credit.title,
                                  })
                                }}
                              >
                                {credit.title}
                              </div>

                              {credit.release_date && (
                                <div>
                                  {new Date(credit.release_date).getFullYear()}
                                </div>
                              )}
                            </div>
                          </div>
                          {isUsed && (
                            <div>
                              <CircleCheck className="text-red-500" />
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="space-y-3">
                  {current.credits.crew.map((crew, idx) => {
                    const isUsed = history
                      .filter((val) => val.type === 'MOVIE')
                      .find((val) => val.id === crew.id)
                    return (
                      <div className="flex gap-2" key={`${idx}-${crew.id}`}>
                        <div className="flex justify-between w-full">
                          <div className="flex gap-2">
                            <PosterImage
                              key={`${idx}-${crew.id}`}
                              id={crew.id.toString()}
                              posterPath={crew.poster_path}
                              onClick={() => {
                                changeController({
                                  id: crew.id,
                                  type: 'MOVIE',
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
                                    type: 'MOVIE',
                                    label: crew.title,
                                  })
                                }}
                              >
                                {crew.title}
                              </div>

                              <div className="text-sm">{crew.job}</div>
                              {/* <div>{crew.release_date}</div> */}
                            </div>
                          </div>

                          {isUsed && (
                            <div>
                              <CircleCheck className="text-red-500" />
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <History history={history} />
      </div>
    </Group>
  )
}
