import { Group, Text, Tooltip } from '@mantine/core'
import ColorSwatch from '#/components/ui/color-swatch/color-swatch'
import type { TlinkType } from '#/types/client.types'

const TRACKER_META: Record<
  TlinkType,
  { label: string; color: string; hint: string }
> = {
  CAST: {
    label: 'Cast',
    color: 'blue',
    hint: 'Routing through an actor spends a cast pick.',
  },
  CREW: {
    label: 'Crew',
    color: 'orange',
    hint: 'Routing through a crew member spends a crew pick.',
  },
}

const PointTracker = ({
  type,
  curr,
  max,
}: {
  type: TlinkType
  curr: number
  max: number
}) => {
  const { label, color, hint } = TRACKER_META[type]

  const spent = Math.min(Math.max(curr, 0), max)
  const left = max - spent
  const exhausted = left === 0

  return (
    <Tooltip label={hint} withArrow position="bottom" openDelay={400}>
      <Group
        gap={6}
        wrap="nowrap"
        role="img"
        aria-label={`${label}: ${left} of ${max} picks left`}
      >
        <Text
          size="10px"
          fw={700}
          tt="uppercase"
          c={exhausted ? 'dimmed' : undefined}
          w={28}
          ta="right"
        >
          {label}
        </Text>

        <Group gap={3} wrap="nowrap" aria-hidden>
          {Array.from({ length: max }, (_, indx) => (
            <ColorSwatch
              key={indx}
              size={15}
              color={
                indx < left
                  ? `var(--mantine-color-${color}-5)`
                  : `var(--mantine-color-dark-1)`
              }
            />
          ))}
        </Group>

        <Text
          size="10px"
          fw={700}
          c={exhausted ? 'red' : 'dimmed'}
          w={10}
          ta="right"
        >
          {left}
        </Text>
      </Group>
    </Tooltip>
  )
}

export default PointTracker
export { TRACKER_META }
