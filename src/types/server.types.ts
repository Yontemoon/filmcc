import type {
  T_TMDB_MOVIE_CREDITS,
  T_TMDB_PERSON_CREDITS,
} from '@/types/tmdb.types'

type T_MOVIE_CREDITS = T_TMDB_MOVIE_CREDITS & { type: 'movie' }
type T_PERSON_CREDITS = T_TMDB_PERSON_CREDITS & { type: 'person' }

export type { T_MOVIE_CREDITS, T_PERSON_CREDITS }
