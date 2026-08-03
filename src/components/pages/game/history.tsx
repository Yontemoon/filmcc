// import type { TMovieController, TPersonController } from '#/types/client.types'
import PosterImage from '#/components/poster/poster'
import ProfileImage from '#/components/profile-image'
import { ScrollArea, Text } from '@mantine/core'
import type { ReturnGetUserGameId } from '#/lib/server/game'

type HistoryItem = ReturnGetUserGameId['gameMovesLog'][0]

type PropTypes = {
  // history: HistoryItem[]
  gameMoves: ReturnGetUserGameId['gameMovesLog']
}

// Thin connector drawn between consecutive nodes.
const Connector = () => <div className="h-px w-4 shrink-0 bg-black/40" />

const Node = ({ item, indx }: { item: HistoryItem; indx: number }) => {
  const isStart = indx === 0
  const role = item.roleName
  const title = role ? `${item.entity?.label} — ${role}` : item.entity?.label

  return (
    <div
      className="flex w-16 shrink-0 flex-col items-center gap-0.5"
      title={title ? title : ''}
    >
      <Text
        size="10px"
        c="dimmed"
        fw={700}
        tt="uppercase"
        className="leading-none"
      >
        {isStart ? 'Start' : indx}
      </Text>
      {item.entityType === 'MOVIE' ? (
        <div className="h-12 w-8">
          <PosterImage
            posterPath={item.entity?.imgPath}
            id={item.entityId.toString()}
          />
        </div>
      ) : (
        <div className="h-10 w-10">
          <ProfileImage
            profilePath={item.entity?.imgPath}
            creditId={`${item.entityId}-${indx}`}
          />
        </div>
      )}
      <Text
        size="xs"
        fw={600}
        lineClamp={1}
        className="w-full text-center leading-tight"
      >
        {item.entity?.label}
      </Text>
    </div>
  )
}

const History = ({ gameMoves }: PropTypes) => {
  return (
    <div id="footer" className="h-full bg-emerald-200/20 sm:px-20 px-5 ">
      <ScrollArea h="100%" type="hover">
        <div className="flex items-end">
          <div className="flex h-full items-center gap-0 px-2 flex-row-reverse">
            {gameMoves.map((curr, indx) => (
              <div
                key={`${curr.moveIndex}-${indx}`}
                className="flex items-center"
              >
                <Node item={curr} indx={indx} />
                {indx > 0 && <Connector />}
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

export default History
