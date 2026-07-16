import type { TMovieController, TPersonController } from '#/types/client.types'
import PosterImage from '#/components/poster-image'
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

              if (type === 'MOVIE') {
                if (indx === lastIndx) {
                  return (
                    <div key={curr.id}>
                      <div>Score: {indx + 1}</div>
                      <PosterImage
                        className="w-10 h-15"
                        posterPath={curr.details.poster_path}
                        id={curr.id.toString()}
                      />
                    </div>
                  )
                } else {
                  return (
                    <div key={curr.id} className="flex items-center">
                      <Line />
                      <div>
                        <div>Score: {indx + 1}</div>
                        <PosterImage
                          className="w-10 h-15"
                          posterPath={curr.details.poster_path}
                          id={curr.id.toString()}
                        />
                      </div>
                    </div>
                  )
                }
              } else {
                if (indx === 0 || indx === lastIndx) {
                  return (
                    <div key={curr.id}>
                      <div>Score: {indx + 1}</div>
                      <ProfileImage
                        key={curr.id}
                        className="w-10 h-15"
                        profilePath={curr.details.profile_path}
                        creditId={`${curr.id}-${indx}`}
                      />
                    </div>
                  )
                } else {
                  return (
                    <div key={curr.id} className="flex items-center">
                      <Line />
                      <div>
                        <div>Score: {indx + 1}</div>
                        <ProfileImage
                          className="w-10 h-15"
                          profilePath={curr.details.profile_path}
                          creditId={`${curr.id}-${indx}`}
                        />
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
