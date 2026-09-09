import type {
  T_TMDB_MOVIE_DETAILS,
  T_TMDB_PERSON_DETAILS,
} from '#/types/tmdb.types'
import type { TController } from '#/types/client.types'

import { getTmdbMovie, getTmdbPerson, tmdbFetch } from '#/lib/fetch'
import { outro, spinner, note, log } from '@clack/prompts'
import {
  POPULARITY_LIMIT,
  MOVIE_COUNT_LIMIT,
  MAX_CAST_CREDITS,
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
type Neighbor = { key: NodeKey; label: string; via: string; imgUrl: string }
type Meta = { parent: NodeKey | null; via: string | null; dist: number }

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
      })
    }
    for (const c of crew) {
      const k = personKey(c.id)
      if (!c.id || seen.has(k)) continue
      seen.add(k)
      out.push({ key: k, label: c.name, via: c.job, imgUrl: c.profile_path })
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
      })),
      ...credits.crew.map((m) => ({ m, via: m.job })),
    ].sort((a, b) => b.m.popularity - a.m.popularity)

    for (const { m, via } of combined.slice(0, PERSON_MOVIE_LIMIT)) {
      const k = movieKey(m.id)
      if (!m.id || !m.title || seen.has(k)) continue
      seen.add(k)
      out.push({ key: k, label: m.title, via, imgUrl: m.poster_path })
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
  labels: Map<NodeKey, string>
  distance: number
  imgs: Map<NodeKey, string>
}

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

  const metaF = new Map<NodeKey, Meta>([
    [startKey, { parent: null, via: null, dist: 0 }],
  ])
  const metaB = new Map<NodeKey, Meta>([
    [targetKey, { parent: null, via: null, dist: 0 }],
  ])

  let frontierF: NodeKey[] = [startKey]
  let frontierB: NodeKey[] = [targetKey]
  let depth = 0

  const expand = async (
    frontier: NodeKey[],
    metaThis: Map<NodeKey, Meta>,
    metaOther: Map<NodeKey, Meta>,
  ): Promise<{ next: NodeKey[]; meet: NodeKey | null }> => {
    const next: NodeKey[] = []
    let meet: NodeKey | null = null
    let meetTotal = Infinity

    await pool(frontier, CONCURRENCY, async (nodeKey) => {
      const parentDist = metaThis.get(nodeKey)!.dist
      const nbrs = await neighbors(nodeKey)

      for (const nb of nbrs) {
        if (metaThis.has(nb.key)) continue
        metaThis.set(nb.key, {
          parent: nodeKey,
          via: nb.via,
          dist: parentDist + 1,
        })
        labels.set(nb.key, nb.label)
        imgs.set(nb.key, nb.imgUrl)
        next.push(nb.key)

        const other = metaOther.get(nb.key)
        if (other) {
          const total = parentDist + 1 + other.dist
          if (total < meetTotal) {
            meetTotal = total
            meet = nb.key
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
      ? await expand(frontierF, metaF, metaB)
      : await expand(frontierB, metaB, metaF)

    if (forwardTurn) frontierF = next
    else frontierB = next
    depth++

    onProgress?.(
      `depth ${depth} · forward ${frontierF.length} · backward ${frontierB.length} · ${fetchedNodes} nodes fetched`,
    )

    if (meet) return stitch(meet, metaF, metaB, labels, imgs)
  }

  return null
}

function stitch(
  meet: NodeKey,
  metaF: Map<NodeKey, Meta>,
  metaB: Map<NodeKey, Meta>,
  labels: Map<NodeKey, string>,
  imgs: Map<NodeKey, string>,
): PathResult {
  const fChain: NodeKey[] = []
  for (
    let cur: NodeKey | null = meet;
    cur !== null;
    cur = metaF.get(cur)!.parent
  ) {
    fChain.push(cur)
  }
  fChain.reverse()
  const fVias: string[] = []
  for (let i = 1; i < fChain.length; i++) {
    fVias.push(metaF.get(fChain[i])!.via ?? '')
  }

  const bChain: NodeKey[] = []
  const bVias: string[] = []
  for (let cur: NodeKey = meet; metaB.get(cur)!.parent !== null;) {
    const m = metaB.get(cur)!
    bVias.push(m.via ?? '')
    bChain.push(m.parent!)
    cur = m.parent!
  }

  const keys = [...fChain, ...bChain]
  const vias = [...fVias, ...bVias]
  return { keys, vias, labels, distance: vias.length, imgs: imgs }
}

function renderPath(result: PathResult): string {
  const lines: string[] = []
  result.keys.forEach((key, i) => {
    const label = result.labels.get(key) ?? key
    lines.push(`${label}`)
    if (i < result.keys.length - 1) {
      lines.push(`     │  ${result.vias[i]}`)
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
      `Couldn't connect them within ${MAX_DEPTH} degrees (with pruned fan-out). ` +
        `Fetched ${fetchedNodes} nodes in ${(elapsedMs / 1000).toFixed(1)}s.`,
    )
    outro('Try a more mainstream movie or person.')
    return
  }

  searchSpin.stop(`Connected in ${result.distance} moves!`)

  const controllerFormat = reformatToController(result)

  note(renderPath(result), 'Shortest path')
  log.info(
    `par: ${result.distance} moves · ${fetchedNodes} nodes fetched · ${(
      elapsedMs / 1000
    ).toFixed(1)}s`,
  )
  outro('Done.')

  return { par: result.distance, path: controllerFormat }
}

export {
  createRandomDaily,
  validateRandomPerson,
  getRandomNumber,
  getRandomPopularPerson,
  getPar,
}
