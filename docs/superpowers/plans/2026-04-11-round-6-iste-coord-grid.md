# Round 6 — ISTE Section + Coordinate Grid Background Implementation Plan

**Status:** Completed (implemented)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the ISTE section feel like an invitation — add a faint coordinate grid background, update the CTA button styling, and increase section breathing room.

**Architecture:** Create a self-contained `CoordGridBackground` SVG component that renders tiled grid lines, then wire it into `ISTESection` in `App.tsx` alongside button and padding updates. No new hooks, no new CSS classes — all changes are additive to two files.

**Tech Stack:** React 19, TypeScript, Tailwind v4, SVG

---

## File Map

| File | Change |
|------|--------|
| `src/components/CoordGridBackground.tsx` | **Create** — SVG grid component |
| `src/App.tsx` | **Modify** — `ISTESection` only: add grid, update button, adjust padding |

---

### Task 1: Create CoordGridBackground component

**Files:**
- Create: `src/components/CoordGridBackground.tsx`

- [ ] **Step 1: Create the file**

```tsx
// src/components/CoordGridBackground.tsx

interface Props {
  width?: number
  height?: number
  unit?: number
  color?: string
  opacity?: number
}

export function CoordGridBackground({
  width = 1200,
  height = 600,
  unit = 40,
  color = 'var(--color-amber)',
  opacity = 0.04,
}: Props) {
  const hLines: React.ReactElement[] = []
  const vLines: React.ReactElement[] = []

  for (let y = 0; y <= height; y += unit) {
    hLines.push(<line key={`h${y}`} x1={0} y1={y} x2={width} y2={y} />)
  }

  for (let x = 0; x <= width; x += unit) {
    vLines.push(<line key={`v${x}`} x1={x} y1={0} x2={x} y2={height} />)
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <g stroke={color} strokeOpacity={opacity} strokeWidth={1}>
        {hLines}
        {vLines}
      </g>
    </svg>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: clean build, no errors on the new file.

---

### Task 2: Update ISTESection

**Files:**
- Modify: `src/App.tsx` — `ISTESection` function only (lines ~138–171)

- [ ] **Step 1: Add the import**

At the top of `src/App.tsx`, add alongside the other component imports:

```tsx
import { CoordGridBackground } from '@/components/CoordGridBackground'
```

- [ ] **Step 2: Update ISTESection**

Replace the entire `ISTESection` function with:

```tsx
function ISTESection() {
  const ref = useISTEEntrance<HTMLElement>()
  return (
    <section ref={ref} className={sectionClass} style={{ position: 'relative', paddingTop: 80, paddingBottom: 80 }}>
      <CoordGridBackground />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="grid grid-cols-1 items-center gap-6 min-[521px]:grid-cols-[2fr_1fr] min-[521px]:gap-12">
          <div>
            <p id="iste-date" className="mb-1 font-display text-[40px] font-light leading-tight text-ink">
              {"ISTE Live 26".split('').map((char, i) => (
                <span key={i} className="inline-block">
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </p>
            <p className="mb-5 text-[13px] uppercase tracking-wide text-muted">
              Orlando · June 28 – July 1, 2026
            </p>
            <p className="text-[15px] leading-[1.75] text-ink">
              I'll be at ISTE this summer showing what discovery-first, student-tested interactive
              math looks like in practice. If you're building in this space — or just curious —
              I'd like to talk.
            </p>
          </div>
          <div className="text-left min-[521px]:text-right">
            <a
              href="mailto:rplapointjr@gmail.com"
              className="iste-cta inline-block px-[22px] py-3 text-[13px] font-medium tracking-wide no-underline"
              style={{
                background: 'var(--color-amber-dim)',
                color: 'var(--color-ink)',
                transition: 'background 0.2s, transform 0.2s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget
                el.style.background = 'var(--color-amber)'
                el.style.transform = 'scale(1.02)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget
                el.style.background = 'var(--color-amber-dim)'
                el.style.transform = 'scale(1)'
              }}
            >
              Let's meet →
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
```

**Note on padding:** `sectionClass` uses Tailwind's `py-16` (64px). The inline `paddingTop/paddingBottom: 80` overrides it for this section only without touching the shared class used by every other section.

**Note on button hover:** Tailwind v4 doesn't have a `scale-[1.02]` hover utility wired up in this project. Using `onMouseEnter`/`onMouseLeave` inline handlers matches the existing pattern in `ModuleCard.tsx` for hover state management.

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: clean build, no TypeScript errors.

- [ ] **Step 4: Visual check**

Run: `npm run dev` and open `http://localhost:5173`. Scroll to the ISTE section and verify:
- Faint amber grid lines are visible in the section background (subtle — if you have to look for them, that's correct)
- All section text and button render above the grid (not obscured)
- Button rests at `--color-amber-dim` (muted gold fill, not the bright `bg-ink` black)
- Button hover transitions to full `--color-amber` and scales up slightly
- Section has more vertical breathing room than before

- [ ] **Step 5: Commit**

```bash
git add src/components/CoordGridBackground.tsx src/App.tsx
git commit -m "feat(round-6): add CoordGridBackground and update ISTE section"
```
