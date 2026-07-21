import type { TMovieController, TPersonController } from '#/types/client.types'
import PosterImage from '#/components/poster/poster'
import ProfileImage from '#/components/profile-image'
import { ScrollArea } from '@mantine/core'

type PropTypes = {
  history: (TMovieController | TPersonController)[]
}

const Line = () => {
  return <div className="border border-black w-8" />
}

const History = ({ history }: PropTypes) => {
  const lastIndx = history.length - 1

  return (
    <div
      id="footer"
      className="fixed bottom-0 right-0 left-0 h-30 bg-olive-400 sm:px-20 px-5"
    >
      <ScrollArea>
        <div className="flex gap-2 items-center px-2 py-2 h-full text-xs">
          <div className="flex flex-row-reverse">
            {history.map((curr, indx) => {
              const type = curr.type
              const start = indx === 0
              if (type === 'MOVIE') {
                if (indx === lastIndx) {
                  return (
                    <div key={curr.id}>
                      <div>{start ? 'Start' : indx}</div>
                      <div className="w-10 h-15">
                        {' '}
                        <PosterImage
                          posterPath={curr.details.poster_path}
                          id={curr.id.toString()}
                        />
                      </div>
                    </div>
                  )
                } else {
                  return (
                    <div key={curr.id} className="flex items-center">
                      <Line />
                      <div>
                        <div>{start ? 'Start' : indx}</div>
                        <div className="w-10 h-15">
                          <PosterImage
                            posterPath={curr.details.poster_path}
                            id={curr.id.toString()}
                          />
                        </div>
                      </div>
                    </div>
                  )
                }
              } else {
                if (indx === 0 || indx === lastIndx) {
                  return (
                    <div key={curr.id}>
                      <div>{start ? 'Start' : indx}</div>
                      <div className="w-10 h-15">
                        <ProfileImage
                          profilePath={curr.details.profile_path}
                          creditId={`${curr.id}-${indx}`}
                        />
                      </div>
                    </div>
                  )
                } else {
                  return (
                    <div key={curr.id} className="flex items-center">
                      <Line />
                      <div>
                        <div>{indx}</div>
                        <div className="w-10 h-15">
                          <ProfileImage
                            profilePath={curr.details.profile_path}
                            creditId={`${curr.id}-${indx}`}
                          />
                        </div>
                      </div>
                    </div>
                  )
                }
              }
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

export default History
