import React from 'react'

const useTimerRef = () => {
  const startedAtRef = React.useRef<number | null>(null)
  const elapsedMsRef = React.useRef(0)
  const [isTimerRunning, setIsTimerRunning] = React.useState(false)

  const getElapsedMs = React.useCallback(() => {
    if (startedAtRef.current === null) return elapsedMsRef.current

    return elapsedMsRef.current + (performance.now() - startedAtRef.current)
  }, [])

  const startTimer = React.useCallback(() => {
    startedAtRef.current = performance.now()
    setIsTimerRunning(true)
  }, [])

  const stopTimer = React.useCallback(() => {
    const finalElapsedMs = getElapsedMs()

    elapsedMsRef.current = finalElapsedMs
    startedAtRef.current = null
    setIsTimerRunning(false)

    return finalElapsedMs
  }, [getElapsedMs])

  return {
    startTimer,
    stopTimer,
    isTimerRunning,
    getElapsedMs,
  }
}

export default useTimerRef
