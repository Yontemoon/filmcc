type TMovieCastCol = {
  id: number
  name: string
  role: string
  profile_url: string
}

type TMovieCrewCol = {
  id: number
  name: string
  department: string
  job: string
  profile_url: string
  jobs: string[]
}

type TPersonCastCol = {
  id: number
  date: string | null
  title: string
  role: string
  poster_url: string
}

type TPersonCrewCol = {
  id: number
  release_date: string | null
  title: string
  poster_url: string
  job: string
  department: string
  jobs: string[]
}

export type { TMovieCastCol, TMovieCrewCol, TPersonCastCol, TPersonCrewCol }
