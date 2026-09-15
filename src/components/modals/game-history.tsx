import { modals } from '@mantine/modals'
import type { ReturnGetUserGameId } from '#/lib/server/attempt'
import Poster from '#/components/poster/poster'
import { Badge, Text } from '@mantine/core'
import { useEffect, useRef } from 'react'
import type { TlinkType } from '#/types/client.types'

const GameHistory = ({
  history,
  centered = true,
}: {
  history: ReturnGetUserGameId['gameMovesLog']
  centered?: boolean
}) => {
  return <History history={history} centered={centered} />
}

type HistoryItem = ReturnGetUserGameId['gameMovesLog'][0]

type PropTypes = {
  history: ReturnGetUserGameId['gameMovesLog']
  centered?: boolean
}

const connectionLabel = (item: HistoryItem) => {
  const name = item.roleName?.trim()
  if (name) return name
  const type = item.roleType?.trim()
  if (!type || type === 'unknown') return null
  return type
}

const connectorLine = (type?: TlinkType | null) =>
  type === 'CAST'
    ? 'bg-blue-400'
    : type === 'CREW'
      ? 'bg-orange-400'
      : 'bg-black/50'

const connectorText = (type?: TlinkType | null) =>
  type === 'CAST' ? 'blue' : type === 'CREW' ? 'orange' : 'dimmed'

const Connector = ({
  label,
  type,
}: {
  label: string | null
  type?: TlinkType | null
}) => (
  <div className="flex w-24 shrink-0 flex-col items-center gap-1 px-1">
    <Text
      size="xs"
      c={connectorText(type)}
      fw={600}
      tt="uppercase"
      lineClamp={2}
      title={label ?? undefined}
      className="min-h-8 w-full text-center leading-tight"
    >
      {label}
      {label && type ? ` (${type})` : null}
    </Text>
    <div className={`h-0.5 w-full ${connectorLine(type)}`} />
    <div className="min-h-8" />
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

  return (
    <div
      className="flex w-28 shrink-0 flex-col items-center gap-1"
      title={title ?? ''}
    >
      <Text
        size="xs"
        c="dimmed"
        fw={700}
        tt="uppercase"
        className="leading-none"
      >
        {isStart ? 'Start' : isCurrent ? 'Current' : indx}
      </Text>
      <div className="h-36 w-24">
        {item.entityType === 'MOVIE' ? (
          <Poster
            type="movie"
            posterPath={item.entity?.imgPath}
            id={item.entityId.toString()}
          />
        ) : (
          <Poster
            type="person"
            posterPath={item.entity?.imgPath}
            id={`${item.entityId}-${indx}`}
          />
        )}
      </div>
      <Text
        size="sm"
        fw={600}
        lineClamp={2}
        className="w-full text-center leading-tight"
      >
        {item.entity?.label}
      </Text>
      {item.entity?.genre ? (
        <Badge size="xs" className="leading-none" variant="light" color="cyan">
          {item.entity.genre.name}
        </Badge>
      ) : null}
    </div>
  )
}

const History = ({ history, centered = true }: PropTypes) => {
  const lastIdx = history.length - 1
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollLeft = -el.scrollWidth
  }, [history.length])

  return (
    <div
      ref={scrollRef}
      className={`flex w-full flex-row-reverse items-center scrollbar-none overflow-x-auto px-2 py-2 ${
        centered ? 'h-full justify-center-safe' : ''
      }`}
    >
      {history.map((curr, indx) => (
        <div
          key={`${curr.moveIndex}-${indx}`}
          className="flex shrink-0 flex-row-reverse items-center"
        >
          {indx > 0 && (
            <Connector
              label={connectionLabel(curr)}
              type={curr.entityType === 'PERSON' ? curr.linkType : null}
            />
          )}
          <Node item={curr} indx={indx} isCurrent={indx === lastIdx} />
        </div>
      ))}
    </div>
  )
}

const ModalGameHistory = (history: ReturnGetUserGameId['gameMovesLog']) => {
  return modals.open({
    title: 'Your Moves',
    centered: true,
    size: 'xl',
    zIndex: 1000,
    children: <GameHistory history={history} />,
    onClose() {},
  })
}

export default ModalGameHistory
export { GameHistory }
