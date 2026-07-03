const tmdbFetch = async (url: string) => {
  const response = await fetch(`https://api.themoviedb.org/3/${url}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
    },
  })
  const data = await response.json()
  return data
}

export { tmdbFetch }
