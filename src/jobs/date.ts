const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/

const DEFAULT_GAME_TIMEZONE = 'America/New_York'

// The cron fires in UTC, but `display_date` is the calendar day players
// experience in the game's timezone. Deriving it with Date arithmetic drifts
// across DST, so format the instant directly in the target zone instead:
// 'en-CA' is the locale that renders as YYYY-MM-DD, which is exactly the
// literal the postgres `date` column reads back as.
const dayFormatter = (timeZone: string) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

const gameTimeZone = () => process.env.GAME_TIMEZONE || DEFAULT_GAME_TIMEZONE

const isIsoDay = (value: string) => ISO_DAY.test(value)

// Day arithmetic on a bare calendar date, done in UTC so no timezone or DST
// offset can shift the result. Only safe because the input has already been
// reduced to a YYYY-MM-DD string by `gameDateString`.
const addDays = (isoDay: string, days: number) => {
  const date = new Date(`${isoDay}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

const gameDateString = (
  timeZone: string = gameTimeZone(),
  offsetDays = 0,
  now: Date = new Date(),
) => {
  const today = dayFormatter(timeZone).format(now)
  return offsetDays === 0 ? today : addDays(today, offsetDays)
}

export { gameDateString, gameTimeZone, isIsoDay, addDays, DEFAULT_GAME_TIMEZONE }
