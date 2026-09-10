import { describe, expect, it, vi } from 'vitest'
import { MAX_CAST_LINKS, MAX_CREW_LINKS } from '#/lib/constants'

type Credits = { cast: number[]; crew: number[] }
const GRAPH: Record<number, Credits | undefined> = {
  1: { cast: [20], crew: [2] },
  3: { cast: [], crew: [4] },
  5: { cast: [], crew: [9] },
  21: { cast: [22], crew: [] },
  23: { cast: [24], crew: [] },
  25: { cast: [], crew: [9] },
}
const PERSON_MOVIES: Record<number, Credits | undefined> = {}
for (const [movieId, credits] of Object.entries(GRAPH)) {
  for (const dept of ['cast', 'crew'] as const) {
    for (const personId of credits![dept]) {
      const entry = (PERSON_MOVIES[personId] ??= { cast: [], crew: [] })
      entry[dept].push(Number(movieId))
    }
  }
}

for (const [personId, movieId] of [
  [2, 3],
  [4, 5],
  [20, 21],
  [22, 23],
  [24, 25],
] as const) {
  const person = (PERSON_MOVIES[personId] ??= { cast: [], crew: [] })
  person.cast.push(movieId)
  const movie = (GRAPH[movieId] ??= { cast: [], crew: [] })
  movie.cast.push(personId)
}

vi.mock('#/lib/fetch', () => ({
  tmdbFetch: vi.fn(),
  getTmdbMovie: async (id: number) => ({
    movieDetails: { title: `Movie ${id}`, poster_path: `/m${id}.jpg` },
    movieCredits: {
      cast: (GRAPH[id]?.cast ?? []).map((personId, order) => ({
        id: personId,
        name: `Person ${personId}`,
        order,
        character: `Role ${personId}`,
        profile_path: `/p${personId}.jpg`,
      })),
      crew: (GRAPH[id]?.crew ?? []).map((personId) => ({
        id: personId,
        name: `Person ${personId}`,
        job: 'Director',
        popularity: 1,
        profile_path: `/p${personId}.jpg`,
      })),
    },
  }),
  getTmdbPerson: async (id: number) => ({
    personDetails: { name: `Person ${id}`, profile_path: `/p${id}.jpg` },
    personCredits: {
      cast: (PERSON_MOVIES[id]?.cast ?? []).map((movieId) => ({
        id: movieId,
        title: `Movie ${movieId}`,
        character: `Role ${id}`,
        popularity: 1,
        poster_path: `/m${movieId}.jpg`,
      })),
      crew: (PERSON_MOVIES[id]?.crew ?? []).map((movieId) => ({
        id: movieId,
        title: `Movie ${movieId}`,
        job: 'Director',
        popularity: 1,
        poster_path: `/m${movieId}.jpg`,
      })),
    },
  }),
}))

vi.mock('@clack/prompts', () => {
  const noop = () => {}
  return {
    spinner: () => ({ start: noop, stop: noop, message: noop }),
    outro: noop,
    note: noop,
    log: { info: noop, warn: noop, error: noop },
  }
})

const { getPar } = await import('#/lib/server')

describe('getPar', () => {
  it('skips the shorter path that would blow the crew budget', async () => {
    const result = await getPar(1, 9)

    expect(result).toBeDefined()
    expect(result!.castUsed).toBeLessThanOrEqual(MAX_CAST_LINKS)
    expect(result!.crewUsed).toBeLessThanOrEqual(MAX_CREW_LINKS)

    // the 5-move all-crew route costs 3 crew picks, so par is the 7-move route
    expect(result!.par).toBe(7)
    expect(result!.path.map((node) => node.id)).toEqual([
      1, 20, 21, 22, 23, 24, 25, 9,
    ])
  })
})
