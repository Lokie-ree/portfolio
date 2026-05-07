# Round 7 — Responsive Design Pass Implementation Plan

**Status:** Completed (implemented)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Widen the site container from 720px to 1152px, redesign the About section as a three-act narrative, and make HeroCanvas behave correctly on touch and small screens.

**Architecture:** Three independent changes in two files — `src/App.tsx` (container width + hero text cap + About section rewrite) and `src/components/HeroCanvas.tsx` (mobile poly reduction + touch parallax disable). No new files. No new hooks. Changes are additive and non-breaking.

**Tech Stack:** React 19, TypeScript, Tailwind v4, GSAP, React Three Fiber

**Note on testing:** This project has no test framework. Verification is `pnpm run build` (must be clean) followed by a visual check in the browser at `pnpm run dev`.

**Note on git:** This project has no git repository. Skip all commit steps.

---

## File Map

| File | Change |
|------|--------|
| `src/App.tsx` | Container width on `<main>` and `<nav>`, `max-w-[640px]` on hero h1, full `AboutSection` rewrite |
| `src/components/HeroCanvas.tsx` | `isMobile` + `isTouch` flags in `HeroCanvas`, `isTouch` prop on `ParallaxCamera` |

---

### Task 1: Widen the container

**File:** `src/App.tsx`

Two occurrences of `max-w-[720px]` — on `<nav>` (line 223) and `<main>` (line 242). Both change to `max-w-[1152px]`.

- [ ] **Step 1: Update nav max-width**

Find in `src/App.tsx`:
```tsx
className="fixed top-0 left-1/2 z-50 flex w-full max-w-[720px] -translate-x-1/2 items-center justify-between gap-3 border-b border-rule bg-ground/92 px-8 py-4 backdrop-blur-md md:px-6"
```

Replace with:
```tsx
className="fixed top-0 left-1/2 z-50 flex w-full max-w-[1152px] -translate-x-1/2 items-center justify-between gap-3 border-b border-rule bg-ground/92 px-8 py-4 backdrop-blur-md md:px-6"
```

- [ ] **Step 2: Update main max-width**

Find in `src/App.tsx`:
```tsx
<main className="mx-auto max-w-[720px] px-8 md:px-6">
```

Replace with:
```tsx
<main className="mx-auto max-w-[1152px] px-8 md:px-6">
```

- [ ] **Step 3: Verify build**

Run: `pnpm run build`
Expected: clean build, no errors.

---

### Task 2: Cap hero text column width

**File:** `src/App.tsx` — hero h1 only (line ~254)

At 1152px the h1 would stretch uncomfortably wide. Cap the copy column so the canvas handles the remaining width.

- [ ] **Step 1: Add max-width to h1**

Find in `src/App.tsx` (include surrounding lines for precision):
```tsx
            <h1 className="mb-7 max-w-[600px] font-display text-[clamp(32px,9vw,44px)] font-light leading-[1.15] tracking-tight text-ink min-[521px]:text-[clamp(36px,6vw,58px)]">
              I build experiences that help people understand things they{' '}
              <em className="text-amber italic">thought were hard</em>
            </h1>
```

Replace with:
```tsx
            <h1 className="mb-7 max-w-[640px] font-display text-[clamp(32px,9vw,44px)] font-light leading-[1.15] tracking-tight text-ink min-[521px]:text-[clamp(36px,6vw,58px)]">
              I build experiences that help people understand things they{' '}
              <em className="text-amber italic">thought were hard</em>
            </h1>
```

- [ ] **Step 2: Verify build**

Run: `pnpm run build`
Expected: clean build, no errors.

---

### Task 3: Rewrite AboutSection — three-act structure

**File:** `src/App.tsx` — `AboutSection` function (lines ~65–110)

The current two-column meta/prose layout is replaced with three vertically stacked acts. Each act has a 3px accent bar on the left (amber for acts 1–2, rule color for act 3), a Fraunces hook line, and DM Sans body text. The existing `useAboutReveal` hook and the `meta` array are removed — the three-act structure carries that information in the narrative.

- [ ] **Step 1: Remove `useAboutReveal` from the import**

Find in `src/App.tsx` (line 6):
```tsx
import { useScrollReveal, useNavReveal, useHeroEntrance, useProofBlockReveal, useAboutReveal, useISTEEntrance, useContactUnderline } from '@/hooks/useScrollReveal'
```

Replace with:
```tsx
import { useScrollReveal, useNavReveal, useHeroEntrance, useProofBlockReveal, useISTEEntrance, useContactUnderline } from '@/hooks/useScrollReveal'
```

- [ ] **Step 2: Replace the entire `AboutSection` function**

Find the entire `AboutSection` function (lines ~65–110):
```tsx
function AboutSection() {
  const ref = useScrollReveal<HTMLElement>()
  const aboutRef = useAboutReveal<HTMLDivElement>()
  const meta = [
    { label: 'Background', lines: ['Mathematician', 'Louisiana, USA'] },
    { label: 'Experience', lines: ['15 years classroom', '8th grade math'] },
    { label: 'Now', lines: ['Interactive learning', 'designer + developer'] },
  ]
  return (
    <section ref={ref} id="about" className={sectionClass}>
      <SectionLabel>Origin</SectionLabel>
      <div ref={aboutRef} className="grid grid-cols-1 items-start gap-6 min-[521px]:grid-cols-[1fr_2fr] min-[521px]:gap-12">
        <div className="about-col text-[13px] leading-[1.8] text-muted">
          {meta.map(({ label, lines }) => (
            <div key={label} className="mb-5">
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-amber">
                {label}
              </p>
              {lines.map((l) => (
                <p key={l}>{l}</p>
              ))}
            </div>
          ))}
        </div>
        <div className="about-col text-base leading-[1.8] text-ink">
          <p className="mb-[18px]">
            I spent 15 years watching students decide, in the first five minutes of a lesson,
            whether math was something that happened <em>to</em> them or something they could do.
            The difference was almost never the content. It was whether they got to touch the idea
            before they were told what to think about it.
          </p>
          <p className="mb-[18px]">
            Creative Lab is my answer to that. Every module is built on one principle: challenge
            before explanation. Students manipulate first. They discover through exploration.
            The formula is the reward — earned, not given.
          </p>
          <p>
            I build in React Three Fiber and GSAP, test with real 8th graders twice a week,
            and document what I learn. The goal is interactive experiences that make hard ideas
            feel obvious — in retrospect.
          </p>
        </div>
      </div>
    </section>
  )
}
```

Replace with:
```tsx
// Static data defined at module level — only used by AboutSection
const ABOUT_ACTS = [
  {
    hook: "Every student decides in the first five minutes whether math is something that happens to them.",
    body: "15 years in the classroom. The decision happened before I said a word. It happened in the moment they picked up the pencil — or didn't. I started asking what made the difference.",
    amber: true,
  },
  {
    hook: "It was never the content. It was whether they got to touch the idea first.",
    body: "Challenge before explanation. Not as a teaching trick — as a design principle. When students manipulate the idea before they're told what to think about it, the formula becomes a reward. Earned, not given.",
    amber: true,
  },
  {
    hook: "Now I build the tools that scale that insight.",
    body: "React Three Fiber. GSAP. Real 8th graders twice a week. Every module is tested until the behavior confirms the design. The goal: interactive experiences that make hard ideas feel obvious — in retrospect.",
    amber: false,
  },
]

function AboutSection() {
  const ref = useScrollReveal<HTMLElement>()
  return (
    <section ref={ref} id="about" className={sectionClass}>
      <SectionLabel>Origin</SectionLabel>
      <div className="flex flex-col divide-y divide-rule">
        {ABOUT_ACTS.map((act, i) => (
          <div
            key={i}
            className="reveal-target grid grid-cols-[3px_1fr] gap-6 py-8 first:pt-0 last:pb-0"
          >
            <div className={`self-stretch rounded-sm mt-1 ${act.amber ? 'bg-amber' : 'bg-rule'}`} />
            <div>
              <p className="font-display text-[22px] font-light leading-[1.3] text-ink mb-4">
                {act.hook}
              </p>
              <p className="text-[14px] leading-[1.8] text-muted">
                {act.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Verify build**

Run: `pnpm run build`
Expected: clean build, no TypeScript errors. If you see "useAboutReveal is not exported" or similar, double-check the import was updated in Step 1.

- [ ] **Step 4: Visual check**

Run: `pnpm run dev` and open `http://localhost:5173`. Scroll to the About section and verify:
- Three acts stack vertically, each with a left accent bar
- Acts 1 and 2 have an amber bar; act 3 has a muted/rule-colored bar
- Hook text is Fraunces, larger; body text is DM Sans, muted
- Thin horizontal rule between acts
- On mobile (resize to 375px): acts still readable, single column, no overflow

---

### Task 4: HeroCanvas — mobile poly count + touch parallax

**File:** `src/components/HeroCanvas.tsx`

Two changes:
1. `ParallaxCamera` accepts an `isTouch: boolean` prop. When true, it skips registering the `mousemove` listener and skips the `useFrame` camera movement — the camera stays at origin.
2. `HeroCanvas` computes `isMobile` and `isTouch` once on render (not in a hook — these are stable viewport values) and passes them down.

- [ ] **Step 1: Add `isTouch` prop to `ParallaxCamera`**

Find the entire `ParallaxCamera` function:
```tsx
function ParallaxCamera() {
  const { camera } = useThree()
  const mouse = useRef({ x: 0, y: 0 })
  const target = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useFrame(() => {
    target.current.x += (mouse.current.x * 0.4 - target.current.x) * 0.04
    target.current.y += (mouse.current.y * 0.3 - target.current.y) * 0.04
    camera.position.x = target.current.x
    camera.position.y = target.current.y
    camera.lookAt(0, 0, 0)
  })

  return null
}
```

Replace with:
```tsx
function ParallaxCamera({ isTouch }: { isTouch: boolean }) {
  const { camera } = useThree()
  const mouse = useRef({ x: 0, y: 0 })
  const target = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (isTouch) return
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [isTouch])

  useFrame(() => {
    if (isTouch) return
    target.current.x += (mouse.current.x * 0.4 - target.current.x) * 0.04
    target.current.y += (mouse.current.y * 0.3 - target.current.y) * 0.04
    camera.position.x = target.current.x
    camera.position.y = target.current.y
    camera.lookAt(0, 0, 0)
  })

  return null
}
```

- [ ] **Step 2: Update `HeroCanvas` to compute flags and pass them down**

Find the entire `HeroCanvas` function:
```tsx
export function HeroCanvas() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <div className="hero-glow" />
      <Canvas
        className="bg-transparent"
        camera={{ position: [0, 0, 6], fov: 60 }}
        dpr={Math.min(window.devicePixelRatio, 2)}
        gl={{ antialias: true, alpha: true }}
      >
        <ParallaxCamera />
        {POLYS.map((p, i) => <Polygon key={i} {...p} entranceDelay={i * 0.08} />)}
      </Canvas>
    </div>
  )
}
```

Replace with:
```tsx
export function HeroCanvas() {
  const isMobile = window.innerWidth <= 520
  const isTouch = window.matchMedia('(pointer: coarse)').matches
  const activePolys = isMobile ? POLYS.slice(0, 7) : POLYS

  return (
    <div className="absolute inset-0" aria-hidden="true">
      <div className="hero-glow" />
      <Canvas
        className="bg-transparent"
        camera={{ position: [0, 0, 6], fov: 60 }}
        dpr={Math.min(window.devicePixelRatio, 2)}
        gl={{ antialias: true, alpha: true }}
      >
        <ParallaxCamera isTouch={isTouch} />
        {activePolys.map((p, i) => <Polygon key={i} {...p} entranceDelay={i * 0.08} />)}
      </Canvas>
    </div>
  )
}
```

- [ ] **Step 3: Verify build**

Run: `pnpm run build`
Expected: clean build, no TypeScript errors.

- [ ] **Step 4: Visual check**

Run: `pnpm run dev` and open `http://localhost:5173`.

Desktop check (pointer device):
- Hero canvas polygons drift and rotate as before
- Mouse parallax: move the mouse across the hero — camera tilts slightly

Mobile check (Chrome DevTools → toggle device toolbar → iPhone SE 375px):
- Only 7 polygons visible (less density — subtle, may be hard to count)
- No parallax jank on scroll

Touch check (Chrome DevTools → Sensors → Touch → check that mousemove doesn't fire):
- Parallax camera stays static when touch is emulated

---

## Completion Checklist

After all four tasks:

- [ ] `pnpm run build` passes clean
- [ ] Container is noticeably wider at desktop widths
- [ ] Hero h1 doesn't stretch beyond ~640px
- [ ] About section shows three acts with left accent bars and hook/body structure
- [ ] Acts 1–2 have amber bars; act 3 has muted bar
- [ ] On mobile (375px): all sections readable, no overflow, About acts stack cleanly
- [ ] HeroCanvas: mouse parallax works on desktop pointer
- [ ] HeroCanvas: no parallax on touch-emulated device in DevTools
