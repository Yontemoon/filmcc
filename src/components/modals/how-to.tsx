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
  Timer,
  UserRound,
  Ban,
} from 'lucide-react'
import PosterImage from '#/components/poster/poster'
import ColorSwatch from '#/components/ui/color-swatch/color-swatch'
import { TMDB_IMAGE_PROFILE_URL } from '#/lib/constants'

type ExampleStep = {
  id: number
  type: 'MOVIE' | 'PERSON'
  label: string
  img_path: string
  kicker: string
  via: string | null
}

// Worked example: The Dark Knight -> Michael Caine -> Interstellar -> Nolan.
const EXAMPLE: ExampleStep[] = [
  {
    id: 155,
    type: 'MOVIE',
    label: 'The Dark Knight',
    img_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    kicker: 'Start',
    via: null,
  },
  {
    id: 3895,
    type: 'PERSON',
    label: 'Michael Caine',
    img_path: '/bVZRMlpjTAO2pJK6v90buFgVbSW.jpg',
    kicker: 'Move 1',
    via: 'Cast · Alfred',
  },
  {
    id: 157336,
    type: 'MOVIE',
    label: 'Interstellar',
    img_path: '/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg',
    kicker: 'Move 2',
    via: 'Cast · Professor Brand',
  },
  {
    id: 525,
    type: 'PERSON',
    label: 'Christopher Nolan',
    img_path: '/xuAIuYSmsUzKlUMBFGVZaWsY3DZ.jpg',
    kicker: 'Target',
    via: 'Crew · Director',
  },
]

const Step = ({ step }: { step: ExampleStep }) => {
  const isEndpoint = step.via === null || step.kicker === 'Target'

  return (
    <Stack gap={4} align="center" w={78} style={{ flexShrink: 0 }}>
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
          <PosterImage
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
        person. Get from one to the other through shared credits, in as few
        moves as possible.
      </Text>

      <div>
        <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb={6}>
          Example — solved in 3 moves
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
          Standing on a <b>film</b>? Pick anyone from its cast or crew.
        </Rule>
        <Rule icon={<UserRound size={14} />}>
          Standing on a <b>person</b>? Pick any film they worked on.
        </Rule>
        <Rule icon={<Ban size={14} />}>
          No repeats. A{' '}
          <ColorSwatch
            color="var(--mantine-color-teal-5)"
            size={12}
            style={{ display: 'inline-block', verticalAlign: 'middle' }}
          />{' '}
          dot means it's open, a{' '}
          <ColorSwatch
            color="var(--mantine-color-red-5)"
            size={12}
            style={{ display: 'inline-block', verticalAlign: 'middle' }}
          />{' '}
          dot means it's already in your chain. If every link from where you're
          standing is used up, the run is over.
        </Rule>
        <Rule icon={<Timer size={14} />}>
          Moves and time are both counted, so the best runs are short <i>and</i>{' '}
          quick.
        </Rule>
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
