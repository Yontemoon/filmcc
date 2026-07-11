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

const omdbFetch = async <T>(url: string) => {
  const response = await fetch(`${OMDB_URL}${url}`, {
    method: 'GET',
  })
  const data = (await response.json()) as T
  return data
}

export { tmdbFetch, omdbFetch }
