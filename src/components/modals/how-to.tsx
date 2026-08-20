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
import {
  ArrowRight,
  CalendarClock,
  Clapperboard,
  Ticket,
  UserRound,
  Ban,
} from 'lucide-react'
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
  via: string | null
  cost: TlinkType | null
}

const EXAMPLE: ExampleStep[] = [
  {
    id: 155,
    type: 'MOVIE',
    label: 'The Dark Knight',
    img_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    kicker: 'Start',
    via: null,
    cost: null,
  },
  {
    id: 3895,
    type: 'PERSON',
    label: 'Michael Caine',
    img_path: '/bVZRMlpjTAO2pJK6v90buFgVbSW.jpg',
    kicker: 'Move 1',
    via: 'Alfred',
    cost: 'CAST',
  },
  {
    id: 157336,
    type: 'MOVIE',
    label: 'Interstellar',
    img_path: '/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg',
    kicker: 'Move 2',
    via: 'He acted in it',
    cost: null,
  },
  {
    id: 525,
    type: 'PERSON',
    label: 'Christopher Nolan',
    img_path: '/xuAIuYSmsUzKlUMBFGVZaWsY3DZ.jpg',
    kicker: 'Target',
    via: 'Director',
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

const Step = ({ step }: { step: ExampleStep }) => {
  const isEndpoint = step.via === null || step.kicker === 'Target'

  return (
    <Stack gap={4} align="center" w={84} style={{ flexShrink: 0 }}>
      <Badge
        variant="light"
        color={isEndpoint ? (step.via ? 'grape' : 'teal') : 'gray'}
        size="xs"
        radius="sm"
      >
        {step.kicker}
      </Badge>

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
        <Avatar
          src={`${TMDB_IMAGE_PROFILE_URL}${step.img_path}`}
          alt={step.label}
          size={40}
          radius="sm"
        />
      )}

      <Text size="xs" fw={700} ta="center" className="leading-tight">
        {step.label}
      </Text>
      <Text size="10px" c="dimmed" ta="center" className="leading-tight">
        {step.via ?? 'Where you begin'}
      </Text>
      {step.kicker !== 'Start' && <CostChip cost={step.cost} />}
    </Stack>
  )
}

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
        Every day you get a <b>Start</b> and a <b>Target</b> — a film or a
        person. Get from one to the other through shared credits. The catch: you
        only get so many people to travel through.
      </Text>

      <div>
        <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb={6}>
          Example — solved on one cast pick and one crew pick
        </Text>
        <Group
          gap={4}
          wrap="nowrap"
          justify="center"
          className="overflow-x-auto"
        >
          {EXAMPLE.map((step, indx) => (
            <Group key={step.id} gap={4} wrap="nowrap">
              {indx > 0 && (
                <ThemeIcon variant="subtle" color="gray" size="sm">
                  <ArrowRight />
                </ThemeIcon>
              )}
              <Step step={step} />
            </Group>
          ))}
        </Group>
      </div>

      <Divider />

      <Stack gap="xs">
        <Rule icon={<Clapperboard size={14} />}>
          Standing on a <b>film</b>? Pick anyone from its cast or crew. This is
          the move that costs you — an actor spends a <b>cast pick</b>, anyone
          else spends a <b>crew pick</b>.
        </Rule>
        <Rule icon={<UserRound size={14} />}>
          Standing on a <b>person</b>? Pick any film they worked on. Film hops
          are always <b>free</b>.
        </Rule>
        <Rule icon={<Ticket size={14} />}>
          A run gives you <b>{MAX_CAST_LINKS} cast picks</b> and{' '}
          <b>{MAX_CREW_LINKS} crew picks</b>. Crew are scarce but they travel
          further — a director or composer links films that share no actors.
        </Rule>

        <Group gap="lg" pl={30} py={2}>
          <PointTracker type="CAST" curr={0} max={MAX_CAST_LINKS} />
          <PointTracker type="CREW" curr={0} max={MAX_CREW_LINKS} />
        </Group>

        <Rule icon={<Ban size={14} />}>No repeats.</Rule>
        <Rule icon={<CalendarClock size={14} />}>
          A new game drops daily at midnight. Sign up to get a reminder each
          day.
        </Rule>
      </Stack>
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
