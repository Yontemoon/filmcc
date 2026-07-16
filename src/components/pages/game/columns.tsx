import type { ColumnDef } from '@tanstack/react-table'
import type {
  TMovieCastCol,
  TMovieCrewCol,
  TPersonCastCol,
  TPersonCrewCol,
} from './types'
import ProfileImage from '#/components/profile-image'
import PosterImage from '#/components/poster-image'

const movieCastCol: ColumnDef<TMovieCastCol>[] = [
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
]

const movieCrewCol: ColumnDef<TMovieCrewCol>[] = [
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
    accessorKey: 'job',
    header: 'Job',
  },
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
]

const personCrewCol: ColumnDef<TPersonCrewCol>[] = [
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
    accessorKey: 'job',
    header: 'Job',
  },
  {
    accessorKey: 'poster_url',
    header: 'POSTER URL',
    cell: ({ row }) => {
      return (
        <PosterImage
          posterPath={row.original.poster_url}
          id={row.original.id.toString()}
        />
      )
    },
  },
]

const personCastCol: ColumnDef<TPersonCastCol>[] = [
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
  {
    accessorKey: 'poster_url',
    header: 'POSTER URL',
    cell: ({ row }) => {
      return (
        <PosterImage
          posterPath={row.original.poster_url}
          id={row.original.id.toString()}
        />
      )
    },
  },
]

export { movieCastCol, movieCrewCol, personCastCol, personCrewCol }
