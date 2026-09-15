import type {
  T_TMDB_MOVIE_DETAILS,
  T_TMDB_PERSON_DETAILS,
  T_TMDB_GENRE,
} from '#/types/tmdb.types'

type TType = 'MOVIE' | 'PERSON'
type TlinkType = 'CAST' | 'CREW'

type TControllerBase = {
  id: number
  label: string
  img_path: string | null
}
type TPersonControllerChild = TControllerBase & {
  type: 'PERSON'
  genre: null
}

type TMovieControllerChild = TControllerBase & {
  type: 'MOVIE'
  genre: T_TMDB_GENRE
}

type TController = TMovieControllerChild | TPersonControllerChild

type TBaseController<T extends TType, TDetails> = Omit<TController, 'type'> & {
  type: T
  details: TDetails
  creditInfo?: {
    roleName: string | null
    roleType: string
  } | null
}
type TMovieController = TBaseController<'MOVIE', T_TMDB_MOVIE_DETAILS>
type TPersonController = TBaseController<'PERSON', T_TMDB_PERSON_DETAILS>

type TMove = {
  entityId: number
  entityType: TType
  label: string
  imgPath: string | null
  linkType: TlinkType
  roleName: string | null
  roleType: string
  genre: T_TMDB_GENRE | null
}

export type {
  TType,
  TController,
  TMovieController,
  TPersonController,
  TlinkType,
  TMove,
}
