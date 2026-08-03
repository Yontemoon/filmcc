import type {
  T_TMDB_MOVIE_CREDITS,
  T_TMDB_PERSON_CREDITS,
} from '@/types/tmdb.types'
import type { enumGameStatus } from '#/lib/db/schema'
import type { InferEnum } from 'drizzle-orm'

type T_MOVIE_CREDITS = T_TMDB_MOVIE_CREDITS & { type: 'movie' }
type T_PERSON_CREDITS = T_TMDB_PERSON_CREDITS & { type: 'person' }

type TGameStatuses = InferEnum<typeof enumGameStatus>

export type { T_MOVIE_CREDITS, T_PERSON_CREDITS, TGameStatuses }
