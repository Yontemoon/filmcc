import type { ColumnDef } from '@tanstack/react-table'
import type {
  TMovieCastCol,
  TMovieCrewCol,
  TPersonCastCol,
  TPersonCrewCol,
} from './types'
import ProfileImage from '#/components/profile-image'
import PosterImage from '#/components/poster-image'
import { Pill } from '@mantine/core'

const movieCastCol: ColumnDef<TMovieCastCol>[] = [
  {
    accessorKey: 'profile_url',
    header: () => null,
    cell: ({ row }) => {
      return (
        <ProfileImage
          profilePath={row.original.profile_url}
          creditId={row.original.id}
        />
      )
    },
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row, table }) => {
      const onClickName = table.options.meta?.onClickName
      return (
        <div
          className="hover:cursor-pointer hover:underline "
          onClick={() => {
            if (onClickName) onClickName(row.original)
          }}
        >
          {row.original.name}
        </div>
      )
    },
  },
  {
    accessorKey: 'role',
    header: 'Role',
  },
]

const movieCrewCol: ColumnDef<TMovieCrewCol>[] = [
  {
    accessorKey: 'profile_url',
    header: 'profile_url',
    cell: ({ row }) => {
      return (
        <ProfileImage
          profilePath={row.original.profile_url}
          creditId={row.original.id}
        />
      )
    },
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row, table }) => {
      const onClickName = table.options.meta?.onClickName
      return (
        <div
          className="hover:cursor-pointer hover:underline "
          onClick={() => {
            if (onClickName) onClickName(row.original)
          }}
        >
          {row.original.name}
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
        <div className="space-y-1">
          {jobs.map((job) => (
            <Pill>{job}</Pill>
          ))}
        </div>
      )
    },
  },
]

const personCastCol: ColumnDef<TPersonCastCol>[] = [
  {
    accessorKey: 'poster_url',
    header: () => null,
    cell: ({ row }) => {
      return (
        <PosterImage
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
      return (
        <div
          className="hover:cursor-pointer hover:underline "
          onClick={() => {
            if (onClickName) onClickName(row.original)
          }}
        >
          {row.original.title}
        </div>
      )
    },
  },
  {
    accessorKey: 'role',
    header: 'ROLE',
  },
]

const personCrewCol: ColumnDef<TPersonCrewCol>[] = [
  {
    accessorKey: 'poster_url',
    header: () => null,
    cell: ({ row }) => {
      return (
        <PosterImage
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
      return (
        <div
          className="hover:cursor-pointer hover:underline "
          onClick={() => {
            if (onClickName) onClickName(row.original)
          }}
        >
          {row.original.title}
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
        <div className="space-y-1">
          {jobs.map((job) => (
            <Pill>{job}</Pill>
          ))}
        </div>
      )
    },
  },
]

export { movieCastCol, movieCrewCol, personCastCol, personCrewCol }
