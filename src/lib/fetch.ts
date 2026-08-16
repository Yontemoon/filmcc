import type {
  T_TMDB_MOVIE_CREDITS,
  T_TMDB_MOVIE_DETAILS,
  T_TMDB_PERSON_CREDITS,
  T_TMDB_PERSON_DETAILS,
} from '#/types/tmdb.types'
import { FILTERED_CREW_TYPES, MAX_CAST_CREDITS, TMDB_URL } from './constants'

const tmdbFetch = async <T>(url: string) => {
  const response = await fetch(`${TMDB_URL}${url}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
    },
  })

  if (!response.ok) {
    console.error('[tmdbFetch] response not OK: ', response.text)
  }
  return response.json() as T
}

const getSearchTmdbMovie = async (query: string) => {
  const data = await tmdbFetch<{
    page: number
    results: T_TMDB_MOVIE_DETAILS[] | []
    total_pages: number
    total_results: number
  }>(`/search/movie?query=${query}&include_adult=false&language=en-US&page=1`)
  return data
}

const getSearchTmdbPerson = async (query: string) => {
  const data = await tmdbFetch<{
    page: number
    results: T_TMDB_PERSON_DETAILS[] | []
    total_pages: number
    total_results: number
  }>(`/search/person?query=${query}&include_adult=false&language=en-US&page=1`)
  return data.results
}

const filterCrewCredits = <T extends { job: string }>(crew: Array<T>) => {
  return crew.filter(
    (movie): movie is T & { job: (typeof FILTERED_CREW_TYPES)[number] } =>
      FILTERED_CREW_TYPES.includes(
        movie.job as (typeof FILTERED_CREW_TYPES)[number],
      ),
  )
}

const getTmdbMovie = async (movieId: number) => {
  const [movieDetails, movieCredits] = await Promise.all([
    tmdbFetch<T_TMDB_MOVIE_DETAILS>(`/movie/${movieId}?language=en-US`),
    tmdbFetch<T_TMDB_MOVIE_CREDITS>(
      `/movie/${movieId}/credits?include_adult=false`,
    ),
  ])

  const filteredCastCredits = movieCredits.cast.slice(0, MAX_CAST_CREDITS)
  const filteredCrewCredits = filterCrewCredits(movieCredits.crew)

  return {
    movieDetails,
    movieCredits: {
      id: movieCredits.id,
      cast: filteredCastCredits,
      crew: filteredCrewCredits,
    },
  }
}

const getTmdbPerson = async (personId: number) => {
  const [personDetails, personCredits] = await Promise.all([
    tmdbFetch<T_TMDB_PERSON_DETAILS>(`/person/${personId}?language=en-US`),
    tmdbFetch<T_TMDB_PERSON_CREDITS>(
      `/person/${personId}/movie_credits?include_adult=false`,
    ),
  ])

  const today = new Date()

  const filteredPersonCredits = personCredits.cast.filter((movie) => {
    if (movie.release_date) {
      return new Date(movie.release_date) < today
    }
  })

  const fileredCrewCredits = filterCrewCredits(personCredits.crew)

  return {
    personDetails,
    personCredits: {
      cast: filteredPersonCredits,
      crew: fileredCrewCredits,
    },
  }
}

export {
  tmdbFetch,
  getTmdbMovie,
  getTmdbPerson,
  getSearchTmdbMovie,
  getSearchTmdbPerson,
}
