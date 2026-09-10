import type {
  T_TMDB_MOVIE_DETAILS,
  T_TMDB_PERSON_DETAILS,
} from '#/types/tmdb.types'
import type { TController, TlinkType } from '#/types/client.types'
import { getTmdbMovie, getTmdbPerson, tmdbFetch } from '#/lib/fetch'
import { outro, spinner, note, log } from '@clack/prompts'
import {
  POPULARITY_LIMIT,
  MOVIE_COUNT_LIMIT,
  MAX_CAST_CREDITS,
  MAX_CAST_LINKS,
  MAX_CREW_LINKS,
} from '#/lib/constants'
import { getRandomNumber } from '#/lib/utils'

const createRandomDaily = async () => {
  try {
    let numberOfLoops = 1

    const [movie, people] = await Promise.all([
      getRandomValidMovie(),
      getRandomPopularPerson(),
    ])

    let randomPerson = people
    let continueSearchingPerson = true

    if (randomPerson) {
      const isValidPopularPerson = await validateRandomPerson(randomPerson)

      if (isValidPopularPerson) {
        continueSearchingPerson = false
      }
    }

    while (continueSearchingPerson || !randomPerson) {
      numberOfLoops++
      const randomTmdbPerson = await getRandomPopularPerson()

      if (!randomTmdbPerson) {
        continue
      }
      const isValid = await validateRandomPerson(randomTmdbPerson)

      if (isValid) {
        continueSearchingPerson = false
        randomPerson = randomTmdbPerson
      }
    }

    console.info('[Number of people fetches]: ', numberOfLoops)

    return { start: movie, end: randomPerson }
  } catch (error) {
    console.error(error)
  }
}

const getRandomValidMovie = async (): Promise<T_TMDB_MOVIE_DETAILS> => {
  let keepLooking = true as boolean
  while (keepLooking) {
    const randomPage = getRandomNumber(100)
    const movies = await tmdbFetch<{ results: T_TMDB_MOVIE_DETAILS[] }>(
      `/discover/movie?include_adult=false&page=${randomPage}&region=us`,
    ).then((res) => res.results)
    const randomIdx = Math.floor(Math.random() * movies.length)
    const randomMovie = movies[randomIdx]
    console.log('page', randomPage)

    const isValid = randomMovie.vote_count > MOVIE_COUNT_LIMIT

    if (isValid) {
      keepLooking = false
      return randomMovie
    }
  }
  console.error(`[getRandomValidMovie]`)
  throw new Error('Failed to find a valid movie')
}

const getRandomPopularPerson = async () => {
  try {
    const randomPage = getRandomNumber(100)

    const people = await tmdbFetch<{ results: T_TMDB_PERSON_DETAILS[] }>(
      `/person/popular?language=en-US&page=${randomPage}`,
    )
    const randomIndx = getRandomNumber(people.results.length)

    const tmdbPerson = people.results[randomIndx]

    return tmdbPerson
  } catch (error) {
    console.error('[getRandomPopularPerson]', error)
    return null
  }
}

const validateRandomPerson = async (personDetails: T_TMDB_PERSON_DETAILS) => {
  try {
    const personInfo = await getTmdbPerson(personDetails.id)
    const isActor =
      personInfo.personDetails.known_for_department === 'Acting' ? true : false

    const popularity = personInfo.personDetails.popularity

    if (popularity < POPULARITY_LIMIT) {
      return false
    }

    if (isActor) {
      const significantRoles = personInfo.personCredits.cast.filter(
        (credit) => credit.vote_count > 500,
      )

      return significantRoles.length >= 3
    } else {
      const significantJobs = personInfo.personCredits.crew.filter(
        (credit) => credit.vote_count > 500,
      )
      return significantJobs.length >= 3
    }
  } catch (error) {
    console.error(error)
    console.error('[validateRandomPerson]: Something went wrong.')
    return false
  }
}

type NodeKey = string
type StateKey = string
type Neighbor = {
  key: NodeKey
  label: string
  via: string
  imgUrl: string
  linkType: TlinkType
}
type Meta = {
  parent: StateKey | null
  node: NodeKey
  via: string | null
  linkType: TlinkType | null
  dist: number
  cast: number
  crew: number
}

const stateKey = (key: NodeKey, cast: number, crew: number): StateKey =>
  `${key}|${cast}|${crew}`

const movieKey = (id: number): NodeKey => `M:${id}`
const personKey = (id: number): NodeKey => `P:${id}`
const isMovie = (key: NodeKey) => key.startsWith('M:')

const PERSON_MOVIE_LIMIT = 25
const MAX_DEPTH = 8
const CONCURRENCY = 8

/* --- Neighbor lookup + cache --------------------------------------------- *
 * This is the ONLY expensive line in the whole search. Wrapping it in a
 * promise cache means each movie/person is fetched from TMDB at most once,
 * shared across both search directions and repeated layers.
 * ------------------------------------------------------------------------ */
const neighborCache = new Map<NodeKey, Promise<Neighbor[]>>()

let fetchedNodes = 0

function neighbors(key: NodeKey): Promise<Neighbor[]> {
  let pending = neighborCache.get(key)
  if (!pending) {
    fetchedNodes++
    pending = computeNeighbors(key)
    neighborCache.set(key, pending)
  }
  return pending
}

async function computeNeighbors(key: NodeKey): Promise<Neighbor[]> {
  const id = Number(key.slice(2))
  const out: Neighbor[] = []
  const seen = new Set<NodeKey>()

  if (isMovie(key)) {
    let credits
    try {
      credits = (await getTmdbMovie(id)).movieCredits
    } catch {
      return []
    }

    const cast = [...credits.cast]
      .sort((a, b) => a.order - b.order)
      .slice(0, MAX_CAST_CREDITS)

    const crew = [...credits.crew].sort((a, b) => b.popularity - a.popularity)

    for (const c of cast) {
      const k = personKey(c.id)
      if (!c.id || seen.has(k)) continue
      seen.add(k)
      out.push({
        key: k,
        label: c.name,
        via: c.character ? `as ${c.character}` : 'cast',
        imgUrl: c.profile_path,
        linkType: 'CAST',
      })
    }
    for (const c of crew) {
      const k = personKey(c.id)
      if (!c.id || seen.has(k)) continue
      seen.add(k)
      out.push({
        key: k,
        label: c.name,
        via: c.job,
        imgUrl: c.profile_path,
        linkType: 'CREW',
      })
    }
  } else {
    let credits
    try {
      credits = (await getTmdbPerson(id)).personCredits
    } catch {
      return []
    }

    const combined = [
      ...credits.cast.map((m) => ({
        m,
        via: m.character ? `as ${m.character}` : 'cast',
        linkType: 'CAST' as const,
      })),
      ...credits.crew.map((m) => ({
        m,
        via: m.job,
        linkType: 'CREW' as const,
      })),
    ].sort((a, b) => b.m.popularity - a.m.popularity)

    for (const { m, via, linkType } of combined.slice(0, PERSON_MOVIE_LIMIT)) {
      const k = movieKey(m.id)
      if (!m.id || !m.title || seen.has(k)) continue
      seen.add(k)
      out.push({ key: k, label: m.title, via, imgUrl: m.poster_path, linkType })
    }
  }

  return out
}

async function pool<T>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  let cursor = 0
  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (cursor < items.length) {
        const idx = cursor++
        await fn(items[idx])
      }
    },
  )
  await Promise.all(workers)
}

type PathResult = {
  keys: NodeKey[]
  vias: string[]
  linkTypes: (TlinkType | null)[]
  labels: Map<NodeKey, string>
  distance: number
  imgs: Map<NodeKey, string>
  castUsed: number
  crewUsed: number
}

/* A path only counts a pick when it lands on a PERSON, so the movie -> person
 * hop is the one that costs budget. The forward search walks the path in order
 * (it pays when leaving a movie); the backward search walks it in reverse (it
 * pays when leaving a person, because that edge is a movie -> person hop once
 * the path is read forwards). Each direction therefore pays for a disjoint set
 * of edges, so the two halves' tallies can simply be added at the meet point. */
const paysAtSource = (node: NodeKey, forward: boolean) =>
  forward ? isMovie(node) : !isMovie(node)

/* Reaching the same node with fewer picks of both kinds at no extra distance is
 * strictly better, so the dominated state can never produce a better answer. */
const isDominated = (
  metaThis: Map<StateKey, Meta>,
  statesByNode: Map<NodeKey, StateKey[]>,
  node: NodeKey,
  cast: number,
  crew: number,
) =>
  (statesByNode.get(node) ?? []).some((sk) => {
    const m = metaThis.get(sk)!
    return m.cast <= cast && m.crew <= crew
  })

async function biBFS(
  startKey: NodeKey,
  targetKey: NodeKey,
  startLabel: string,
  targetLabel: string,
  startUrl: string,
  endUrl: string,
  onProgress?: (msg: string) => void,
): Promise<PathResult | null> {
  const labels = new Map<NodeKey, string>([
    [startKey, startLabel],
    [targetKey, targetLabel],
  ])
  const imgs = new Map<NodeKey, string>([
    [startKey, startUrl],
    [targetKey, endUrl],
  ])

  const rootF = stateKey(startKey, 0, 0)
  const rootB = stateKey(targetKey, 0, 0)

  const metaF = new Map<StateKey, Meta>([
    [
      rootF,
      {
        parent: null,
        node: startKey,
        via: null,
        linkType: null,
        dist: 0,
        cast: 0,
        crew: 0,
      },
    ],
  ])
  const metaB = new Map<StateKey, Meta>([
    [
      rootB,
      {
        parent: null,
        node: targetKey,
        via: null,
        linkType: null,
        dist: 0,
        cast: 0,
        crew: 0,
      },
    ],
  ])

  const statesF = new Map<NodeKey, StateKey[]>([[startKey, [rootF]]])
  const statesB = new Map<NodeKey, StateKey[]>([[targetKey, [rootB]]])

  let frontierF: StateKey[] = [rootF]
  let frontierB: StateKey[] = [rootB]
  let depth = 0

  const expand = async (
    frontier: StateKey[],
    forward: boolean,
    metaThis: Map<StateKey, Meta>,
    statesThis: Map<NodeKey, StateKey[]>,
    metaOther: Map<StateKey, Meta>,
    statesOther: Map<NodeKey, StateKey[]>,
  ): Promise<{
    next: StateKey[]
    meet: { here: StateKey; there: StateKey } | null
  }> => {
    const next: StateKey[] = []
    let meet: { here: StateKey; there: StateKey } | null = null
    let meetTotal = Infinity

    await pool(frontier, CONCURRENCY, async (from) => {
      const parent = metaThis.get(from)!
      const pays = paysAtSource(parent.node, forward)
      const nbrs = await neighbors(parent.node)

      for (const nb of nbrs) {
        const cast = parent.cast + (pays && nb.linkType === 'CAST' ? 1 : 0)
        const crew = parent.crew + (pays && nb.linkType === 'CREW' ? 1 : 0)

        if (cast > MAX_CAST_LINKS || crew > MAX_CREW_LINKS) continue

        const to = stateKey(nb.key, cast, crew)
        if (metaThis.has(to)) continue
        if (isDominated(metaThis, statesThis, nb.key, cast, crew)) continue

        metaThis.set(to, {
          parent: from,
          node: nb.key,
          via: nb.via,
          linkType: pays ? nb.linkType : null,
          dist: parent.dist + 1,
          cast,
          crew,
        })
        const siblings = statesThis.get(nb.key)
        if (siblings) siblings.push(to)
        else statesThis.set(nb.key, [to])
        labels.set(nb.key, nb.label)
        imgs.set(nb.key, nb.imgUrl)
        next.push(to)

        for (const otherKey of statesOther.get(nb.key) ?? []) {
          const other = metaOther.get(otherKey)!

          /* The two halves meet on the same node but own disjoint edges, so
           * their budgets add. Reject the join if the whole path would cost
           * more picks than the player is given. */
          if (other.cast + cast > MAX_CAST_LINKS) continue
          if (other.crew + crew > MAX_CREW_LINKS) continue

          const total = parent.dist + 1 + other.dist
          if (total < meetTotal) {
            meetTotal = total
            meet = { here: to, there: otherKey }
          }
        }
      }
    })

    return { next, meet }
  }

  while (frontierF.length && frontierB.length) {
    if (depth >= MAX_DEPTH) return null

    const forwardTurn = frontierF.length <= frontierB.length
    const { next, meet } = forwardTurn
      ? await expand(frontierF, true, metaF, statesF, metaB, statesB)
      : await expand(frontierB, false, metaB, statesB, metaF, statesF)

    if (forwardTurn) frontierF = next
    else frontierB = next
    depth++

    onProgress?.(
      `depth ${depth} · forward ${frontierF.length} · backward ${frontierB.length} · ${fetchedNodes} nodes fetched`,
    )

    if (meet) {
      const { here, there } = meet
      return forwardTurn
        ? stitch(here, there, metaF, metaB, labels, imgs)
        : stitch(there, here, metaF, metaB, labels, imgs)
    }
  }

  return null
}

function stitch(
  meetF: StateKey,
  meetB: StateKey,
  metaF: Map<StateKey, Meta>,
  metaB: Map<StateKey, Meta>,
  labels: Map<NodeKey, string>,
  imgs: Map<NodeKey, string>,
): PathResult {
  const fChain: StateKey[] = []
  for (
    let cur: StateKey | null = meetF;
    cur !== null;
    cur = metaF.get(cur)!.parent
  ) {
    fChain.push(cur)
  }
  fChain.reverse()

  const keys: NodeKey[] = fChain.map((sk) => metaF.get(sk)!.node)
  const vias: string[] = []
  const linkTypes: (TlinkType | null)[] = []
  for (let i = 1; i < fChain.length; i++) {
    const m = metaF.get(fChain[i])!
    vias.push(m.via ?? '')
    linkTypes.push(m.linkType)
  }

  for (let cur: StateKey = meetB; metaB.get(cur)!.parent !== null;) {
    const m = metaB.get(cur)!
    /* `m` describes the edge between `cur` and its backward parent, which is
     * the very next edge in path order, so it lines up with the forward half. */
    vias.push(m.via ?? '')
    linkTypes.push(m.linkType)
    keys.push(metaB.get(m.parent!)!.node)
    cur = m.parent!
  }

  const castUsed = metaF.get(meetF)!.cast + metaB.get(meetB)!.cast
  const crewUsed = metaF.get(meetF)!.crew + metaB.get(meetB)!.crew

  return {
    keys,
    vias,
    linkTypes,
    labels,
    distance: vias.length,
    imgs,
    castUsed,
    crewUsed,
  }
}

function renderPath(result: PathResult): string {
  const lines: string[] = []
  result.keys.forEach((key, i) => {
    const label = result.labels.get(key) ?? key
    lines.push(`${label}`)
    if (i < result.keys.length - 1) {
      const linkType = result.linkTypes[i]
      lines.push(
        `     │  ${result.vias[i]}${linkType ? ` (${linkType} pick)` : ''}`,
      )
      lines.push(`     ▼`)
    }
  })
  return lines.join('\n')
}

const reformatToController = (result: PathResult): TController[] => {
  const controller: TController[] = []

  result.keys.forEach((key) => {
    const label = result.labels.get(key) ?? key
    const imgUrl = result.imgs.get(key) ?? key
    const keyVals = key.split(':')
    const id = Number(keyVals[1])

    controller.push({
      id: id,
      label: label,
      type: isMovie(key) ? 'MOVIE' : 'PERSON',
      img_path: imgUrl,
    })
  })
  return controller
}

async function getPar(selectedMovie: number, selectedPerson: number) {
  const detailsSpin = spinner()
  detailsSpin.start('Loading endpoints…')
  const [{ movieDetails }, { personDetails }] = await Promise.all([
    getTmdbMovie(selectedMovie),
    getTmdbPerson(selectedPerson),
  ])
  detailsSpin.stop(`${movieDetails.title}  →  ${personDetails.name}`)
  const moviePosterUrl = movieDetails.poster_path
  const personImageUrl = personDetails.profile_path

  const startKey = movieKey(selectedMovie)
  const targetKey = personKey(selectedPerson)

  const searchSpin = spinner()
  searchSpin.start('Digging from both ends…')
  const startedAt = Date.now()

  const result = await biBFS(
    startKey,
    targetKey,
    movieDetails.title,
    personDetails.name,
    moviePosterUrl,
    personImageUrl,
    (msg) => searchSpin.message(`Digging from both ends… (${msg})`),
  )

  const elapsedMs = Date.now() - startedAt

  if (!result) {
    searchSpin.stop('No path found.')
    log.warn(
      `Couldn't connect them within ${MAX_DEPTH} degrees on a budget of ` +
        `${MAX_CAST_LINKS} cast / ${MAX_CREW_LINKS} crew picks (with pruned ` +
        `fan-out). Fetched ${fetchedNodes} nodes in ${(
          elapsedMs / 1000
        ).toFixed(1)}s.`,
    )
    outro('Try a more mainstream movie or person.')
    return
  }

  /* The search can only build budget-legal paths, so this is a guard against a
   * future regression rather than an expected outcome. Publishing a par a
   * player cannot reach is worse than publishing no game at all. */
  if (result.castUsed > MAX_CAST_LINKS || result.crewUsed > MAX_CREW_LINKS) {
    searchSpin.stop('Path exceeds the pick budget.')
    log.error(
      `[getPar] path costs ${result.castUsed} cast / ${result.crewUsed} crew, ` +
        `over the ${MAX_CAST_LINKS} / ${MAX_CREW_LINKS} budget.`,
    )
    outro('Refusing to publish an unreachable par.')
    return
  }

  searchSpin.stop(`Connected in ${result.distance} moves!`)

  const controllerFormat = reformatToController(result)

  note(renderPath(result), 'Shortest path')
  log.info(
    `par: ${result.distance} moves · ${result.castUsed}/${MAX_CAST_LINKS} cast · ` +
      `${result.crewUsed}/${MAX_CREW_LINKS} crew · ${fetchedNodes} nodes fetched · ${(
        elapsedMs / 1000
      ).toFixed(1)}s`,
  )
  outro('Done.')

  return {
    par: result.distance,
    path: controllerFormat,
    castUsed: result.castUsed,
    crewUsed: result.crewUsed,
  }
}

export {
  createRandomDaily,
  validateRandomPerson,
  getRandomNumber,
  getRandomPopularPerson,
  getPar,
}
