# Scroll Choreography Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add cinematic scroll choreography across all sections — hero entrance, FOUC fix, proof block border animation, about column slide-in, ISTE char split, and contact underline draw.

**Architecture:** All six hooks live in `src/hooks/useScrollReveal.ts` alongside the existing `useScrollReveal` and `useNavReveal`. `App.tsx` receives targeted markup changes (class names, structural additions) to expose animatable DOM nodes to each hook. No new files created.

**Tech Stack:** React 18, TypeScript 5 (strict, verbatimModuleSyntax), GSAP 3 + ScrollTrigger, Tailwind v4, Vite

**Spec:** `docs/superpowers/specs/2026-04-10-scroll-choreography-design.md`

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/hooks/useScrollReveal.ts` | Modify | FOUC fix + 5 new hook exports |
| `src/App.tsx` | Modify | Class names, proof block structure, ISTE char split, contact underline span, hook wiring |

---

### Task 1: Update `useScrollReveal.ts` — imports and FOUC fix

**Files:**
- Modify: `src/hooks/useScrollReveal.ts`

- [ ] **Step 1: Update the React import line**

Replace the existing import (line 1):
```ts
import { useEffect, useRef } from 'react'
```
With:
```ts
import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react'
```

- [ ] **Step 2: Update `useScrollReveal` to use `gsap.set` + `to` instead of `fromTo`**

Replace the entire `useScrollReveal` function body:

```ts
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
```

- [ ] **Step 3: Verify TypeScript compiles cleanly**

Run: `npm run build`
Expected: No errors in `useScrollReveal.ts`. Other sections of `App.tsx` unchanged — build should be clean.

---

### Task 2: Add `useHeroEntrance` + wire into `App.tsx`

**Files:**
- Modify: `src/hooks/useScrollReveal.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1: Add `useHeroEntrance` to `useScrollReveal.ts`**

Append after `useNavReveal`:

```ts
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

- [ ] **Step 2: Add `useHeroEntrance` to the import in `App.tsx`**

In `src/App.tsx` line 6, update the hooks import:
```ts
import { useScrollReveal, useNavReveal, useHeroEntrance } from '@/hooks/useScrollReveal'
```

- [ ] **Step 3: Add class names to hero elements in `App.tsx`**

Inside the `App()` component's hero `<div>`, make these three targeted class additions:

**"Interactive Learning Designer" `<p>`** — add `hero-label`:
```tsx
<p className="hero-label mb-7 text-xs font-medium uppercase tracking-[0.12em] text-amber">
  Interactive Learning Designer
</p>
```

**Hero paragraph** — add `hero-sub`:
```tsx
<p className="hero-sub mb-9 max-w-[480px] text-base leading-[1.7] text-muted">
  Mathematician. 15 years in the classroom. Now building the tools that scale
  what I learned about how students actually learn.
</p>
```

**Amber pill `<div>`** — add `hero-proof`:
```tsx
<div className="hero-proof inline-flex max-w-full items-center gap-2.5 border border-rule bg-amber-dim px-4 py-2.5 text-[13px] leading-snug text-ink">
  <span className="size-[7px] shrink-0 rounded-full bg-amber" />
  Every module is tested twice a week with real students. Their behavior shapes every
  iteration.
</div>
```

- [ ] **Step 4: Call `useHeroEntrance()` in the `App()` component**

Add the call directly after the existing `useNavReveal` call:
```ts
export default function App() {
  const heroRef = useRef<HTMLDivElement>(null)
  useNavReveal(typeof window !== 'undefined' ? window.innerHeight * 0.8 : 600)
  useHeroEntrance()
  // ...
}
```

- [ ] **Step 5: Verify build is clean**

Run: `npm run build`
Expected: Exit 0, no TypeScript errors.

---

### Task 3: Add `useProofBlockReveal` + restructure proof block in `App.tsx`

**Files:**
- Modify: `src/hooks/useScrollReveal.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1: Add `useProofBlockReveal` to `useScrollReveal.ts`**

Append after `useHeroEntrance`:

```ts
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
```

- [ ] **Step 2: Update the `useScrollReveal` import in `App.tsx`**

```ts
import { useScrollReveal, useNavReveal, useHeroEntrance, useProofBlockReveal } from '@/hooks/useScrollReveal'
```

- [ ] **Step 3: Wire `useProofBlockReveal` into `WorkSection`**

In `WorkSection`, add the proof ref alongside the existing scroll reveal ref:

```ts
function WorkSection() {
  const ref = useScrollReveal<HTMLElement>()
  const proofRef = useProofBlockReveal<HTMLDivElement>()
  // ...
}
```

- [ ] **Step 4: Restructure the proof block `<div>` in `WorkSection`**

Replace the current proof block:
```tsx
<div className="reveal-target border-l-2 border-amber bg-amber-dim px-5 py-[18px]">
  <p className="font-display text-sm font-light italic leading-relaxed text-ink">
    "The STEM Club doesn't just use these tools — their behavior shapes every iteration.
    Every design decision has a student behind it."
  </p>
  <cite className="mt-2 block text-xs font-normal uppercase tracking-wide text-muted not-italic">
    IVLA STEM Club · tested twice weekly
  </cite>
</div>
```

With this restructured version (note: `reveal-target` removed, `border-l-2 border-amber` removed, `relative` added, `ref={proofRef}` attached):
```tsx
<div ref={proofRef} className="relative bg-amber-dim px-5 py-[18px]">
  <div className="proof-border absolute left-0 top-0 h-full w-0.5 bg-amber" />
  <div className="proof-content">
    <p className="font-display text-sm font-light italic leading-relaxed text-ink">
      "The STEM Club doesn't just use these tools — their behavior shapes every iteration.
      Every design decision has a student behind it."
    </p>
    <cite className="mt-2 block text-xs font-normal uppercase tracking-wide text-muted not-italic">
      IVLA STEM Club · tested twice weekly
    </cite>
  </div>
</div>
```

- [ ] **Step 5: Verify build is clean**

Run: `npm run build`
Expected: Exit 0, no TypeScript errors.

---

### Task 4: Add `useAboutReveal` + wire into `AboutSection`

**Files:**
- Modify: `src/hooks/useScrollReveal.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1: Add `useAboutReveal` to `useScrollReveal.ts`**

Append after `useProofBlockReveal`:

```ts
/**
 * Slide about section columns in from opposite sides simultaneously.
 * Meta column: x -20→0. Body column: x 20→0. Both at once.
 * Requires two .about-col children inside the ref'd element.
 */
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

- [ ] **Step 2: Update the `useScrollReveal` import in `App.tsx`**

```ts
import { useScrollReveal, useNavReveal, useHeroEntrance, useProofBlockReveal, useAboutReveal } from '@/hooks/useScrollReveal'
```

- [ ] **Step 3: Wire `useAboutReveal` into `AboutSection`**

```ts
function AboutSection() {
  const ref = useScrollReveal<HTMLElement>()         // section ref — handles "Origin" label
  const aboutRef = useAboutReveal<HTMLDivElement>()  // grid ref — handles column slide-in
  // ...
}
```

- [ ] **Step 4: Update `AboutSection` JSX — remove `reveal-target` from grid, add `aboutRef` and `about-col`**

Replace the about grid div opening tag and both column div opening tags.

Current grid div:
```tsx
<div className="reveal-target grid grid-cols-1 items-start gap-6 min-[521px]:grid-cols-[1fr_2fr] min-[521px]:gap-12">
```
Replace with:
```tsx
<div ref={aboutRef} className="grid grid-cols-1 items-start gap-6 min-[521px]:grid-cols-[1fr_2fr] min-[521px]:gap-12">
```

Current meta column div:
```tsx
<div className="text-[13px] leading-[1.8] text-muted">
```
Replace with:
```tsx
<div className="about-col text-[13px] leading-[1.8] text-muted">
```

Current body column div:
```tsx
<div className="text-base leading-[1.8] text-ink">
```
Replace with:
```tsx
<div className="about-col text-base leading-[1.8] text-ink">
```

- [ ] **Step 5: Verify build is clean**

Run: `npm run build`
Expected: Exit 0, no TypeScript errors.

---

### Task 5: Add `useISTEEntrance` + restructure `ISTESection`

**Files:**
- Modify: `src/hooks/useScrollReveal.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1: Add `useISTEEntrance` to `useScrollReveal.ts`**

Append after `useAboutReveal`:

```ts
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
```

- [ ] **Step 2: Update the `useScrollReveal` import in `App.tsx`**

```ts
import { useScrollReveal, useNavReveal, useHeroEntrance, useProofBlockReveal, useAboutReveal, useISTEEntrance } from '@/hooks/useScrollReveal'
```

- [ ] **Step 3: Replace `useScrollReveal` with `useISTEEntrance` in `ISTESection`**

```ts
function ISTESection() {
  const ref = useISTEEntrance<HTMLElement>()
  // ...
}
```

- [ ] **Step 4: Char-split the date and add `iste-cta` to the button in `ISTESection`**

Replace the current date `<p>`:
```tsx
<p className="mb-1 font-display text-[40px] font-light leading-tight text-ink">
  ISTE Live 26
</p>
```
With:
```tsx
<p id="iste-date" className="mb-1 font-display text-[40px] font-light leading-tight text-ink">
  {"ISTE Live 26".split('').map((char, i) => (
    <span key={i} className="inline-block">
      {char === ' ' ? '\u00A0' : char}
    </span>
  ))}
</p>
```

Add `iste-cta` to the CTA `<a>` element. Current:
```tsx
<a
  href="mailto:rplapointjr@gmail.com"
  className="inline-block bg-ink px-[22px] py-3 text-[13px] font-medium tracking-wide text-ground no-underline transition-colors hover:bg-amber"
>
  Let's meet →
</a>
```
Replace with:
```tsx
<a
  href="mailto:rplapointjr@gmail.com"
  className="iste-cta inline-block bg-ink px-[22px] py-3 text-[13px] font-medium tracking-wide text-ground no-underline transition-colors hover:bg-amber"
>
  Let's meet →
</a>
```

- [ ] **Step 5: Remove `reveal-target` from the ISTE section grid `<div>` in `ISTESection`**

`ISTESection` no longer calls `useScrollReveal`, so nothing will animate `.reveal-target` elements inside it. The grid div must not carry that class or it will stay hidden (CSS sets `opacity: 0` on `.reveal-target` permanently).

Replace:
```tsx
<div className="reveal-target grid grid-cols-1 items-center gap-6 min-[521px]:grid-cols-[2fr_1fr] min-[521px]:gap-12">
```
With:
```tsx
<div className="grid grid-cols-1 items-center gap-6 min-[521px]:grid-cols-[2fr_1fr] min-[521px]:gap-12">
```

Also add an explicit note: the `<section ref={ref} className={sectionClass}>` opening tag is unchanged — `ref={ref}` stays attached to the `<section>` element.

- [ ] **Step 6: Verify build is clean**

Run: `npm run build`
Expected: Exit 0, no TypeScript errors.

---

### Task 6: Add `useContactUnderline` + restructure `ContactSection`

**Files:**
- Modify: `src/hooks/useScrollReveal.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1: Add `useContactUnderline` to `useScrollReveal.ts`**

Append after `useISTEEntrance`:

```ts
/**
 * Draw the contact email underline left-to-right via GSAP scaleX tween.
 * Accepts an existing RefObject rather than creating a new one — avoids
 * dual-ref attachment on the same <section> element.
 * The ref dep in useEffect is stable (useRef identity never changes).
 */
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

- [ ] **Step 2: Update the `useScrollReveal` import in `App.tsx`**

```ts
import { useScrollReveal, useNavReveal, useHeroEntrance, useProofBlockReveal, useAboutReveal, useISTEEntrance, useContactUnderline } from '@/hooks/useScrollReveal'
```

- [ ] **Step 3: Wire `useContactUnderline` into `ContactSection`**

```ts
function ContactSection() {
  const ref = useScrollReveal<HTMLElement>()  // handles "Contact" label
  useContactUnderline(ref)                    // handles underline draw (shares same ref)
  // ...
}
```

- [ ] **Step 4: Restructure the email link in `ContactSection`**

Replace the current email `<a>`:
```tsx
<a
  href="mailto:rplapointjr@gmail.com"
  className="reveal-target font-display text-[clamp(24px,4vw,36px)] font-light text-ink no-underline border-b border-amber pb-0.5 transition-colors hover:text-amber"
>
  rplapointjr@gmail.com
</a>
```
With a wrapper div containing the link and an explicit underline span:
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

- [ ] **Step 5: Full build — must be clean**

Run: `npm run build`
Expected: Exit 0, no TypeScript errors, no Vite errors.

---

### Task 7: Visual verification

**Files:** None — browser check only

- [ ] **Step 1: Start dev server**

Run: `npm run dev`

- [ ] **Step 2: Open `http://localhost:5173` and verify hero entrance**

- Page loads: hero elements are invisible (opacity 0)
- After ~0.5s: "Interactive Learning Designer" label fades up
- Then h1, then paragraph, then amber pill — each 0.18s apart
- No flash of visible content before animation starts

- [ ] **Step 3: Scroll down and verify each section entrance**

- **Work section:** Module grid fades/slides in as before. Proof block: left border grows down from top, then quote and cite fade in.
- **About section:** "Origin" label fades in (standard). Meta column slides in from left, body column from right — simultaneously.
- **Pelican section:** Standard stagger (unchanged).
- **ISTE section:** The subtitle, body paragraph, and CTA button are all visible (grid has no hidden `reveal-target` class). "ISTE Live 26" chars stagger in one by one; "2" and "6" land ~80ms after the rest; CTA button scales in after.
- **Contact section:** "Contact" label fades in. Email link fades in. Underline draws left-to-right.

- [ ] **Step 4: Scroll back up and re-scroll — animations should NOT re-trigger**

All `once: true` — each animation fires exactly once per page load.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useScrollReveal.ts src/App.tsx
git commit -m "feat: add scroll choreography (Round 5)"
```
