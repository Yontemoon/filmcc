import 'dotenv/config'
import db from '#/lib/db'
import { createDailyGame } from '../create-daily-game'
import { gameDateString, gameTimeZone, isIsoDay } from '../date'

// Generate tomorrow's puzzle, not today's. Generation polls TMDB and can fail;
// a one-day buffer means a failed run is noticed with 24h of slack instead of
// players landing on an empty game.
const DEFAULT_OFFSET_DAYS = 5

const REQUIRED_ENV = ['DATABASE_URL', 'TMDB_API_KEY'] as const

const readDateArg = () => {
  const flag = '--date='
  const fromArgv = process.argv
    .slice(2)
    .find((arg) => arg.startsWith(flag))
    ?.slice(flag.length)

  return fromArgv || process.env.TARGET_DATE
}

const run = async (): Promise<number> => {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key])
  if (missing.length) {
    console.error(`[daily] missing required env: ${missing.join(', ')}`)
    return 1
  }

  const requested = readDateArg()
  if (requested && !isIsoDay(requested)) {
    console.error(`[daily] --date must be YYYY-MM-DD, got "${requested}"`)
    return 1
  }

  const timeZone = gameTimeZone()
  const displayDate = requested ?? gameDateString(timeZone, DEFAULT_OFFSET_DAYS)

  console.info(`[daily] target=${displayDate} timezone=${timeZone}`)

  try {
    const result = await createDailyGame({ displayDate })

    // One line, greppable — Railway's log search is plain text.
    console.info(
      result.status === 'created'
        ? `[daily] status=created date=${result.displayDate} id=${result.id} start="${result.start.label}" end="${result.end.label}"`
        : `[daily] status=exists date=${result.displayDate} id=${result.id}`,
    )
    return 0
  } catch (error) {
    console.error(`[daily] status=failed date=${displayDate}`, error)
    return 1
  }
}

const main = async () => {
  let code = 1
  try {
    code = await run()
  } finally {
    // The pg pool keeps the event loop alive. Railway skips a cron run while
    // the previous one is still executing, so a job that never exits silently
    // never runs again.
    await db.$client.end().catch((error: unknown) => {
      console.error('[daily] failed to close the database pool', error)
    })
  }
  // process.exit rather than a natural exit: createRandomDaily's unbounded TMDB
  // loops can outlive a timeout and hold the loop open.
  process.exit(code)
}

void main()
