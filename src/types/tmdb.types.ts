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
  release_date: string | null
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

interface T_TMDB_MOVIE_DETAILS {
  adult: boolean
  backdrop_path: string
  belongs_to_collection: any | null
  budget: number
  genres: {
    id: number
    name: string
  }[]
  homepage: string
  id: number
  imdb_id: string
  origin_country: string[]
  original_language: string
  original_title: string
  overview: string
  popularity: number
  poster_path: string
  production_companies: {
    id: number
    logo_path: string | null
    name: string
    origin_country: string
  }[]
  production_countries: {
    iso_3166_1: string
    name: string
  }[]
  release_date: string | null
  revenue: number
  runtime: number
  softcore: boolean
  spoken_languages: {
    english_name: string
    iso_639_1: string
    name: string
  }[]
  status: string
  tagline: string
  title: string
  video: boolean
  vote_average: number
  vote_count: number
}

interface T_TMDB_PERSON_DETAILS {
  adult: boolean
  also_known_as: string[]
  biography: string
  birthday: string
  deathday: string | null
  gender: number
  homepage: string | null
  id: number
  imdb_id: string | null
  known_for_department: string
  name: string
  place_of_birth: string
  popularity: number
  profile_path: string
}

interface T_TMDB_EXTERNAL_IDS {
  id: number
  freebase_mid: null | string
  freebase_id: null | string
  imdb_id: null | string
  tvrage_id: null | string
  wikidata_id: null | string
  facebook_id: null | string
  instagram_id: null | string
  tiktok_id: null | string
  twitter_id: null | string
  youtube_id: null | string
}

export type {
  T_TMDB_MOVIE_CREDITS,
  T_TMDB_CAST,
  T_TMDB_CREW,
  T_TMDB_PERSON_CREDITS,
  T_TMDB_MOVIE_DETAILS,
  T_TMDB_PERSON_DETAILS,
  T_TMDB_EXTERNAL_IDS,
}
