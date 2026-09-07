import React from 'react'
import { Group, Stack, Text, Title, Tooltip } from '@mantine/core'
import { Footprints } from 'lucide-react'
import Paper from '#/components/ui/paper/paper'
import type { THeaderStats } from '#/lib/server/stats'
import classes from './stats.module.css'

type PropTypes = {
  movesPerWins: THeaderStats['movesPerWins']
}

type TBucket = {
  moves: number
  wins: number
}

const toMoves = (moveCount: number) => Math.max(moveCount - 1, 0)

const buildBuckets = (
  movesPerWins: PropTypes['movesPerWins'],
): Array<TBucket> => {
  const wins = new Map<number, number>()

  for (const row of movesPerWins) {
    const moves = toMoves(row.moveCount)
    wins.set(moves, (wins.get(moves) ?? 0) + row.winsCount)
  }

  if (wins.size === 0) {
    return []
  }

  const keys = [...wins.keys()]
  const min = Math.min(...keys)
  const max = Math.max(...keys)

  // Fill the gaps so the scale stays continuous — an unused 4-move bucket should
  // read as an empty row, not vanish and pull 5 up next to 3.
  const buckets: Array<TBucket> = []
  for (let moves = min; moves <= max; moves++) {
    buckets.push({ moves, wins: wins.get(moves) ?? 0 })
  }

  return buckets
}

const MovesDistribution = ({ movesPerWins }: PropTypes) => {
  const buckets = React.useMemo(
    () => buildBuckets(movesPerWins),
    [movesPerWins],
  )

  const peak = buckets.reduce((acc, bucket) => Math.max(acc, bucket.wins), 0)
  const best = buckets.find((bucket) => bucket.wins > 0)

  return (
    <Paper withBorder radius="xs" p="lg" shadow="xs" h="100%">
      <Stack gap="md">
        <Group gap={8} wrap="nowrap" align="baseline">
          <Footprints size={18} />
          <Title order={4}>Moves per win</Title>
        </Group>

        {buckets.length === 0 ? (
          <Text size="sm" c="dimmed">
            Solve your first connection and your move distribution shows up
            here.
          </Text>
        ) : (
          <>
            <Text size="sm" c="dimmed">
              {best
                ? `Your best solve took ${best.moves} ${best.moves === 1 ? 'move' : 'moves'}.`
                : null}
            </Text>

            <Stack gap={6}>
              {buckets.map((bucket) => {
                const isPeak = bucket.wins > 0 && bucket.wins === peak
                // A 1-win bucket still needs to be visible, hence the floor.
                const width = peak === 0 ? 0 : (bucket.wins / peak) * 100

                return (
                  <Tooltip
                    key={bucket.moves}
                    withArrow
                    label={`${bucket.wins} ${bucket.wins === 1 ? 'win' : 'wins'} in ${bucket.moves} ${bucket.moves === 1 ? 'move' : 'moves'}`}
                  >
                    <div className={classes.chartRow}>
                      <Text size="xs" c="dimmed" fw={600} tt="uppercase">
                        {bucket.moves} {bucket.moves === 1 ? 'move' : 'moves'}
                      </Text>

                      <div className={classes.track}>
                        <div
                          className={`${classes.fill} ${isPeak ? '' : classes.fillMuted}`}
                          style={{
                            width:
                              bucket.wins === 0 ? 0 : `max(${width}%, 4px)`,
                          }}
                        />
                      </div>

                      <Text
                        size="sm"
                        fw={isPeak ? 700 : 500}
                        c={bucket.wins === 0 ? 'dimmed' : undefined}
                        ta="right"
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                      >
                        {bucket.wins}
                      </Text>
                    </div>
                  </Tooltip>
                )
              })}
            </Stack>
          </>
        )}
      </Stack>
    </Paper>
  )
}

export default MovesDistribution
