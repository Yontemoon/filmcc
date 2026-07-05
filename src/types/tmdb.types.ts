interface T_TMDB_MOVIE_CREDITS {
  id: number
  cast: T_TMDB_CAST[]
  crew: T_TMDB_CREW[]
}

interface T_TMDB_PERSON_CREDITS {
  id: number
  cast: TPersonCast[]
  crew: TPersonCrew[]
}

interface TPersonCast extends T_TMDB_MOVIE_DETAILS {
  character: string
  credit_id: string
  order: number
}
interface TPersonCrew extends T_TMDB_MOVIE_DETAILS {
  department: string
  job: string
}

interface T_TMDB_MOVIE_DETAILS {
  adult: boolean
  backdrop_path: string
  genre_ids: number[]
  id: number
  title: string
  original_language: string
  original_title: string
  overview: string
  popularity: number
  poster_path: string
  release_date: string
  softcore: boolean
  video: boolean
  vote_average: number
  vote_count: number
}

interface T_TMDB_CAST {
  adult: boolean
  gender: number
  id: number
  known_for_department: string
  name: string
  original_name: string
  popularity: number
  profile_path: string
  cast_id: number
  character: string
  credit_id: string
  order: number
}

interface T_TMDB_CREW {
  adult: boolean
  gender: number
  id: number
  known_for_department: string
  name: string
  original_name: string
  popularity: number
  profile_path: string
  credit_id: string
  department: string
  job: string
}

export type {
  T_TMDB_MOVIE_CREDITS,
  T_TMDB_CAST,
  T_TMDB_CREW,
  T_TMDB_PERSON_CREDITS,
}
