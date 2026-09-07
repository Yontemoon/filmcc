import { Badge, Divider, Group, Stack, Text, Title } from '@mantine/core'
import { Route as Compass } from 'lucide-react'
import Paper from '#/components/ui/paper/paper'
import Poster from '#/components/poster/poster'
import type { THeaderStats } from '#/lib/server/stats'
import classes from './stats.module.css'

type TTraveled = THeaderStats['mostTraveled']
type TEntry = TTraveled['person']

type PropTypes = {
  mostTraveled: TTraveled
}

const TraveledEntry = ({
  entry,
  kicker,
  type,
  emptyLabel,
}: {
  entry: TEntry
  kicker: string
  type: 'movie' | 'person'
  emptyLabel: string
}) => {
  if (!entry) {
    return (
      <Stack gap={6}>
        <Badge variant="light" color="gray" size="xs" radius="sm">
          {kicker}
        </Badge>
        <Text size="sm" c="dimmed">
          {emptyLabel}
        </Text>
      </Stack>
    )
  }

  const visits = entry.visits

  return (
    <Group gap="md" wrap="nowrap" align="flex-start">
      <div className={classes.traveledArt}>
        <Poster
          posterPath={entry.imgPath}

          type={type}
          id={entry.entityId.toString()}
          altText={entry.label}
        />
      </div>

      <Stack gap={4} style={{ minWidth: 0 }}>
        <Badge variant="light" color="gray" size="xs" radius="sm">
          {kicker}
        </Badge>
        <Text fw={700} size="lg" lh={1.2} truncate title={entry.label}>
          {entry.label}
        </Text>
        <Text size="xs" c="dimmed">
          {visits} {visits === 1 ? 'visit' : 'visits'}
        </Text>
      </Stack>
    </Group>
  )
}

const MostTraveled = ({ mostTraveled }: PropTypes) => {
  return (
    <Paper withBorder radius="xs" p="lg" shadow="xs" h="100%">
      <Stack gap="md">
        <Group gap={8} wrap="nowrap" align="baseline">
          <Compass size={18} />
          <Title order={4}>Most traveled</Title>
        </Group>

        <Text size="sm" c="dimmed">
          The film and the face your routes keep running through.
        </Text>

        <TraveledEntry
          entry={mostTraveled.movie}
          kicker="Film"
          type="movie"
          emptyLabel="No films visited yet."
        />

        <Divider />

        <TraveledEntry
          entry={mostTraveled.person}
          kicker="Person"
          type="person"
          emptyLabel="No people visited yet."
        />
      </Stack>
    </Paper>
  )
}

export default MostTraveled
