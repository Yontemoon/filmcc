import 'dotenv/config'
import {
  intro,
  outro,
  text,
  select,
  isCancel,
  cancel,
  spinner,
  note,
  log,
} from '@clack/prompts'
import {
  getSearchTmdbMovie,
  getSearchTmdbPerson,
  getTmdbMovie,
  getTmdbPerson,
} from '../src/lib/fetch'

type NodeKey = string
type Neighbor = { key: NodeKey; label: string; via: string }
type Meta = { parent: NodeKey | null; via: string | null; dist: number }

const movieKey = (id: number): NodeKey => `M:${id}`
const personKey = (id: number): NodeKey => `P:${id}`
const isMovie = (key: NodeKey) => key.startsWith('M:')

const CAST_LIMIT = 15
const CREW_LIMIT = 8
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
      .slice(0, CAST_LIMIT)
    const crew = [...credits.crew]
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, CREW_LIMIT)

    for (const c of cast) {
      const k = personKey(c.id)
      if (!c.id || seen.has(k)) continue
      seen.add(k)
      out.push({
        key: k,
        label: c.name,
        via: c.character ? `as ${c.character}` : 'cast',
      })
    }
    for (const c of crew) {
      const k = personKey(c.id)
      if (!c.id || seen.has(k)) continue
      seen.add(k)
      out.push({ key: k, label: c.name, via: c.job || c.department || 'crew' })
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
      ...credits.crew.map((m) => ({ m, via: m.job || 'crew' })),
    ].sort((a, b) => b.m.popularity - a.m.popularity)

    for (const { m, via } of combined.slice(0, PERSON_MOVIE_LIMIT)) {
      const k = movieKey(m.id)
      if (!m.id || !m.title || seen.has(k)) continue
      seen.add(k)
      out.push({ key: k, label: m.title, via })
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
}

async function biBFS(
  startKey: NodeKey,
  targetKey: NodeKey,
  startLabel: string,
  targetLabel: string,
  onProgress?: (msg: string) => void,
): Promise<PathResult | null> {
  const labels = new Map<NodeKey, string>([
    [startKey, startLabel],
    [targetKey, targetLabel],
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

    if (meet) return stitch(meet, metaF, metaB, labels)
  }

  return null
}

function stitch(
  meet: NodeKey,
  metaF: Map<NodeKey, Meta>,
  metaB: Map<NodeKey, Meta>,
  labels: Map<NodeKey, string>,
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
  for (let cur: NodeKey = meet; metaB.get(cur)!.parent !== null; ) {
    const m = metaB.get(cur)!
    bVias.push(m.via ?? '')
    bChain.push(m.parent!)
    cur = m.parent!
  }

  const keys = [...fChain, ...bChain]
  const vias = [...fVias, ...bVias]
  return { keys, vias, labels, distance: vias.length }
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

function bail(): never {
  cancel('Operation cancelled.')
  process.exit(0)
}

async function main() {
  console.clear()
  intro('Shortest Path — connect a movie to a person')

  const startingMovieSearch = await text({
    message: 'Type a movie you want to start with.',
    placeholder: 'The Odyssey',
    validate: (v) => (!v ? 'Please enter a movie title.' : undefined),
  })
  if (isCancel(startingMovieSearch)) bail()

  const movieSpin = spinner()
  movieSpin.start('Searching movies…')
  const movies = await getSearchTmdbMovie(startingMovieSearch)
  movieSpin.stop(`Found ${movies.length} movies.`)

  if (movies.length === 0) {
    log.error('No movies matched that search.')
    process.exit(1)
  }

  const selectedMovie = await select({
    message: 'Select the movie:',
    options: movies.map((movie) => ({
      value: movie.id,
      label: `${movie.title} — ${movie.release_date ?? '????'}`,
      hint: movie.overview.slice(0, 80),
    })),
  })
  if (isCancel(selectedMovie)) bail()

  const endingPersonSearch = await text({
    message: 'Type a person you want to end with.',
    placeholder: 'David Fincher',
    validate: (v) => (!v ? 'Please enter a person name.' : undefined),
  })
  if (isCancel(endingPersonSearch)) bail()

  const personSpin = spinner()
  personSpin.start('Searching people…')
  const people = await getSearchTmdbPerson(endingPersonSearch)
  personSpin.stop(`Found ${people.length} people.`)

  if (people.length === 0) {
    log.error('No people matched that search.')
    process.exit(1)
  }

  const selectedPerson = await select({
    message: 'Select the person:',
    options: people.map((person) => ({
      value: person.id,
      label: `${person.name} — ${person.known_for_department}`,
      hint: person.known_for
        .map((c) => c.title)
        .filter(Boolean)
        .join(', '),
    })),
  })
  if (isCancel(selectedPerson)) bail()

  const detailsSpin = spinner()
  detailsSpin.start('Loading endpoints…')
  const [{ movieDetails }, { personDetails }] = await Promise.all([
    getTmdbMovie(selectedMovie),
    getTmdbPerson(selectedPerson),
  ])
  detailsSpin.stop(`${movieDetails.title}  →  ${personDetails.name}`)

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
  note(renderPath(result), 'Shortest path')
  log.info(
    `par: ${result.distance} moves · ${fetchedNodes} nodes fetched · ${(
      elapsedMs / 1000
    ).toFixed(1)}s`,
  )
  outro('Done.')
}

main().catch((error) => {
  log.error('Something went wrong.')
  console.error(error)
  process.exit(1)
})
