import React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  Alert,
  Center,
  Container,
  Group,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core'
import { ChartNoAxesColumn, Clapperboard, Link2, Trophy } from 'lucide-react'
import Paper from '#/components/ui/paper/paper'
import { ButtonLink } from '#/components/ui/buttons'
import StatTile from '#/components/pages/stats/stat-tile'
import MovesDistribution from '#/components/pages/stats/moves-distribution'
import MostTraveled from '#/components/pages/stats/most-traveled'
import { getHeaderStats } from '#/lib/server/stats'

export const Route = createFileRoute('/_authenticated/stats')({
  component: RouteComponent,
  pendingComponent: PendingStats,
  loader: async () => {
    const stats = await getHeaderStats()
    return stats
  },
})

const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 0,
})

const compactFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

// Proportional figures read better at display sizes, so only the axis-like
// numbers inside the chart get `tabular-nums`.
const formatCount = (value: number) =>
  value >= 10000
    ? compactFormatter.format(value)
    : value.toLocaleString('en-US')

function StatsHeader({
  winPercentage,
  wins,
  gamesPlayed,
}: {
  winPercentage: number
  wins: number
  gamesPlayed: number
}) {
  // `completed / gamesPlayed` is 0/0 on a brand new account.
  const hasRate = Number.isFinite(winPercentage)

  return (
    <Paper withBorder radius="xs" p="lg" shadow="xs">
      <Group justify="space-between" align="flex-start" wrap="wrap" gap="lg">
        <Group gap="md" wrap="nowrap">
          <ThemeIcon variant="light" color="blue" radius="md" size="xl">
            <ChartNoAxesColumn />
          </ThemeIcon>
          <Stack gap={2}>
            <Title order={2}>Statistics</Title>
            <Text c="dimmed" size="sm">
              Every connection you have made, counted up.
            </Text>
          </Stack>
        </Group>

        <Stack gap={0}>
          <Text fw={700} fz={48} lh={1.05}>
            {hasRate ? percentFormatter.format(winPercentage) : '—'}
          </Text>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            Win rate
          </Text>
          <Text size="xs" c="dimmed">
            {wins} solved of {gamesPlayed} played
          </Text>
        </Stack>
      </Group>
    </Paper>
  )
}

function EmptyStats() {
  return (
    <Center py="xl">
      <Stack align="center" gap="xs" maw={420}>
        <ThemeIcon variant="light" color="gray" radius="xl" size={56}>
          <Clapperboard />
        </ThemeIcon>
        <Title order={4}>No games yet</Title>
        <Text c="dimmed" size="sm" ta="center">
          Finish a daily connection and your win rate, move distribution and
          most-traveled films start filling in here.
        </Text>
        <ButtonLink LinkProps={{ to: '/archive' }}>
          <>Play a puzzle</>
        </ButtonLink>
      </Stack>
    </Center>
  )
}

function RouteComponent() {
  const stats = Route.useLoaderData()

  const wins = React.useMemo(
    () =>
      stats
        ? stats.movesPerWins.reduce((acc, row) => acc + row.winsCount, 0)
        : 0,
    [stats],
  )

  if (!stats) {
    return (
      <Container size="lg" py="xl">
        <Alert variant="light" color="red" title="Could not load your stats">
          Something went wrong on our end. Try refreshing the page.
        </Alert>
      </Container>
    )
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <StatsHeader
          winPercentage={stats.winPercentage}
          wins={wins}
          gamesPlayed={stats.gamesPlayed}
        />

        {stats.gamesPlayed === 0 ? (
          <EmptyStats />
        ) : (
          <>
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="lg">
              <StatTile
                icon={Clapperboard}
                label="Played"
                value={formatCount(stats.gamesPlayed)}
                hint="Attempts you have started"
              />
              <StatTile
                icon={Trophy}
                label="Solved"
                value={formatCount(wins)}
                hint="Connections completed"
              />
              <StatTile
                icon={Link2}
                label="Links made"
                value={formatCount(stats.totalLinks)}
                hint="Every hop across every game"
              />
              <StatTile
                icon={ChartNoAxesColumn}
                label="Unique stops"
                value={formatCount(stats.uniqueLinks)}
                hint="Distinct films and people"
              />
            </SimpleGrid>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
              <MovesDistribution movesPerWins={stats.movesPerWins} />
              <MostTraveled mostTraveled={stats.mostTraveled} />
            </SimpleGrid>
          </>
        )}
      </Stack>
    </Container>
  )
}

function PendingStats() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Skeleton height={116} radius="xs" />
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="lg">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} height={124} radius="xs" />
          ))}
        </SimpleGrid>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          <Skeleton height={280} radius="xs" />
          <Skeleton height={280} radius="xs" />
        </SimpleGrid>
      </Stack>
    </Container>
  )
}
