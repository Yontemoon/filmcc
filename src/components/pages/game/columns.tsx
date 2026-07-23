import type { ColumnDef } from '@tanstack/react-table'
import type {
  TMovieCastCol,
  TMovieCrewCol,
  TPersonCastCol,
  TPersonCrewCol,
} from './types'
import ProfileImage from '#/components/profile-image'
import PosterImage from '#/components/poster/poster'
import Badge from '#/components/ui/badge'
import { displayYear } from '#/lib/utils'
import { Group, Scroller, Text } from '@mantine/core'
import ColorSwatch from '#/components/ui/color-swatch/color-swatch'

const movieCastCol: ColumnDef<TMovieCastCol>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row, table }) => {
      const onClickName = table.options.meta?.onClickName
      return (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8">
            <ProfileImage
              onClick={() => {
                if (onClickName) onClickName(row.original)
              }}
              profilePath={row.original.profile_url}
              creditId={row.original.id}
            />
          </div>
          <div
            className="hover:cursor-pointer hover:underline "
            onClick={() => {
              if (onClickName) onClickName(row.original)
            }}
          >
            <Text size="xs">{row.original.name}</Text>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      return (
        <>
          <Text size="xs">{row.original.role}</Text>
        </>
      )
    },
  },
  {
    accessorKey: 'already_added',
    header: () => null,

    enableSorting: false,
    cell: ({ row }) => {
      const added = row.original.already_added

      if (added) {
        return <ColorSwatch color="var(--mantine-color-red-5)" size={20} />
      } else {
        return <ColorSwatch color="var(--mantine-color-teal-5)" size={20} />
      }
    },
  },
]

const movieCrewCol: ColumnDef<TMovieCrewCol>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row, table }) => {
      const onClickName = table.options.meta?.onClickName
      return (
        <div className="flex gap-3 items-center">
          <div className="h-8 w-8 min-w-8 min-h-8">
            <ProfileImage
              onClick={() => {
                if (onClickName) onClickName(row.original)
              }}
              profilePath={row.original.profile_url}
              creditId={row.original.id}
            />
          </div>
          <div className="hover:cursor-pointer hover:underline ">
            <Text
              size="xs"
              onClick={() => {
                if (onClickName) onClickName(row.original)
              }}
            >
              {row.original.name}
            </Text>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'jobs',
    header: 'Jobs',
    cell: ({ row }) => {
      const jobs = row.original.jobs
      return (
        <Group wrap="wrap" gap={'xs'}>
          {jobs.map((job, indx) => (
            <Badge size="xs" key={indx}>
              {job}
            </Badge>
          ))}
        </Group>
      )
    },
  },
  {
    accessorKey: 'already_added',
    header: () => null,
    enableSorting: false,
    cell: ({ row }) => {
      const added = row.original.already_added
      if (added) {
        return <ColorSwatch color="var(--mantine-color-red-5)" size={20} />
      } else {
        return <ColorSwatch color="var(--mantine-color-teal-5)" size={20} />
      }
    },
  },
]

const personCastCol: ColumnDef<TPersonCastCol>[] = [
  {
    accessorKey: 'poster_url',
    header: () => null,
    enableSorting: false,
    cell: ({ row, table }) => {
      const onClickName = table.options.meta?.onClickName
      return (
        <PosterImage
          onClick={() => {
            if (onClickName) onClickName(row.original)
          }}
          className="w-10 h-10"
          posterPath={row.original.poster_url}
          id={row.original.id.toString()}
        />
      )
    },
  },
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row, table }) => {
      const onClickName = table.options.meta?.onClickName
      const year = row.original.date && displayYear(row.original.date)

      return (
        <div
          className="hover:cursor-pointer hover:underline "
          onClick={() => {
            if (onClickName) onClickName(row.original)
          }}
        >
          {row.original.title} {`(  ${year})`}
        </div>
      )
    },
  },
  {
    accessorKey: 'role',
    header: 'Role',
  },
  {
    accessorKey: 'already_added',
    header: () => null,
    enableSorting: false,
    cell: ({ row }) => {
      const added = row.original.already_added

      if (added) {
        return (
          <Badge circle variant="filled">
            Added
          </Badge>
        )
      } else {
        return (
          <Badge variant="outline" circle>
            Not
          </Badge>
        )
      }
    },
  },
]

const personCrewCol: ColumnDef<TPersonCrewCol>[] = [
  {
    accessorKey: 'poster_url',
    header: () => null,
    enableSorting: false,
    cell: ({ row, table }) => {
      const onClickName = table.options.meta?.onClickName
      return (
        <PosterImage
          onClick={() => {
            if (onClickName) onClickName(row.original)
          }}
          className="w-10 h-10"
          posterPath={row.original.poster_url}
          id={row.original.id.toString()}
        />
      )
    },
  },
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row, table }) => {
      const onClickName = table.options.meta?.onClickName
      const year =
        row.original.release_date && displayYear(row.original.release_date)
      return (
        <div
          className="hover:cursor-pointer hover:underline "
          onClick={() => {
            if (onClickName) onClickName(row.original)
          }}
        >
          {row.original.title} ({year ?? `(${year})`})
        </div>
      )
    },
  },
  {
    accessorKey: 'jobs',
    header: 'Jobs',
    cell: ({ row }) => {
      const jobs = row.original.jobs
      return (
        <Scroller maw={200}>
          <Group gap={'xs'} wrap="nowrap">
            {jobs.map((job, indx) => (
              <Badge size="xs" key={indx}>
                {job}
              </Badge>
            ))}
          </Group>
        </Scroller>
      )
    },
  },
  {
    accessorKey: 'already_added',
    header: () => null,
    enableSorting: false,
    cell: ({ row }) => {
      const added = row.original.already_added
      if (added) {
        return (
          <Badge circle variant="filled">
            Added
          </Badge>
        )
      } else {
        return (
          <Badge variant="outline" circle>
            Not
          </Badge>
        )
      }
    },
  },
]

export { movieCastCol, movieCrewCol, personCastCol, personCrewCol }
