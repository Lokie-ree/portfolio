# Step 1: Work Section 3-Card Grid Implementation Plan

**Status:** Completed (implemented)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the Work section from a 2-card grid to a 3-card grid (adding Pythagorean Theorem), refactor `ModuleCard` to support optional hrefs and lab guide links, suppress disabled-card hover effects, and update the StatStrip anchor stat.

**Architecture:** All changes are self-contained to four files. `ModuleCard` becomes a `<div>`-rooted component with inner `<a>` links — this eliminates the nested-anchor HTML violation that would emerge when lab guide links are added. The `PythagoreanTheoremPreview` component already exists; it just needs to be lazy-loaded and wired in.

**Tech Stack:** React 19, TypeScript, Tailwind v4, GSAP (existing — no new deps)

**No unit tests exist in this project.** Verification is `pnpm run lint && pnpm run build`, then visual confirmation in the dev server.

---

## File Map

| File | Change |
|------|--------|
| `src/components/ModuleCard.tsx` | Full rewrite — new interface, `<div>` root, inner links, disabled state |
| `src/index.css` | Add `.module-card[data-disabled="true"]:hover::after { opacity: 0 }` |
| `src/App.tsx` | Lazy-load `PythagoreanTheoremPreview`, add 3rd card, update grid to 3-col |
| `src/components/StatStrip.tsx` | Update first stat: `2 / "Modules complete"` → `3 / "Modules in the sequence"` |

---

## Task 1: Rewrite ModuleCard

**Files:**
- Modify: `src/components/ModuleCard.tsx` (full rewrite)

### What changes and why

The current component renders as a top-level `<a>`. The spec adds a `labGuideHref` sibling link — nesting `<a>` inside `<a>` is invalid HTML. The fix is: outer element is always a `<div>`, inner `<a>` elements appear only when their href is present.

New interface:
```ts
interface ModuleCardProps {
  status: string
  title: string
  standard: string
  description: string
  href?: string           // optional — omit for disabled/in-dev cards
  labGuideHref?: string   // optional — shows "Lab guide →" when present
  preview?: ReactElement<{ paused: boolean }>  // optional — fallback if absent
  disabled?: boolean      // true suppresses all hover effects
}
```

Disabled behavior — two levels:
1. **JSX:** omit `hover:border-amber hover:bg-surface-hi` from className when `disabled`
2. **CSS:** `data-disabled="true"` attribute + CSS rule (Task 2)

Arrow link text changes from "Open module →" to "view module →" (per spec).

- [ ] **Step 1: Replace the full content of `src/components/ModuleCard.tsx`**

```tsx
import { useState, cloneElement, type ReactElement } from 'react'

interface ModuleCardProps {
  status: string
  title: string
  standard: string
  description: string
  href?: string
  labGuideHref?: string
  preview?: ReactElement<{ paused: boolean }>
  disabled?: boolean
}

export function ModuleCard({
  status,
  title,
  standard,
  description,
  href,
  labGuideHref,
  preview,
  disabled = false,
}: ModuleCardProps) {
  const [hovered, setHovered] = useState(false)

  const previewEl = preview
    ? cloneElement(preview, { paused: hovered })
    : <div style={{ minHeight: 200, background: 'var(--color-surface)' }} />

  return (
    <div
      data-disabled={disabled ? 'true' : undefined}
      className={[
        'module-card group relative block overflow-hidden border border-transparent bg-surface transition-[background-color,border-color] duration-150',
        disabled ? 'cursor-default' : 'cursor-pointer hover:border-amber hover:bg-surface-hi',
      ].join(' ')}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => !disabled && setHovered(false)}
    >
      <div className="h-[3px] w-full shrink-0 bg-amber-dim" />

      <div className="relative z-10 h-[260px] w-full opacity-60 transition-opacity duration-300 group-hover:opacity-100">
        {previewEl}
      </div>

      <div className="relative z-10 border-t border-rule px-6 pt-5 pb-6">
        <p
          className="mb-2 text-[11px] font-medium uppercase tracking-wide"
          style={{ color: disabled ? 'var(--color-muted)' : 'var(--color-amber)' }}
        >
          {status}
        </p>

        <p
          className="mb-1.5 font-display text-[22px] font-normal leading-tight"
          style={{ color: disabled ? 'var(--color-muted)' : 'var(--color-ink)' }}
        >
          {title}
        </p>

        <p className="mb-3 text-xs font-light text-muted">{standard}</p>

        <p className="text-[13px] leading-relaxed text-muted">{description}</p>

        {href && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-xs tracking-wide text-amber no-underline transition-transform duration-200 ease-out group-hover:translate-x-1"
          >
            view module →
          </a>
        )}

        {labGuideHref && (
          <a
            href={labGuideHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block text-xs tracking-wide text-muted no-underline transition-colors hover:text-amber"
          >
            Lab guide →
          </a>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run lint to catch type errors**

```bash
pnpm run lint
```

Expected: no errors

---

## Task 2: Add disabled glow suppression to CSS

**Files:**
- Modify: `src/index.css` (add one rule after the existing hover rule)

The `::after` glow pseudo-element is CSS-driven and can't be toggled by JSX class conditionals. A `data-disabled` attribute rule overrides it at the CSS level.

- [ ] **Step 3: Add the disabled override rule**

In `src/index.css`, after the `.module-card:hover::after` rule (currently line 65–67), add:

```css
  .module-card[data-disabled="true"]:hover::after {
    opacity: 0;
  }
```

The full `@layer components` block should look like:
```css
  .module-card::after {
    /* ... existing ... */
  }

  .module-card:hover::after {
    opacity: 1;
  }

  .module-card[data-disabled="true"]:hover::after {
    opacity: 0;
  }
```

- [ ] **Step 4: Run lint**

```bash
pnpm run lint
```

Expected: no errors

---

## Task 3: Update App.tsx — lazy-load, 3rd card, 3-col grid

**Files:**
- Modify: `src/App.tsx`

Three changes in one task since they're all in `WorkSection` and tightly coupled:
1. Lazy-load `PythagoreanTheoremPreview` at top of file (same pattern as `RigidMotionsPreview`)
2. Add the Pythagorean Theorem `ModuleCard` as the 3rd card
3. Update grid class from `min-[521px]:grid-cols-2` to `min-[521px]:grid-cols-3`

- [ ] **Step 5: Add the lazy import for PythagoreanTheoremPreview**

After the `DilationsPreview` lazy import (line 10–12 in current `App.tsx`), add:

```tsx
const PythagoreanTheoremPreview = lazy(() =>
  import('@/components/PythagoreanTheoremPreview').then(m => ({ default: m.PythagoreanTheoremPreview }))
)
```

- [ ] **Step 6: Update the grid class and add the 3rd card in WorkSection**

In `WorkSection`, change:
```tsx
className="reveal-target mb-10 grid grid-cols-1 gap-px border border-rule bg-rule min-[521px]:grid-cols-2"
```
to:
```tsx
className="reveal-target mb-10 grid grid-cols-1 gap-px border border-rule bg-rule min-[521px]:grid-cols-3"
```

Then add the 3rd `ModuleCard` after the Dilations card:

```tsx
<ModuleCard
  status="Live — Complete"
  title="Pythagorean Theorem"
  standard="8.G.B.7–8 · Grade 8 Geometry"
  description="Area-first proof of the theorem. Students discover a² + b² = c² through three animated squares before the algebraic statement appears."
  href="https://creative-lab-five.vercel.app"
  preview={
    <Suspense fallback={<div style={{ minHeight: 200, background: 'var(--color-surface)' }} />}>
      <PythagoreanTheoremPreview paused={false} />
    </Suspense>
  }
/>
```

- [ ] **Step 7: Run lint**

```bash
pnpm run lint
```

Expected: no errors

---

## Task 4: Update StatStrip anchor stat

**Files:**
- Modify: `src/components/StatStrip.tsx`

The spec changes the first stat from `2 / "Modules complete"` to `3 / "Modules in the sequence"`.

- [ ] **Step 8: Update the first entry in the STATS array**

Change:
```ts
{ value: 2,   label: 'Modules complete' },
```
to:
```ts
{ value: 3,   label: 'Modules in the sequence' },
```

- [ ] **Step 9: Run lint**

```bash
pnpm run lint
```

Expected: no errors

---

## Task 5: Build verification + visual check

- [ ] **Step 10: Full build**

```bash
pnpm run build
```

Expected: exits 0, no TypeScript errors, no Vite warnings about missing modules

- [ ] **Step 11: Start dev server and verify visually**

```bash
pnpm run dev
```

Open http://localhost:5173 and verify:

1. **3-card grid** — Work section shows three cards side-by-side at ≥521px
2. **Pythagorean Theorem card** — renders with animated wireframe preview (three squares breathing)
3. **Card hover** — amber border, surface-hi background, `::after` glow fires on all three cards
4. **"view module →" text** — confirm all three cards say "view module →" (not "Open module →")
5. **StatStrip** — first stat reads "3" with label "Modules in the sequence" and counts up on scroll
6. **Mobile (≤520px)** — resize browser to 400px; cards stack to 1-col, no layout breakage
7. **No lab guide links** — none of the three cards have lab guide hrefs yet, so no lab guide links should appear

- [ ] **Step 12: Commit**

`PythagoreanTheoremPreview.tsx` is currently untracked — include it explicitly.

```bash
git add src/components/ModuleCard.tsx src/index.css src/App.tsx src/components/StatStrip.tsx src/components/PythagoreanTheoremPreview.tsx
git commit -m "feat: 3-card Work grid — Pythagorean Theorem card, ModuleCard refactor, stat strip update"
```
