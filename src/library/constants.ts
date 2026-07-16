import type { TController } from '#/types/client.types'

const TMDB_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_PROFILE_URL = `https://image.tmdb.org/t/p/w185`
const TMDB_IMAGE_PROFILE_URL_EXPAND = `https://image.tmdb.org/t/p/h632`
const TMDB_IMAGE_POSTER_URL = 'https://image.tmdb.org/t/p/w185'
const TMDB_IMAGE_POSTER_URL_EXPAND = 'https://image.tmdb.org/t/p/w500'

const OMDB_URL = `https://api.balloonerismm.workers.dev`
const POPULARITY_LIMIT = 10

const DEMO = {
  start: {
    id: 73,
    type: 'MOVIE',
    label: 'American History X',
  },
  end: { id: 5655, type: 'PERSON', label: 'Wes Anderson' },
} as { start: TController; end: TController }

export {
  TMDB_URL,
  OMDB_URL,
  POPULARITY_LIMIT,
  TMDB_IMAGE_PROFILE_URL,
  TMDB_IMAGE_POSTER_URL,
  TMDB_IMAGE_PROFILE_URL_EXPAND,
  TMDB_IMAGE_POSTER_URL_EXPAND,
  DEMO,
}
