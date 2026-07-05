const tmdbFetch = async <T>(url: string) => {
  const response = await fetch(`https://api.themoviedb.org/3/${url}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
    },
  })
  const data = (await response.json()) as T
  return data
}

export { tmdbFetch }
