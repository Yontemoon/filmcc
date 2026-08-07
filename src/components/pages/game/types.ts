type TMovieCastCol = {
  id: number
  name: string
  role: string
  profile_url: string
  already_added: boolean
  person_type: 'cast'
  can_be_picked: boolean
}

type TMovieCrewCol = {
  id: number
  name: string
  department: string
  job: string
  profile_url: string
  jobs: string[]
  already_added: boolean
  person_type: 'crew'
  can_be_picked: boolean
}

type TPersonCastCol = {
  id: number
  date: string | null
  title: string
  role: string
  poster_url: string
  already_added: boolean
  person_type: 'cast'
}

type TPersonCrewCol = {
  id: number
  release_date: string | null
  title: string
  poster_url: string
  job: string
  department: string
  jobs: string[]
  already_added: boolean
  person_type: 'crew'
}

export type { TMovieCastCol, TMovieCrewCol, TPersonCastCol, TPersonCrewCol }
