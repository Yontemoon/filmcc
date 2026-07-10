import { createFileRoute } from '@tanstack/react-router'
import useGame from '#/hooks/use-game'

export const Route = createFileRoute('/test')({
  component: RouteComponent,
})

function RouteComponent() {
  const {
    changeController,
    query: { isLoading, data: current, error },
    history,
  } = useGame()

  return (
    <div>
      <div className="flex gap-3">
        {history.map((ids, i) => {
          return <div key={i}>{ids.id}</div>
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
                    {credit.title} -- {credit.character}
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
                    {crew.title} -- {crew.job} -- {crew.department}
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
