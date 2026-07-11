interface T_OMDB_PERSON_DETAILS {
  id: string
  imdb_url: string
  name: string
  also_known_as: string[]
  biography: string
  birthday: string
  deathday: null | string
  place_of_birth: string
  place_of_death: string | null
  height: string
  gender: number
  known_for_department: string
  popularity: number
  profile_path: string
  adult: false
  birth_name: null | string
  death_cause: null | string
  death_status: string
}

export type { T_OMDB_PERSON_DETAILS }
