// Format time into MM:SS:CC (Minutes : Seconds : Centiseconds)
const formatTime = (ms: number) => {
  // 1. Extract total components
  const totalSeconds = Math.floor(ms / 1000)

  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  // 2. Extract remaining centiseconds (1 centisecond = 10 milliseconds)
  const centiseconds = Math.floor((ms % 1000) / 10)

  // 3. Pad with leading zeros to ensure mm:ss:cs format
  const mm = String(minutes).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')
  const cs = String(centiseconds).padStart(2, '0')

  return `${mm}:${ss}:${cs}`
}

const displayYear = (date: string) => {
  return new Date(date).getFullYear()
}

const getRandomNumber = (maxNumber: number) => {
  return Math.floor(Math.random() * maxNumber)
}

// `display_date` is a postgres `date` column, so it arrives as 'YYYY-MM-DD'.
// Parsing it directly would land on UTC midnight and shift the day backwards
// for anyone west of GMT, so anchor it to local midnight instead.
const parseDisplayDate = (displayDate: string) => {
  const isoDay = /^\d{4}-\d{2}-\d{2}$/.exec(displayDate.slice(0, 10))
  return isoDay ? new Date(`${isoDay[0]}T00:00:00`) : new Date(displayDate)
}

const displayDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
})

const formatDisplayDate = (displayDate: string) => {
  const date = parseDisplayDate(displayDate)
  return Number.isNaN(date.getTime())
    ? displayDate
    : displayDateFormatter.format(date)
}

export {
  formatTime,
  getRandomNumber,
  displayYear,
  parseDisplayDate,
  formatDisplayDate,
}
