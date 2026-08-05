import db from '#/lib/db'
import { dailyGames, entities } from '#/lib/db/schema'
import { createRandomDaily } from '#/lib/server'
import { isIsoDay } from './date'
import type {
  T_TMDB_MOVIE_DETAILS,
  T_TMDB_PERSON_DETAILS,
} from '#/types/tmdb.types'
import type { TController } from '#/types/client.types'

const GENERATE_ATTEMPTS = 3
const GENERATE_TIMEOUT_MS = 2 * 60 * 1000

type TDailyPair = { start: TController; end: TController }

// `entities.popularity` exists but nothing has ever written it. TMDB gives it
// to us for free on the objects we already fetched, so record it here — it is
// the signal a future puzzle-difficulty pass will want.
type TDailyPopularity = { start: number | null; end: number | null }

type TCreateDailyGameResult =
  | ({ status: 'created'; id: number; displayDate: string } & TDailyPair)
  | { status: 'exists'; id: number; displayDate: string }

type TCreateDailyGameOptions = {
  displayDate: string
  attempts?: number
  timeoutMs?: number
}

// TMDB omits poster_path/profile_path entirely for entries with no image, even
// though the shared types declare them as plain `string`. `entities.img_path`
// and `TController.img_path` are both nullable, so normalize here rather than
// writing `undefined` into the row.
const imagePath = (path: string | null | undefined) => path ?? null

const toMovieController = (movie: T_TMDB_MOVIE_DETAILS): TController => ({
  type: 'MOVIE',
  id: movie.id,
  label: movie.title,
  img_path: imagePath(movie.poster_path),
})

const toPersonController = (person: T_TMDB_PERSON_DETAILS): TController => ({
  type: 'PERSON',
  id: person.id,
  label: person.name,
  img_path: imagePath(person.profile_path),
})

// Postgres unique_violation. Drizzle rethrows the driver error, sometimes
// wrapped, so walk the cause chain rather than checking only the top level.
const isUniqueViolation = (error: unknown): boolean => {
  let current: unknown = error
  while (current && typeof current === 'object') {
    if ((current as { code?: string }).code === '23505') return true
    current = (current as { cause?: unknown }).cause
  }
  return false
}

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number) => {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`Timed out after ${timeoutMs}ms`)),
          timeoutMs,
        )
      }),
    ])
  } finally {
    clearTimeout(timer)
  }
}

const generatePair = async (
  attempts: number,
  timeoutMs: number,
): Promise<TDailyPair & { popularity: TDailyPopularity }> => {
  let lastError: unknown

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const daily = await withTimeout(createRandomDaily(), timeoutMs)

      if (!daily) {
        throw new Error('createRandomDaily returned no puzzle')
      }

      return {
        start: toMovieController(daily.start),
        end: toPersonController(daily.end),
        popularity: {
          start: daily.start.popularity,
          end: daily.end.popularity,
        },
      }
    } catch (error) {
      lastError = error
      console.warn(
        `[create-daily-game] generation attempt ${attempt}/${attempts} failed:`,
        error,
      )
    }
  }

  throw new Error(
    `Failed to generate a puzzle after ${attempts} attempts: ${String(lastError)}`,
  )
}

const persistPair = async (
  displayDate: string,
  pair: TDailyPair,
  popularity: TDailyPopularity,
) =>
  db.transaction(async (tx) => {
    const upsertEntity = (
      controller: TController,
      entityPopularity: number | null,
    ) =>
      tx
        .insert(entities)
        .values({
          entityType: controller.type,
          entityId: controller.id,
          label: controller.label,
          imgPath: controller.img_path,
          popularity: entityPopularity,
        })
        .onConflictDoUpdate({
          target: [entities.entityType, entities.entityId],
          set: {
            label: controller.label,
            imgPath: controller.img_path,
            popularity: entityPopularity,
            updatedAt: new Date(),
          },
        })

    await upsertEntity(pair.start, popularity.start)
    await upsertEntity(pair.end, popularity.end)

    const [inserted] = await tx
      .insert(dailyGames)
      .values({
        displayDate,
        start: pair.start,
        end: pair.end,
        startId: pair.start.id,
        endId: pair.end.id,
      })
      .returning({ id: dailyGames.id })

    return inserted.id
  })

/**
 * Generate and persist the daily game for `displayDate` ('YYYY-MM-DD').
 *
 * Idempotent: re-running for a date that already has a game is a no-op that
 * reports `exists`. Never calls `process.exit` — the caller owns the exit code
 * and closing the pool.
 */
const createDailyGame = async ({
  displayDate,
  attempts = GENERATE_ATTEMPTS,
  timeoutMs = GENERATE_TIMEOUT_MS,
}: TCreateDailyGameOptions): Promise<TCreateDailyGameResult> => {
  if (!isIsoDay(displayDate)) {
    throw new Error(`Expected displayDate as YYYY-MM-DD, got "${displayDate}"`)
  }

  const existing = await db.query.dailyGames.findFirst({
    where: { displayDate },
  })

  if (existing) {
    return { status: 'exists', id: existing.id, displayDate }
  }

  const { popularity, ...pair } = await generatePair(attempts, timeoutMs)

  try {
    const id = await persistPair(displayDate, pair, popularity)
    return { status: 'created', id, displayDate, ...pair }
  } catch (error) {
    // The read-above-then-insert check leaves a race open; the unique index on
    // display_date closes it. A concurrent run winning is success, not failure.
    if (isUniqueViolation(error)) {
      const row = await db.query.dailyGames.findFirst({
        where: { displayDate },
      })
      if (row) return { status: 'exists', id: row.id, displayDate }
    }
    throw error
  }
}

export { createDailyGame, toMovieController, toPersonController }
export type { TCreateDailyGameResult, TDailyPair }
