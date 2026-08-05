import {
  CircleCheck,
  CircleDashed,
  CircleX,
  Flag,
  Hourglass,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { TArchivedGame } from '#/lib/server/daily'
import { parseDisplayDate } from '#/lib/utils'

type TArchiveStatus =
  'completed' | 'failed' | 'gave_up' | 'in_progress' | 'unplayed'

type TArchiveFilter = 'all' | 'unplayed' | 'in_progress' | 'finished'

const STATUS_META: Record<
  TArchiveStatus,
  { label: string; color: string; icon: LucideIcon }
> = {
  completed: { label: 'Solved', color: 'teal', icon: CircleCheck },
  failed: { label: 'Failed', color: 'red', icon: CircleX },
  gave_up: { label: 'Gave up', color: 'orange', icon: Flag },
  in_progress: { label: 'In progress', color: 'yellow', icon: Hourglass },
  unplayed: { label: 'Not played', color: 'gray', icon: CircleDashed },
}

const FILTER_OPTIONS: Array<{ label: string; value: TArchiveFilter }> = [
  { label: 'All', value: 'all' },
  { label: 'Not played', value: 'unplayed' },
  { label: 'In progress', value: 'in_progress' },
  { label: 'Finished', value: 'finished' },
]

// `getDailyGames` scopes attempts to the signed in user, so there is at most one.
const getAttempt = (game: TArchivedGame) => game.gameAttempts.at(0) ?? null

const getArchiveStatus = (game: TArchivedGame): TArchiveStatus => {
  const attempt = getAttempt(game)
  if (!attempt) return 'unplayed'

  switch (attempt.status) {
    case 'completed':
    case 'failed':
    case 'gave_up':
      return attempt.status
    default:
      return 'in_progress'
  }
}

const matchesFilter = (status: TArchiveStatus, filter: TArchiveFilter) => {
  switch (filter) {
    case 'all':
      return true
    case 'unplayed':
      return status === 'unplayed'
    case 'in_progress':
      return status === 'in_progress'
    case 'finished':
      return (
        status === 'completed' || status === 'failed' || status === 'gave_up'
      )
  }
}

// Puzzles dated in the future are on the board but not playable yet.
const isLocked = (game: TArchivedGame) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return parseDisplayDate(game.displayDate).getTime() > today.getTime()
}

const matchesSearch = (game: TArchivedGame, term: string) => {
  const needle = term.trim().toLowerCase()
  if (!needle) return true

  return [
    game.start.label,
    game.end.label,
    game.displayDate,
    `no. ${game.id}`,
    `#${game.id}`,
  ].some((value) => value.toLowerCase().includes(needle))
}

export {
  STATUS_META,
  FILTER_OPTIONS,
  getAttempt,
  getArchiveStatus,
  matchesFilter,
  matchesSearch,
  isLocked,
}

export type { TArchiveStatus, TArchiveFilter }
