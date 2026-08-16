import type { FILTERED_CREW_TYPES } from '#/lib/constants'

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
  job: (typeof FILTERED_CREW_TYPES)[number]
  profile_url: string
  jobs: (typeof FILTERED_CREW_TYPES)[number][]
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
  can_be_picked: boolean
}

type TPersonCrewCol = {
  id: number
  release_date: string | null
  title: string
  poster_url: string
  job: (typeof FILTERED_CREW_TYPES)[number]
  department: string
  jobs: (typeof FILTERED_CREW_TYPES)[number][]
  already_added: boolean
  person_type: 'crew'
  can_be_picked: boolean
}

export type { TMovieCastCol, TMovieCrewCol, TPersonCastCol, TPersonCrewCol }
