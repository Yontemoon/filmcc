import type {
  T_TMDB_MOVIE_DETAILS,
  T_TMDB_PERSON_DETAILS,
} from '#/types/tmdb.types'

type TType = 'MOVIE' | 'PERSON'

type TController = {
  type: TType
  id: number
  label: string
}

type TBaseController<T extends TType, TDetails> = Omit<TController, 'type'> & {
  type: T
  details: TDetails
}
type TMovieController = TBaseController<'MOVIE', T_TMDB_MOVIE_DETAILS>
type TPersonController = TBaseController<'PERSON', T_TMDB_PERSON_DETAILS>

export type { TType, TController, TMovieController, TPersonController }
