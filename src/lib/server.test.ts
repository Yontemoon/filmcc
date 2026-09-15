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

  // A second, disjoint graph for the genre budget: movie 100 reaches person 199
  // in three moves through 121, or in five through 131 and 133.
  100: { cast: [120, 130], crew: [] },
  121: { cast: [120, 199], crew: [] },
  131: { cast: [130, 132], crew: [] },
  133: { cast: [132, 199], crew: [] },
}

// Every movie needs a genre now that a path may spend each genre only once. The
// budget-test route (1 → 21 → 23 → 25) stays genre-legal so it still turns on
// the crew budget alone; the short genre-test route (100 → 121) is Drama twice.
const GENRE_IDS: Record<number, number> = {
  1: 18, // Drama
  3: 80, // Crime
  5: 35, // Comedy
  21: 80, // Crime
  23: 35, // Comedy
  25: 27, // Horror
  100: 18, // Drama
  121: 18, // Drama
  131: 80, // Crime
  133: 35, // Comedy
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
    movieDetails: {
      title: `Movie ${id}`,
      poster_path: `/m${id}.jpg`,
      genres: [{ id: GENRE_IDS[id], name: `Genre ${GENRE_IDS[id]}` }],
    },
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
        genre_ids: [GENRE_IDS[movieId]],
      })),
      crew: (PERSON_MOVIES[id]?.crew ?? []).map((movieId) => ({
        id: movieId,
        title: `Movie ${movieId}`,
        job: 'Director',
        popularity: 1,
        poster_path: `/m${movieId}.jpg`,
        genre_ids: [GENRE_IDS[movieId]],
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

  it('skips the shorter path that would repeat a genre', async () => {
    const result = await getPar(100, 199)

    expect(result).toBeDefined()

    // 100 -> 120 -> 121 -> 199 is three moves and well inside both pick
    // budgets, but movies 100 and 121 are both Drama, so par is the five-move
    // route through Crime and Comedy instead.
    expect(result!.par).toBe(5)
    expect(result!.path.map((node) => node.id)).toEqual([
      100, 130, 131, 132, 133, 199,
    ])

    const genreIds = result!.genresUsed.map((genre) => genre.id)
    expect(genreIds).toEqual([18, 80, 35])
    expect(new Set(genreIds).size).toBe(genreIds.length)
  })
})
