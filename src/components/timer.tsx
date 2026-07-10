import { formatTime } from '#/library/utils'
import React from 'react'

// Props drilled come from the useGame hook.
const Timer = ({
  isRunning,
  getElapsedMs,
  finalElapsedMs,
}: {
  isRunning: boolean
  getElapsedMs: () => number
  finalElapsedMs: number | null
}) => {
  const [displayMs, setDisplayMs] = React.useState(() => getElapsedMs())

  React.useEffect(() => {
    if (!isRunning) {
      setDisplayMs(finalElapsedMs ?? getElapsedMs())
      return
    }

    const interval = setInterval(() => {
      setDisplayMs(getElapsedMs())
    }, 100)

    return () => clearInterval(interval)
  }, [isRunning, getElapsedMs, finalElapsedMs])

  return <div>Time: {formatTime(displayMs)}</div>
}

export default Timer
