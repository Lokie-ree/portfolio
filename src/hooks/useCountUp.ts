import { useEffect, useRef, useState, type RefObject } from 'react'
import gsap from 'gsap'

/**
 * Animate a number from 0 to `target` when the returned ref's element
 * enters the viewport. Fires exactly once. Uses GSAP for easing.
 *
 * Generic over element type T — pass the concrete element type at the call site
 * (e.g. `useCountUp<HTMLSpanElement>(target)`) to avoid casts.
 */
export function useCountUp<T extends HTMLElement = HTMLElement>(
  target: number,
  duration = 1.2
): { value: number; ref: RefObject<T | null> } {
  const [value, setValue] = useState(0)
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!ref.current) return
    const obj = { val: 0 }
    let tween: gsap.core.Tween | null = null
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        tween = gsap.to(obj, {
          val: target,
          duration,
          ease: 'power2.out',
          onUpdate: () => setValue(Math.round(obj.val)),
        })
      },
      { threshold: 0.5 }
    )
    observer.observe(ref.current)
    return () => {
      observer.disconnect()
      tween?.kill()
    }
  }, [target, duration])

  return { value, ref }
}
