import { modals } from '@mantine/modals'
import {
  Avatar,
  Badge,
  Divider,
  Group,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core'
import { ArrowRight, Clapperboard, Ticket, UserRound } from 'lucide-react'
import Poster from '#/components/poster/poster'
import PointTracker, {
  TRACKER_META,
} from '#/components/pages/game/point-tracker'
import type { TlinkType } from '#/types/client.types'
import {
  MAX_CAST_LINKS,
  MAX_CREW_LINKS,
  TMDB_IMAGE_PROFILE_URL,
} from '#/lib/constants'

type ExampleStep = {
  id: number
  type: 'MOVIE' | 'PERSON'
  label: string
  img_path: string
  kicker: string
  cost: TlinkType | null
}

const EXAMPLE: ExampleStep[] = [
  {
    id: 155,
    type: 'MOVIE',
    label: 'The Dark Knight',
    img_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    kicker: 'Start',
    cost: null,
  },
  {
    id: 3895,
    type: 'PERSON',
    label: 'Michael Caine',
    img_path: '/bVZRMlpjTAO2pJK6v90buFgVbSW.jpg',
    kicker: '',
    cost: 'CAST',
  },
  {
    id: 157336,
    type: 'MOVIE',
    label: 'Interstellar',
    img_path: '/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg',
    kicker: '',
    cost: null,
  },
  {
    id: 525,
    type: 'PERSON',
    label: 'Christopher Nolan',
    img_path: '/xuAIuYSmsUzKlUMBFGVZaWsY3DZ.jpg',
    kicker: 'Target',
    cost: 'CREW',
  },
]

const CostChip = ({ cost }: { cost: TlinkType | null }) => {
  if (!cost) {
    return (
      <Badge variant="outline" color="gray" size="xs" radius="sm">
        Free
      </Badge>
    )
  }

  const { label, color } = TRACKER_META[cost]
  return (
    <Badge variant="light" color={color} size="xs" radius="sm">
      −1 {label}
    </Badge>
  )
}

const Step = ({ step, indx }: { step: ExampleStep; indx: number }) => (
  <Stack gap={4} align="center" w={84} style={{ flexShrink: 0 }}>
    {step.kicker ? (
      <Badge
        variant="light"
        color={step.kicker === 'Start' ? 'teal' : 'grape'}
        size="xs"
        radius="sm"
      >
        {step.kicker}
      </Badge>
    ) : (
      <div className="h-4.5" />
    )}

    {step.type === 'MOVIE' ? (
      <div className="h-15 w-10">
        <Poster
          type="movie"
          posterPath={step.img_path}
          id={step.id.toString()}
          showExpand={false}
          altText={step.label}
        />
      </div>
    ) : (
      <div className="h-15 w-10">
        <Poster
          type="person"
          posterPath={step.img_path}
          id={step.id.toString()}
          showExpand={false}
          altText={step.label}
        />
      </div>
    )}

    <Text size="xs" fw={700} ta="center" className="leading-tight">
      {step.label}
    </Text>
    {indx > 0 && <CostChip cost={step.cost} />}
  </Stack>
)

const Rule = ({
  icon,
  children,
}: {
  icon: React.ReactNode
  children: React.ReactNode
}) => (
  <Group gap="xs" wrap="nowrap" align="flex-start">
    <ThemeIcon variant="light" color="gray" size="sm" radius="sm">
      {icon}
    </ThemeIcon>
    <Text size="sm" style={{ flex: 1 }}>
      {children}
    </Text>
  </Group>
)

const HowToBody = () => {
  return (
    <Stack gap="md">
      <Text size="sm">
        Connect the <b>Start</b> to the <b>Target</b> through shared credits.
      </Text>

      <Group gap={4} wrap="nowrap" justify="center" className="overflow-x-auto">
        {EXAMPLE.map((step, indx) => (
          <Group key={step.id} gap={4} wrap="nowrap">
            {indx > 0 && (
              <ThemeIcon variant="subtle" color="gray" size="sm">
                <ArrowRight />
              </ThemeIcon>
            )}
            <Step step={step} indx={indx} />
          </Group>
        ))}
      </Group>

      <Divider />

      <Stack gap="xs">
        <Rule icon={<UserRound size={14} />}>
          On a <b>person</b>: pick any film they worked on — <b>free</b>.
        </Rule>
        <Rule icon={<Clapperboard size={14} />}>
          On a <b>film</b>: pick an actor (<b>cast pick</b>) or anyone else (
          <b>crew pick</b>).
        </Rule>
        <Rule icon={<Ticket size={14} />}>
          You get {MAX_CAST_LINKS} cast picks and {MAX_CREW_LINKS} crew picks.
          No repeats.
        </Rule>

        <Group gap="lg" pl={30} py={2}>
          <PointTracker type="CAST" curr={0} max={MAX_CAST_LINKS} />
          <PointTracker type="CREW" curr={0} max={MAX_CREW_LINKS} />
        </Group>
      </Stack>

      <Text size="xs" c="dimmed" ta="center">
        New game daily at midnight.
      </Text>
    </Stack>
  )
}

const ModalHowTo = () => {
  return modals.open({
    title: 'How to Play',
    centered: true,
    size: 'lg',
    children: <HowToBody />,
  })
}

export default ModalHowTo
