import { useRef, useCallback } from 'react'

/**
 * Elapsed time that only advances while `paused` is false.
 * Call `advance(clock.getElapsedTime())` at the start of each useFrame.
 */
export function usePauseSafeElapsed(paused: boolean) {
  const elapsedRef = useRef(0)
  const lastTime = useRef<number | null>(null)

  const advance = useCallback(
    (now: number) => {
      if (!paused) {
        if (lastTime.current !== null) {
          elapsedRef.current += now - lastTime.current
        }
        lastTime.current = now
      } else {
        lastTime.current = now
      }
      return elapsedRef.current
    },
    [paused],
  )

  return { elapsedRef, advance }
}
