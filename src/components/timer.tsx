import { formatTime } from '#/library/utils'
import React from 'react'

// Props drilled come from the useGame hook.
const Timer = ({
  isRunning,
  getElapsedMs,
  finalElapsedMs,
  label = 'Time: ',
  className,
}: {
  isRunning: boolean
  getElapsedMs: () => number
  finalElapsedMs: number | null
  label?: string
  className?: string
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

  return (
    <span className={className}>
      {label}
      {formatTime(displayMs)}
    </span>
  )
}

export default Timer
