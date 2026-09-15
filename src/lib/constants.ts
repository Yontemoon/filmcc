import type { TController } from '#/types/client.types'
import type { T_TMDB_GENRE } from '#/types/tmdb.types'

const TMDB_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_PROFILE_URL = `https://image.tmdb.org/t/p/w185`
const TMDB_IMAGE_PROFILE_URL_EXPAND = `https://image.tmdb.org/t/p/h632`
const TMDB_IMAGE_POSTER_URL = 'https://image.tmdb.org/t/p/w185'
const TMDB_IMAGE_POSTER_URL_EXPAND = 'https://image.tmdb.org/t/p/w500'
const POPULARITY_LIMIT = 3.0
const MOVIE_COUNT_LIMIT = 700

const GENRES = [
  {
    id: 28,
    name: 'Action',
  },
  {
    id: 12,
    name: 'Adventure',
  },
  {
    id: 16,
    name: 'Animation',
  },
  {
    id: 35,
    name: 'Comedy',
  },
  {
    id: 80,
    name: 'Crime',
  },
  {
    id: 99,
    name: 'Documentary',
  },
  {
    id: 18,
    name: 'Drama',
  },
  {
    id: 10751,
    name: 'Family',
  },
  {
    id: 14,
    name: 'Fantasy',
  },
  {
    id: 36,
    name: 'History',
  },
  {
    id: 27,
    name: 'Horror',
  },
  {
    id: 10402,
    name: 'Music',
  },
  {
    id: 9648,
    name: 'Mystery',
  },
  {
    id: 10749,
    name: 'Romance',
  },
  {
    id: 878,
    name: 'Science Fiction',
  },
  {
    id: 10770,
    name: 'TV Movie',
  },
  {
    id: 53,
    name: 'Thriller',
  },
  {
    id: 10752,
    name: 'War',
  },
  {
    id: 37,
    name: 'Western',
  },
] as T_TMDB_GENRE[]

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
    genre: {
      id: 18,
      name: 'Drama',
    },
  },
  end: {
    id: 5655,
    type: 'PERSON',
    label: 'Wes Anderson',
    genre: null,
    img_path: '/s03CeUeC5yAXyB1acqP0zGNo2SC.jpg',
  },
} as { dailyGameId: number; start: TController; end: TController }

const MAX_CREW_LINKS = 2
const MAX_CAST_LINKS = 3
const ENTITY_TYPE = ['MOVIE', 'PERSON']
const LINK_TYPE = ['CAST', 'CREW']

const LOCAL_STORAGE_ENTITY_KEY = 'hide_entity'

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
  LOCAL_STORAGE_ENTITY_KEY,
  GENRES,
}
