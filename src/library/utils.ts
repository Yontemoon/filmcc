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

export { formatTime }
