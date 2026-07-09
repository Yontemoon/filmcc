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
          <div className=" mx-auto px-10 grid md:grid-cols-2 w-full gap-5">
            <div>
              {current.cast.map((credit) => {
                return (
                  <div
                    className="hover:underline hover:cursor-pointer"
                    key={credit.credit_id}
                    onClick={() => {
                      changeController({
                        id: credit.id,
                        type: 'person',
                      })
                    }}
                  >
                    {credit.name} -- {credit.character}
                  </div>
                )
              })}
            </div>
            <div>
              {current.crew.map((crew) => {
                return (
                  <div
                    className="hover:underline hover:cursor-pointer"
                    key={crew.credit_id}
                    onClick={() => {
                      changeController({
                        id: crew.id,
                        type: 'person',
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
          <div className=" mx-auto px-10 grid md:grid-cols-2 w-full gap-5">
            <div>
              {current.cast.map((credit) => {
                return (
                  <div
                    className="hover:underline hover:cursor-pointer"
                    key={credit.credit_id}
                    onClick={() => {
                      changeController({
                        id: credit.id,
                        type: 'movie',
                      })
                    }}
                  >
                    {credit.title} -- {credit.character}
                  </div>
                )
              })}
            </div>
            <div>
              {current.crew.map((crew, idx) => {
                return (
                  <div
                    className="hover:underline hover:cursor-pointer"
                    key={idx}
                    onClick={() => {
                      changeController({
                        id: crew.id,
                        type: 'movie',
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
