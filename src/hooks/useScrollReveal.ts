import { useEffect, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Attach GSAP ScrollTrigger reveal to a section ref.
 * Children with class `reveal-target` will stagger in.
 */
export function useScrollReveal<T extends HTMLElement>(stagger = 0.1) {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!ref.current) return

    const targets = ref.current.querySelectorAll('.reveal-target')
    if (targets.length === 0) return

    const ctx = gsap.context(() => {
      gsap.set(targets, { opacity: 0, y: 40 })
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger,
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 80%',
          once: true,
        },
      })
    }, ref)

    return () => ctx.revert()
  }, [stagger])

  return ref
}

/**
 * Animate the nav in after scrolling past the hero.
 * Uses `top` (not `transform: translateY`) so `backdrop-filter` on the bar stays valid in Chromium.
 */
export function useNavReveal(heroHeight: number) {
  useLayoutEffect(() => {
    const nav = document.getElementById('site-nav')
    if (!nav) return
    gsap.set(nav, { top: -72, opacity: 0, clearProps: 'transform' })
  }, [])

  useEffect(() => {
    const nav = document.getElementById('site-nav')
    if (!nav) return

    const trigger = ScrollTrigger.create({
      start: heroHeight,
      onEnter: () =>
        gsap.to(nav, {
          top: 0,
          opacity: 1,
          duration: 0.4,
          ease: 'power2.out',
          overwrite: 'auto',
        }),
      onLeaveBack: () =>
        gsap.to(nav, {
          top: -72,
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in',
          overwrite: 'auto',
        }),
    })

    return () => {
      trigger.kill()
    }
  }, [heroHeight])
}

/**
 * Stagger hero elements in on page load.
 * useLayoutEffect sets initial states before first paint to prevent flash.
 * Scope-less gsap.context() ensures Strict Mode double-invoke reverts correctly.
 */
export function useHeroEntrance() {
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(['.hero-label', 'h1', '.hero-sub', '.hero-proof'], { opacity: 0, y: 30 })
    })
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.timeline({ delay: 0.5 }).to(['.hero-label', 'h1', '.hero-sub', '.hero-proof'], {
        opacity: 1,
        y: 0,
        duration: 0.65,
        ease: 'power3.out',
        stagger: 0.18,
      })
    })
    return () => ctx.revert()
  }, [])
}

/**
 * Animate the proof block: left border grows down (scaleY), then text children fade in.
 * Requires .proof-border and .proof-content elements inside the ref'd element.
 */
export function useProofBlockReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!ref.current) return
    const border = ref.current.querySelector<HTMLElement>('.proof-border')
    const children = ref.current.querySelectorAll<HTMLElement>('.proof-content > *')
    if (!border || !children.length) return

    const ctx = gsap.context(() => {
      gsap.set(border, { scaleY: 0, transformOrigin: 'top' })
      gsap.set(children, { opacity: 0, y: 10 })

      const tl = gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: 'top 80%', once: true },
      })
      tl.to(border, { scaleY: 1, duration: 0.4, ease: 'power2.out' })
        .to(children, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.12 }, '-=0.1')
    }, ref)

    return () => ctx.revert()
  }, [])

  return ref
}

/**
 * Char-split entrance for "ISTE Live 26".
 * mainChars ("ISTE Live ") stagger in at 0.04s each.
 * twentySix ("2","6") start 80ms after mainChars complete.
 * CTA button scales in after "26" lands.
 *
 * NOTE: slice offsets (0,-2) are coupled to the 12-char literal "ISTE Live 26".
 * If the display text changes, update the slice indices accordingly.
 */
export function useISTEEntrance<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!ref.current) return
    const dateEl = ref.current.querySelector<HTMLElement>('#iste-date')
    const btn = ref.current.querySelector<HTMLElement>('.iste-cta')
    if (!dateEl || !btn) return

    const chars = Array.from(dateEl.querySelectorAll<HTMLElement>('span'))
    const mainChars = chars.slice(0, -2)  // "ISTE Live " — 10 spans
    const twentySix = chars.slice(-2)      // "2", "6" — 2 spans

    const ctx = gsap.context(() => {
      gsap.set(chars, { opacity: 0, y: 20 })
      gsap.set(btn, { opacity: 0, scale: 0.8 })

      const tl = gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: 'top 70%', once: true },
      })
      tl.to(mainChars, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', stagger: 0.04 })
        .to(twentySix,  { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', stagger: 0.04 }, '+=0.08')
        .to(btn,        { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.4)' }, '-=0.1')
    }, ref)

    return () => ctx.revert()
  }, [])

  return ref
}

/**
 * Drive a fixed scroll-progress bar (id="scroll-progress") from scaleX 0→1
 * as the page scrolls from top to bottom. Uses scrub so it tracks exactly.
 */
export function useScrollProgress() {
  useEffect(() => {
    const bar = document.getElementById('scroll-progress')
    if (!bar) return

    gsap.set(bar, { scaleX: 0, transformOrigin: 'left center' })

    const tween = gsap.to(bar, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
      },
    })

    return () => { tween.scrollTrigger?.kill() }
  }, [])
}
