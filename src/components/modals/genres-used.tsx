import { modals } from '@mantine/modals'
import { Badge, Divider, Group, Stack, Text } from '@mantine/core'
import { GENRES } from '#/lib/constants'
import type { T_TMDB_GENRE } from '#/types/tmdb.types'

const Section = ({
  title,
  genres,
  empty,
  spent,
}: {
  title: string
  genres: T_TMDB_GENRE[]
  empty: string
  spent: boolean
}) => (
  <Stack gap={7}>
    <Text size="xs" c="dimmed" fw={700} tt="uppercase">
      {title} ({genres.length})
    </Text>
    {genres.length > 0 ? (
      <Group gap={6}>
        {genres.map((genre) => (
          <Badge
            key={genre.id}
            variant={spent ? 'light' : 'outline'}
            color={spent ? 'cyan' : 'gray'}
            size="sm"
            radius="sm"
          >
            {genre.name}
          </Badge>
        ))}
      </Group>
    ) : (
      <Text size="sm" c="dimmed">
        {empty}
      </Text>
    )}
  </Stack>
)

const GenresUsed = ({ genres }: { genres: T_TMDB_GENRE[] }) => {
  const spent = Array.from(new Map(genres.map((g) => [g.id, g])).values())
  const spentIds = new Set(spent.map((g) => g.id))
  const open = GENRES.filter((genre) => !spentIds.has(genre.id))

  return (
    <Stack gap="md">
      <Text size="sm">
        Every film counts as a single <b>genre</b>, and each genre can only be
        routed through once.
      </Text>

      <Section title="Spent" genres={spent} empty="None yet." spent />
      <Divider />
      <Section
        title="Still open"
        genres={open}
        empty="Every genre is spent — no film can be picked."
        spent={false}
      />
    </Stack>
  )
}

const ModalGenresUsed = (genres: T_TMDB_GENRE[]) => {
  return modals.open({
    title: 'Genres',
    centered: true,
    size: 'md',
    children: <GenresUsed genres={genres} />,
  })
}

export default ModalGenresUsed
export { GenresUsed }
