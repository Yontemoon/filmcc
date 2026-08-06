import { modals } from '@mantine/modals'
import type { ReturnGetUserGameId } from '#/lib/server/attempt'

import PosterImage from '#/components/poster/poster'
import ProfileImage from '#/components/profile-image'
import { ScrollArea, Text } from '@mantine/core'

import { TMDB_IMAGE_POSTER_URL_EXPAND } from '#/lib/constants'
import OpenPersonImageExpand from '#/components/modals/image-expand'

const GameHistory = ({
  history,
}: {
  history: ReturnGetUserGameId['gameMovesLog']
}) => {
  return <History history={history} />
}

type HistoryItem = ReturnGetUserGameId['gameMovesLog'][0]

type PropTypes = {
  history: ReturnGetUserGameId['gameMovesLog']
}

const connectionLabel = (item: HistoryItem) => {
  const name = item.roleName?.trim()
  if (name) return name
  const type = item.roleType?.trim()
  if (!type || type === 'unknown') return null
  return type
}

const Connector = ({ label }: { label: string | null }) => (
  <div className="flex w-24 shrink-0 flex-col items-center">
    <div className="h-3 w-px bg-black/50" />
    {label ? (
      <Text
        size="sm"
        c="dimmed"
        fw={600}
        tt="uppercase"
        lineClamp={2}
        title={label}
        className="max-w-full px-1.5 py-px text-center leading-tight"
      >
        {label}
      </Text>
    ) : null}
    <div className="h-3 w-px bg-black/50" />
  </div>
)

const Node = ({
  item,
  indx,
  isCurrent,
}: {
  item: HistoryItem
  indx: number
  isCurrent: boolean
}) => {
  const isStart = indx === 0
  const title = item.entity?.label

  const expandedProfileUrl = item.entity?.imgPath
    ? `${TMDB_IMAGE_POSTER_URL_EXPAND}${item.entity.imgPath}`
    : ''

  return (
    <div
      className="flex w-36 shrink-0 flex-col items-center gap-0.5"
      title={title ? title : ''}
    >
      <Text
        size="md"
        c="dimmed"
        fw={700}
        tt="uppercase"
        className="leading-none"
      >
        {isStart ? 'Start' : isCurrent ? 'Current' : indx}
      </Text>
      {item.entityType === 'MOVIE' ? (
        <div className="h-36 w-24">
          <PosterImage
            onClick={(e) => {
              e.stopPropagation()
              OpenPersonImageExpand(true, expandedProfileUrl)
            }}
            posterPath={item.entity?.imgPath}
            id={item.entityId.toString()}
          />
        </div>
      ) : (
        <div className="h-36 w-24">
          <ProfileImage
            profilePath={item.entity?.imgPath}
            creditId={`${item.entityId}-${indx}`}
          />
        </div>
      )}
      <Text
        size="md"
        fw={600}
        // lineClamp={1}
        className="w-full text-center leading-tight"
      >
        {item.entity?.label}
      </Text>
    </div>
  )
}

const History = ({ history }: PropTypes) => {
  const lastIdx = history.length - 1
  return (
    <div className="flex h-full items-center gap-0 px-2 flex-col-reverse justify-center">
      {history.map((curr, indx) => (
        <div
          key={`${curr.moveIndex}-${indx}`}
          className="flex items-center flex-col"
        >
          <Node item={curr} indx={indx} isCurrent={indx === lastIdx} />
          {indx > 0 && <Connector label={connectionLabel(curr)} />}
        </div>
      ))}
    </div>
  )
}

const ModalGameHistory = (history: ReturnGetUserGameId['gameMovesLog']) => {
  return modals.open({
    title: 'Your Moves',
    centered: true,
    zIndex: 1000,
    scrollAreaComponent: ScrollArea.Autosize,
    children: <GameHistory history={history} />,
    onClose() {},
  })
}

export default ModalGameHistory
