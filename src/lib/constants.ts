import type { TController } from '#/types/client.types'

const TMDB_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_PROFILE_URL = `https://image.tmdb.org/t/p/w185`
const TMDB_IMAGE_PROFILE_URL_EXPAND = `https://image.tmdb.org/t/p/h632`
const TMDB_IMAGE_POSTER_URL = 'https://image.tmdb.org/t/p/w185'
const TMDB_IMAGE_POSTER_URL_EXPAND = 'https://image.tmdb.org/t/p/w500'
const POPULARITY_LIMIT = 3.0
const MOVIE_COUNT_LIMIT = 700

// * ALSO IN ORDER OF IMPORTANCES
const FILTERED_CREW_TYPES = [
  'Director',
  'Screenplay',
  'Author',
  'Writer',
  'Director of Photography',
  'Editor',
  'Original Music Composer',
] as const

const MAX_CAST_CREDITS = 15

const DEMO = {
  dailyGameId: 1,
  start: {
    id: 73,
    type: 'MOVIE',
    label: 'American History X',
    creditInfo: null,
    img_path: '/x2drgoXYZ8484lqyDj7L1CEVR4T.jpg',
  },
  end: {
    id: 5655,
    type: 'PERSON',
    label: 'Wes Anderson',
    creditInfo: null,
    img_path: '/s03CeUeC5yAXyB1acqP0zGNo2SC.jpg',
  },
} as { dailyGameId: number; start: TController; end: TController }

const MAX_CREW_LINKS = 2
const MAX_CAST_LINKS = 3
const ENTITY_TYPE = ['MOVIE', 'PERSON']
const LINK_TYPE = ['CAST', 'CREW']

export {
  TMDB_URL,
  POPULARITY_LIMIT,
  TMDB_IMAGE_PROFILE_URL,
  TMDB_IMAGE_POSTER_URL,
  TMDB_IMAGE_PROFILE_URL_EXPAND,
  TMDB_IMAGE_POSTER_URL_EXPAND,
  MOVIE_COUNT_LIMIT,
  DEMO,
  MAX_CAST_LINKS,
  MAX_CREW_LINKS,
  FILTERED_CREW_TYPES,
  MAX_CAST_CREDITS,
  ENTITY_TYPE,
  LINK_TYPE,
}

// const TFilterCrew = FILTERED_CREW_TYPES as const

export type {}
