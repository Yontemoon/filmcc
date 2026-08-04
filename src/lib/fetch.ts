import type {
  T_TMDB_CREW,
  T_TMDB_MOVIE_CREDITS,
  T_TMDB_MOVIE_DETAILS,
  T_TMDB_PERSON_CREDITS,
  T_TMDB_PERSON_DETAILS,
} from '#/types/tmdb.types'
import { OMDB_URL, TMDB_URL } from './constants'

const tmdbFetch = async <T>(url: string) => {
  const response = await fetch(`${TMDB_URL}${url}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
    },
  })

  if (!response.ok) {
    console.error('[tmdbFetch] response not OK: ', response.text)
    // throw new Error(response.statusText)
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

// * FILTERED DIRECTOR, WRITER, CINEMATOGRAPHER, COMPOSER (MUSIC), EDITOR
const filterCrewCredits = <
  T extends T_TMDB_CREW | T_TMDB_PERSON_CREDITS['crew'][0],
>(
  crew: Array<T>,
) => {
  return crew.filter(
    (movie) =>
      movie.job === 'Director' ||
      movie.job === 'Director of Photography' ||
      movie.job === 'Editor' ||
      movie.job === 'Original Music Composer' ||
      movie.job === 'Screenplay' ||
      movie.job === 'Writer' ||
      movie.job === 'Author',
  )
}

const getTmdbMovie = async (
  movieId: number,
): Promise<{
  movieDetails: T_TMDB_MOVIE_DETAILS
  movieCredits: T_TMDB_MOVIE_CREDITS
}> => {
  const [movieDetails, movieCredits] = await Promise.all([
    tmdbFetch<T_TMDB_MOVIE_DETAILS>(`/movie/${movieId}?language=en-US`),
    tmdbFetch<T_TMDB_MOVIE_CREDITS>(
      `/movie/${movieId}/credits?include_adult=false`,
    ),
  ])

  const filteredCastCredits = movieCredits.cast.slice(0, 15)
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
  personCredits.cast = filteredPersonCredits
  personCredits.crew = fileredCrewCredits

  return {
    personDetails,
    personCredits,
  }
}

const omdbFetch = async <T>(url: string) => {
  const response = await fetch(`${OMDB_URL}${url}`, {
    method: 'GET',
  })
  const data = (await response.json()) as T
  return data
}

export {
  tmdbFetch,
  omdbFetch,
  getTmdbMovie,
  getTmdbPerson,
  getSearchTmdbMovie,
  getSearchTmdbPerson,
}
