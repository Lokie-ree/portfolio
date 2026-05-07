# Round 5 — Scroll Choreography Design Spec
**Date:** 2026-04-10
**Status:** Completed (implemented)

---

## Overview

Implement cinematic scroll choreography across all sections. Every entrance is a directed moment. Six hooks added to `useScrollReveal.ts`, plus targeted App.tsx restructuring for GSAP-animatable markup.

---

## Files

| File | Action |
|------|--------|
| `src/hooks/useScrollReveal.ts` | Modify — FOUC fix + 5 new hook exports |
| `src/App.tsx` | Modify — class names, proof block restructure, ISTE char split, contact underline span, hook wiring |

`src/index.css` is unchanged — `.reveal-target` CSS rule stays as no-JS fallback.

---

## Imports

`useScrollReveal.ts` currently imports `{ useEffect, useRef }` from React. The updated import must be:

```ts
import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react'
```

`gsap.registerPlugin(ScrollTrigger)` is already called at module scope (line 5 of the existing file). Do not add it inside any hook — it is already registered for the entire module.

---

## 1. FOUC Fix: `useScrollReveal` (updated)

**Problem:** `useEffect` fires after paint. The CSS `.reveal-target { opacity: 0 }` handles the initial hidden state, but GSAP's `fromTo` re-specifies it redundantly. Canonically, GSAP should own the initial state.

**Fix:** Call `gsap.set(targets, { opacity: 0, y: 40 })` at the top of `useEffect`, before registering `ScrollTrigger`. Convert `fromTo` → `to` (from-state is now owned by `gsap.set`). The `gsap.set` call is inside `gsap.context` so it is cleaned up on unmount.

Since scroll sections are below the fold when the hook runs, `useEffect` (not `useLayoutEffect`) is sufficient — the flash window is never visible.

```ts
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
```

---

## 2. `useHeroEntrance`

Hero elements are immediately visible on page load. Initial states must be set in `useLayoutEffect` (synchronous, before first paint) to prevent flash.

**Targets** — global class/element selectors (safe: there is exactly one `h1` and one of each class in this single-page app):
- `.hero-label` — "Interactive Learning Designer" `<p>`
- `h1` — native element, no class needed
- `.hero-sub` — paragraph beneath h1
- `.hero-proof` — amber pill `<div>`

**Behavior:**
- `useLayoutEffect`: `gsap.set` all four targets to `{ opacity: 0, y: 30 }`
- `useEffect`: GSAP timeline with 0.5s delay (gives HeroCanvas polygon entrance time to start)
- Stagger 0.18s between each element, duration 0.65s, ease `power3.out`
- Timeline killed on cleanup

```ts
export function useHeroEntrance() {
  useLayoutEffect(() => {
    // No scope passed to gsap.context — creates a tracking context without DOM scope.
    // Wrapping is required so Strict Mode's double-invoke (mount→unmount→mount) reverts
    // the hidden state before re-applying it, preventing elements from staying invisible.
    const ctx = gsap.context(() => {
      gsap.set(['.hero-label', 'h1', '.hero-sub', '.hero-proof'], { opacity: 0, y: 30 })
    })
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.5 })
    tl.to(['.hero-label', 'h1', '.hero-sub', '.hero-proof'], {
      opacity: 1,
      y: 0,
      duration: 0.65,
      ease: 'power3.out',
      stagger: 0.18,
    })
    return () => { tl.kill() }
  }, [])
}
```

**Called in:** `App()` (top-level component, no ref needed).

**App.tsx changes:**
- Add `hero-label` to the class of the "Interactive Learning Designer" `<p>`
- Add `hero-sub` to the class of the hero paragraph
- Add `hero-proof` to the class of the amber pill `<div>`

---

## 3. `useProofBlockReveal`

Two-step animation: left border grows down, then text fades in.

All `gsap.set` and `gsap.to`/`gsap.timeline` calls live **inside** `gsap.context` so they are fully reverted on unmount.

**Markup restructure required (App.tsx):**
- Remove `reveal-target` from the proof block div (this hook takes over its entrance — `useScrollReveal` on the `WorkSection` ref must not also animate it)
- Remove `border-l-2 border-amber` from the outer div (replaced by the `.proof-border` element)
- Add `relative` to the outer div
- Add `proof-border` absolutely-positioned div as the animated left border
- Wrap `<p>` and `<cite>` in a `proof-content` div

```tsx
<div ref={proofRef} className="relative bg-amber-dim px-5 py-[18px]">
  <div className="proof-border absolute left-0 top-0 h-full w-0.5 bg-amber" />
  <div className="proof-content">
    <p className="font-display text-sm font-light italic leading-relaxed text-ink">...</p>
    <cite className="mt-2 block text-xs font-normal uppercase tracking-wide text-muted not-italic">...</cite>
  </div>
</div>
```

**Hook:**

```ts
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
```

**Called in:** `WorkSection`. `WorkSection` retains its existing `useScrollReveal<HTMLElement>()` ref on the `<section>` element (which handles `SectionLabel` and the module card grid's `reveal-target`). `useProofBlockReveal<HTMLDivElement>()` is a second, separate ref applied only to the proof block `<div>`. Two different refs on two different elements — no collision.

```ts
function WorkSection() {
  const ref = useScrollReveal<HTMLElement>()       // section ref — handles label + module grid
  const proofRef = useProofBlockReveal<HTMLDivElement>()  // proof block ref
  ...
}
```

---

## 4. `useAboutReveal`

Meta column slides from the left, body column from the right — simultaneously.

**Markup change:** The about grid div loses its `reveal-target` class (this hook takes over its entrance). Both direct column divs gain `about-col` class.

```tsx
<div className="grid grid-cols-1 items-start gap-6 min-[521px]:grid-cols-[1fr_2fr] min-[521px]:gap-12">
  <div className="about-col text-[13px] leading-[1.8] text-muted">...</div>
  <div className="about-col text-base leading-[1.8] text-ink">...</div>
</div>
```

`AboutSection` retains `useScrollReveal<HTMLElement>()` on the `<section>` ref (which handles the `SectionLabel`'s `reveal-target`). `useAboutReveal<HTMLDivElement>()` gets a separate ref on the grid `<div>`. Two different refs on two different elements — no collision.

```ts
function AboutSection() {
  const ref = useScrollReveal<HTMLElement>()         // section ref — handles "Origin" label
  const aboutRef = useAboutReveal<HTMLDivElement>()  // grid ref — handles column slide-in
  ...
}
```

**Hook:**

```ts
export function useAboutReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!ref.current) return
    const cols = ref.current.querySelectorAll<HTMLElement>('.about-col')
    if (cols.length < 2) return
    const [meta, body] = Array.from(cols)

    const ctx = gsap.context(() => {
      gsap.set(meta, { opacity: 0, x: -20 })
      gsap.set(body, { opacity: 0, x: 20 })
      gsap.to([meta, body], {
        opacity: 1,
        x: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0,
        scrollTrigger: { trigger: ref.current, start: 'top 80%', once: true },
      })
    }, ref)

    return () => ctx.revert()
  }, [])

  return ref
}
```

---

## 5. `useISTEEntrance`

Char-split animation for "ISTE Live 26" with "26" landing 80ms late, followed by the CTA button scaling in.

All `gsap.set` calls are inside `gsap.context` so they are reverted on unmount.

**Markup changes (App.tsx):**
- Split "ISTE Live 26" into individual `<span>` elements (spaces as `\u00A0`, spans `inline-block` — required for GSAP `y` tweening)
- Add `id="iste-date"` to the date `<p>`
- Add `iste-cta` class to the CTA `<a>` button

```tsx
<p id="iste-date" className="mb-1 font-display text-[40px] font-light leading-tight text-ink">
  {"ISTE Live 26".split('').map((char, i) => (
    <span key={i} className="inline-block">
      {char === ' ' ? '\u00A0' : char}
    </span>
  ))}
</p>
```

`"ISTE Live 26".split('')` produces 12 characters. `chars.slice(0, -2)` = first 10 ("ISTE Live "), `chars.slice(-2)` = ["2", "6"]. These slice offsets are coupled to the literal string length — do not change the display text without updating the hook accordingly.

**Hook:**

```ts
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
        .to(twentySix,  { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', stagger: 0.04 }, `+=0.08`)
        .to(btn,        { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.4)' }, '-=0.1')
    }, ref)

    return () => ctx.revert()
  }, [])

  return ref
}
```

**Called in:** `ISTESection` — replaces `useScrollReveal`. `ISTESection` no longer calls `useScrollReveal` (there is no `SectionLabel` in the ISTE section).

---

## 6. `useContactUnderline`

The contact email `<a>` tag's `border-b border-amber pb-0.5` is removed. An explicit `<span>` sibling serves as the underline so GSAP can animate `scaleX: 0 → 1`.

**Design:** `useContactUnderline` accepts an existing `RefObject` rather than creating and returning a new one. This avoids the need to merge two refs on the same `<section>` element — `ContactSection` passes its `useScrollReveal` ref directly.

```ts
export function useContactUnderline<T extends HTMLElement>(ref: RefObject<T | null>) {
  useEffect(() => {
    if (!ref.current) return
    const underline = ref.current.querySelector<HTMLElement>('.contact-underline')
    if (!underline) return

    const ctx = gsap.context(() => {
      gsap.set(underline, { scaleX: 0, transformOrigin: 'left center' })
      gsap.to(underline, {
        scaleX: 1,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: ref.current, start: 'top 75%', once: true },
      })
    }, ref)

    return () => ctx.revert()
  }, [ref])
}
```

**Called in:** `ContactSection`. One ref, shared between both hooks:

```ts
function ContactSection() {
  const ref = useScrollReveal<HTMLElement>()  // handles "Contact" label
  useContactUnderline(ref)                    // handles underline draw
  return <section ref={ref} ...>
}
```

**Markup change (App.tsx):**

```tsx
<div className="reveal-target inline-block relative">
  <a
    href="mailto:rplapointjr@gmail.com"
    className="font-display text-[clamp(24px,4vw,36px)] font-light text-ink no-underline transition-colors hover:text-amber"
  >
    rplapointjr@gmail.com
  </a>
  <span className="contact-underline absolute bottom-0 left-0 h-px w-full bg-amber" />
</div>
```

---

## App.tsx Summary of Changes

| Location | Change |
|----------|--------|
| Hero `<p>` "Interactive Learning Designer" | Add class `hero-label` |
| Hero `<p>` body paragraph | Add class `hero-sub` |
| Hero amber pill `<div>` | Add class `hero-proof` |
| `App()` component | Call `useHeroEntrance()` |
| `WorkSection` | Retain `useScrollReveal<HTMLElement>()` on `<section>` ref; add `useProofBlockReveal<HTMLDivElement>()` as `proofRef` on the proof block `<div>` |
| Proof block `<div>` | Remove `reveal-target`, remove `border-l-2 border-amber`; add `relative`; add `proof-border` span + `proof-content` wrapper div; apply `proofRef` |
| `AboutSection` | Retain `useScrollReveal<HTMLElement>()` on `<section>` ref; add `useAboutReveal<HTMLDivElement>()` as `aboutRef` on the grid `<div>` |
| About grid `<div>` | Remove `reveal-target`; apply `aboutRef`; add `about-col` to both column divs |
| `ISTESection` | Replace `useScrollReveal` → `useISTEEntrance<HTMLElement>()`; char-split date `<p>`, add `id="iste-date"`; add `iste-cta` to button |
| `ContactSection` | Retain `useScrollReveal<HTMLElement>()`; add `useContactUnderline(ref)`; restructure email link with underline `<span>` (remove `border-b border-amber pb-0.5`) |

---

## Constraints

- GSAP is the only animation engine — no CSS `@keyframes`, no CSS transitions for entrance animations
- `inline-block` required on ISTE char spans — GSAP cannot animate `y` on inline elements
- `.reveal-target` CSS rule (`opacity: 0; translateY(40px)`) stays in `index.css` as a no-JS fallback
- All `gsap.set` calls must be inside `gsap.context` so they are reverted on unmount. `useHeroEntrance` uses a scope-less `gsap.context()` (no DOM scope argument) — this is intentional; scope-less context still tracks and reverts tweens
- `gsap.registerPlugin(ScrollTrigger)` is called once at module scope — do not duplicate it inside any hook
- `PelicanSection` continues to use `useScrollReveal` unchanged
