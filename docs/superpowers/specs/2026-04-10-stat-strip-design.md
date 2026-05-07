# Round 4 — Stat Strip Design Spec
**Date:** 2026-04-10  
**Status:** Completed (implemented)

---

## Overview

Add a living-numbers stat strip between the module card grid and the proof block quote inside `WorkSection`. Four stats count up from 0 when the strip enters the viewport, using GSAP as the animation engine.

---

## Files

| File | Action |
|------|--------|
| `src/hooks/useCountUp.ts` | Create |
| `src/components/StatStrip.tsx` | Create |
| `src/App.tsx` | Update — insert `<StatStrip />` inside `WorkSection` |

---

## `useCountUp` Hook

**Location:** `src/hooks/useCountUp.ts`

**Imports:**
```ts
import { useEffect, useRef, useState, type RefObject } from 'react'
import gsap from 'gsap'
```

**Signature:**
```ts
function useCountUp(target: number, duration?: number): {
  value: number
  ref: RefObject<HTMLElement | null>
}
```

**Behavior:**
- Default `duration` is `1.2` seconds.
- Creates an `IntersectionObserver` with `threshold: 0.5` attached to the returned `ref`.
- On intersection, runs a GSAP tween using the plain-object pattern to drive local React state:
  ```ts
  const obj = { val: 0 }
  gsap.to(obj, {
    val: target,
    duration,
    ease: 'power2.out',
    onUpdate: () => setValue(Math.round(obj.val)),
  })
  ```
- Guards against null ref before observing:
  ```ts
  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      // run tween above
    }, { threshold: 0.5 })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])
  ```
- Disconnects the observer after the first trigger — animation fires exactly once.
- `IntersectionObserver` fires immediately on attachment if the element is already in the viewport (browser native behavior), so mid-page refreshes are covered without special handling.
- Returns `{ value, ref }` — caller attaches `ref` to the watched DOM element.

**Timing note:** The outer `StatStrip` wrapper carries `reveal-target`, so `useScrollReveal` will GSAP-fade the strip in from `opacity: 0`. The `useCountUp` `IntersectionObserver` triggers at `threshold: 0.5` — which fires around the same moment the fade begins. The count-up may complete before the strip is fully opaque on first scroll. This is an acceptable visual tradeoff: the numbers are still animating as the strip finishes fading in, and the slight desync reads as "live data loading in" rather than a glitch. Do not couple the count-up delay to the scroll reveal stagger.

---

## `StatStrip` Component

**Location:** `src/components/StatStrip.tsx`

**Stat type and data:**
```ts
type Stat = { value: number; label: string; prefix?: string }

const STATS: Stat[] = [
  { value: 2,   label: 'Modules complete' },
  { value: 14,  label: 'Rounds in M2 alone' },
  { value: 4,   label: 'Phases per module' },
  { value: 150, label: 'Student sessions logged', prefix: '~' },
]
```

**Layout:**
- Outer wrapper: `reveal-target` class so existing `useScrollReveal` picks it up — no new scroll wiring needed.
- Grid: `grid grid-cols-2 min-[521px]:grid-cols-4 gap-px bg-rule border border-rule`
- Each cell: `bg-surface p-6 flex flex-col items-center gap-2`

**Typography:**
- Number: `font-display text-[clamp(36px,6vw,52px)] font-light italic text-amber`
- Label: `text-[12px] font-medium uppercase tracking-[0.12em] text-muted`

**Each cell** calls `useCountUp` independently. The `ref` returned by `useCountUp` is attached to the cell's number `<span>` (the observed element).

---

## Placement in `App.tsx`

Inside `WorkSection`, between the module card grid `<div>` and the proof block `<div>`:

```tsx
{/* module card grid — className includes "reveal-target mb-10 grid ..." */}
<div className="reveal-target mb-10 grid ...">...</div>

<StatStrip />   {/* ← insert here */}

{/* proof block quote — className includes "reveal-target border-l-2 border-amber ..." */}
<div className="reveal-target border-l-2 border-amber ...">
```

---

## Constraints

- All styling via Tailwind utility classes — no inline style objects.
- GSAP is the only animation engine — no `requestAnimationFrame` loops, no CSS `@keyframes` counters.
- No new scroll trigger wiring — `reveal-target` class handles the section entrance; `useCountUp` handles the number animation separately via its own `IntersectionObserver`.
