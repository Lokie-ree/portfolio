# Stat Strip Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a living-numbers stat strip to WorkSection that counts up from 0 when it enters the viewport.

**Architecture:** A reusable `useCountUp` hook drives each cell's number via GSAP plain-object tween + IntersectionObserver. `StatStrip` renders a 4-cell grid, each cell independently animated. The strip drops into `WorkSection` in `App.tsx` between the module grid and the proof block — no new scroll wiring needed because `reveal-target` on the wrapper is already picked up by `useScrollReveal`.

**Tech Stack:** React 18, TypeScript 5 (strict), GSAP 3, Tailwind v4, Vite

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/hooks/useCountUp.ts` | Create | IntersectionObserver + GSAP tween → animated number |
| `src/components/StatStrip.tsx` | Create | 4-cell stat grid, calls useCountUp per cell |
| `src/App.tsx` | Modify | Import StatStrip, insert between module grid and proof block |

---

### Task 1: Create `useCountUp` hook

**Files:**
- Create: `src/hooks/useCountUp.ts`

- [ ] **Step 1: Create the file with the hook skeleton**

```ts
import { useEffect, useRef, useState, type RefObject } from 'react'
import gsap from 'gsap'

export function useCountUp(
  target: number,
  duration = 1.2
): { value: number; ref: RefObject<HTMLElement | null> } {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const obj = { val: 0 }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        gsap.to(obj, {
          val: target,
          duration,
          ease: 'power2.out',
          onUpdate: () => setValue(Math.round(obj.val)),
        })
      },
      { threshold: 0.5 }
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return { value, ref }
}
```

- [ ] **Step 2: Verify TypeScript compiles cleanly**

Run: `npm run build`
Expected: No TypeScript errors referencing `useCountUp.ts`. (Build may fail on other missing files — that's fine at this stage.)

---

### Task 2: Create `StatStrip` component

**Files:**
- Create: `src/components/StatStrip.tsx`

- [ ] **Step 1: Create the file**

```tsx
import { useCountUp } from '@/hooks/useCountUp'

type Stat = { value: number; label: string; prefix?: string }

const STATS: Stat[] = [
  { value: 2,   label: 'Modules complete' },
  { value: 14,  label: 'Rounds in M2 alone' },
  { value: 4,   label: 'Phases per module' },
  { value: 150, label: 'Student sessions logged', prefix: '~' },
]

function StatCell({ value: target, label, prefix }: Stat) {
  const { value, ref } = useCountUp(target)
  return (
    <div className="bg-surface p-6 flex flex-col items-center gap-2">
      <span
        ref={ref as React.RefObject<HTMLSpanElement>}
        className="font-display text-[clamp(36px,6vw,52px)] font-light italic text-amber"
      >
        {prefix}{value}
      </span>
      <span className="text-[12px] font-medium uppercase tracking-[0.12em] text-muted text-center">
        {label}
      </span>
    </div>
  )
}

export function StatStrip() {
  return (
    <div className="reveal-target my-10 grid grid-cols-2 min-[521px]:grid-cols-4 gap-px bg-rule border border-rule">
      {STATS.map((stat) => (
        <StatCell key={stat.label} {...stat} />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles cleanly**

Run: `npm run build`
Expected: No errors in `StatStrip.tsx` or `useCountUp.ts`. Build will still fail on `App.tsx` if `StatStrip` isn't imported yet — that's expected.

---

### Task 3: Wire `StatStrip` into `App.tsx`

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add import at the top of `App.tsx`**

After the existing component imports, add:
```ts
import { StatStrip } from '@/components/StatStrip'
```

- [ ] **Step 2: Insert `<StatStrip />` in `WorkSection`**

In `WorkSection`, locate these two adjacent elements:
```tsx
<div
  className="reveal-target mb-10 grid grid-cols-1 gap-px border border-rule bg-rule min-[521px]:grid-cols-2"
>
  ...
</div>
<div className="reveal-target border-l-2 border-amber bg-amber-dim px-5 py-[18px]">
```

Insert `<StatStrip />` between them:
```tsx
<div
  className="reveal-target mb-10 grid grid-cols-1 gap-px border border-rule bg-rule min-[521px]:grid-cols-2"
>
  ...
</div>

<StatStrip />

<div className="reveal-target border-l-2 border-amber bg-amber-dim px-5 py-[18px]">
```

- [ ] **Step 3: Full build — must be clean**

Run: `npm run build`
Expected: Exit 0, no TypeScript errors, no Vite errors.

---

### Task 4: Visual verification

**Files:** None — browser check only

- [ ] **Step 1: Start dev server**

Run: `npm run dev`

- [ ] **Step 2: Open `http://localhost:5173` and scroll to the Work section**

Verify:
- Stat strip appears between the module card grid and the proof block quote
- Grid is 2 columns on narrow viewport, 4 columns at ≥521px
- Background is `--color-surface` on each cell with amber number text
- Numbers start at 0 and count up to 2 / 14 / 4 / ~150 when the strip enters the viewport
- `~` prefix appears only on the last stat
- Animation fires once and does not re-trigger on scroll back
- **Note (not a bug):** The count-up may finish slightly before the `reveal-target` fade completes on first scroll. This is intentional — numbers animate in as the strip fades, reading as "live data loading in." Do not add a delay to sync them.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useCountUp.ts src/components/StatStrip.tsx src/App.tsx
git commit -m "feat: add stat strip with useCountUp hook (Round 4)"
```
