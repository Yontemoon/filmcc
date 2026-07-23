import type {
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
  const data = (await response.json()) as T
  return data
}

const getSearchTmdbMovie = async (query: string) => {
  const data = await tmdbFetch<{
    page: number
    results: T_TMDB_MOVIE_DETAILS[] | []
    total_pages: number
    total_results: number
  }>(`/search/movie?query=${query}&include_adult=false&language=en-US&page=1`)
  return data.results
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

const getTmdbMovie = async (movieId: number) => {
  const [movieDetails, movieCredits] = await Promise.all([
    tmdbFetch<T_TMDB_MOVIE_DETAILS>(`/movie/${movieId}?language=en-US`),
    tmdbFetch<T_TMDB_MOVIE_CREDITS>(`/movie/${movieId}/credits`),
  ])
  return { movieDetails, movieCredits }
}

// // TODO WORK ON THIS NEXT
// * DIRECTOR, WRITER, CINEMATOGRAPHER, COMPOSER (MUSIC), EDITOR
// const crewJobs = [
//   'Director',
//   'Editor',
//   'Producer',
//   'Screenplay',
//   'Casting',
//   'Writer',
//   'Costume Design',
//   'Director of Photography',
//   'Stunt Coordinator',
//   'Production Design',
//   'Author',
//   'Visual Effects Supervisor',
//   'Songs',
//   'Executive Producer',
//   'Set Decoration',
//   'Makeup Department Head'
// ]
// const getTmtdbMovieWithFilter = async (movieId: number) => {
//   const data = await getTmdbMovie(movieId)

//   const filteredCrew = data.movieCredits.crew.filter((member) => crewJobs.find(member.known_for_department)

// }

const getTmdbPerson = async (personId: number) => {
  const [personDetails, personCredits] = await Promise.all([
    tmdbFetch<T_TMDB_PERSON_DETAILS>(`/person/${personId}?language=en-US`),
    tmdbFetch<T_TMDB_PERSON_CREDITS>(`/person/${personId}/movie_credits`),
  ])
  return { personDetails, personCredits }
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
