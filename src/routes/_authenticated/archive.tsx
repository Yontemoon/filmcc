import React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  Alert,
  Card,
  Center,
  Container,
  Group,
  Paper,
  SegmentedControl,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { Clapperboard, Search, SearchX } from 'lucide-react'
import Button from '#/components/ui/button'
import GameCard from '#/components/pages/archive/game-card'
import {
  FILTER_OPTIONS,
  getArchiveStatus,
  matchesFilter,
  matchesSearch,
} from '#/components/pages/archive/utils'
import type { TArchiveFilter } from '#/components/pages/archive/utils'
import { getDailyGames } from '#/lib/server/game'

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
]

const GRID_COLS = { base: 1, xs: 2, md: 3, lg: 4 }

export const Route = createFileRoute('/_authenticated/archive')({
  component: RouteComponent,
  pendingComponent: PendingArchive,
  loader: async () => {
    const data = await getDailyGames()
    return data ?? []
  },
})

function ArchiveHeader({
  total,
  solved,
  inProgress,
  unplayed,
}: {
  total: number
  solved: number
  inProgress: number
  unplayed: number
}) {
  const stats = [
    { label: 'Puzzles', value: total, color: undefined },
    { label: 'Solved', value: solved, color: 'teal' },
    { label: 'In progress', value: inProgress, color: 'yellow' },
    { label: 'Not played', value: unplayed, color: 'dimmed' },
  ]

  return (
    <Paper withBorder radius="lg" p="lg" shadow="xs">
      <Group justify="space-between" align="flex-start" wrap="wrap" gap="lg">
        <Group gap="md" wrap="nowrap">
          <ThemeIcon variant="light" color="blue" radius="md" size="xl">
            <Clapperboard />
          </ThemeIcon>
          <Stack gap={2}>
            <Title order={2}>Archive</Title>
            <Text c="dimmed" size="sm">
              Every daily connection, from the newest puzzle back to the very
              first.
            </Text>
          </Stack>
        </Group>

        <Group gap="xl" wrap="wrap">
          {stats.map((stat) => (
            <Stack key={stat.label} gap={0}>
              <Text fw={700} fz={28} lh={1.1} c={stat.color}>
                {stat.value}
              </Text>
              <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                {stat.label}
              </Text>
            </Stack>
          ))}
        </Group>
      </Group>
    </Paper>
  )
}

function RouteComponent() {
  const dailyGames = Route.useLoaderData()

  const [search, setSearch] = React.useState('')
  const [debouncedSearch] = useDebouncedValue(search, 200)
  const [filter, setFilter] = React.useState<TArchiveFilter>('all')
  const [sort, setSort] = React.useState('newest')

  const counts = React.useMemo(() => {
    return dailyGames.reduce(
      (acc, game) => {
        const status = getArchiveStatus(game)
        if (status === 'completed') acc.solved += 1
        if (status === 'in_progress') acc.inProgress += 1
        if (status === 'unplayed') acc.unplayed += 1
        return acc
      },
      { solved: 0, inProgress: 0, unplayed: 0 },
    )
  }, [dailyGames])

  const visibleGames = React.useMemo(() => {
    const filtered = dailyGames.filter(
      (game) =>
        matchesFilter(getArchiveStatus(game), filter) &&
        matchesSearch(game, debouncedSearch),
    )

    // The loader hands them back newest first, so oldest is just the reverse.
    return sort === 'newest' ? filtered : [...filtered].reverse()
  }, [dailyGames, filter, debouncedSearch, sort])

  const isFiltering = filter !== 'all' || debouncedSearch.trim().length > 0

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <ArchiveHeader
          total={dailyGames.length}
          solved={counts.solved}
          inProgress={counts.inProgress}
          unplayed={counts.unplayed}
        />

        {dailyGames.length === 0 ? (
          <Alert variant="light" color="blue" title="Nothing here yet">
            No daily games have been published. Check back once the first puzzle
            goes live.
          </Alert>
        ) : (
          <>
            <Group
              justify="space-between"
              align="flex-end"
              wrap="wrap"
              gap="md"
            >
              <TextInput
                flex={1}
                miw={220}
                radius="md"
                placeholder="Search by movie, person or date"
                aria-label="Search the archive"
                leftSection={<Search size={16} />}
                value={search}
                onChange={(event) => setSearch(event.currentTarget.value)}
              />

              <Group gap="sm" wrap="wrap">
                <SegmentedControl
                  radius="md"
                  data={FILTER_OPTIONS}
                  value={filter}
                  onChange={setFilter}
                />
                <SegmentedControl
                  radius="md"
                  data={SORT_OPTIONS}
                  value={sort}
                  onChange={setSort}
                />
              </Group>
            </Group>

            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Showing {visibleGames.length} of {dailyGames.length} puzzles
              </Text>
              {isFiltering && (
                <Button
                  variant="subtle"
                  size="compact-sm"
                  onClick={() => {
                    setSearch('')
                    setFilter('all')
                  }}
                >
                  Clear filters
                </Button>
              )}
            </Group>

            {visibleGames.length === 0 ? (
              <Center py="xl">
                <Stack align="center" gap="xs">
                  <ThemeIcon variant="light" color="gray" radius="xl" size={56}>
                    <SearchX />
                  </ThemeIcon>
                  <Title order={4}>No puzzles match</Title>
                  <Text c="dimmed" size="sm">
                    Try a different search term or filter.
                  </Text>
                </Stack>
              </Center>
            ) : (
              <SimpleGrid cols={GRID_COLS} spacing="lg" verticalSpacing="lg">
                {visibleGames.map((dailyGame) => (
                  <GameCard key={dailyGame.id} game={dailyGame} />
                ))}
              </SimpleGrid>
            )}
          </>
        )}
      </Stack>
    </Container>
  )
}

function PendingArchive() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Skeleton height={116} radius="lg" />
        <Skeleton height={36} radius="md" />
        <SimpleGrid cols={GRID_COLS} spacing="lg" verticalSpacing="lg">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} withBorder radius="lg" padding="md">
              <Stack gap="sm">
                <Skeleton height={12} width="45%" radius="sm" />
                <Skeleton height={108} radius="md" />
                <Skeleton height={12} radius="sm" />
                <Skeleton height={32} radius="md" />
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  )
}
