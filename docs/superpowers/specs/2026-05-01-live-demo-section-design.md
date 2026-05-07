# Live Demo Section — Design Spec

**Date:** 2026-05-01  
**Status:** Completed (implemented)  
**Step:** 4 of 5 (portfolio build sequence)

---

## Goal

Add a `LiveDemoSection` between `WorkSection` and `SystemSection` in `App.tsx`. This section surfaces the Cross-Section Explorer (CSE) — the current work-in-progress — as a live, linkable demo with an animated 3D preview that telegraphs the mathematical insight before the visitor clicks through.

Narrative role: Work (past output) → **Live Demo (current work)** → System (design thinking) → About → …

---

## Section Placement

`<LiveDemoSection />` inserts in `App.tsx` between `<WorkSection />` and `<SystemSection />`. No other sections move.

---

## New File: `CrossSectionPreview.tsx`

Follows the exact pattern of `PythagoreanTheoremPreview`, `RigidMotionsPreview`, `DilationsPreview`.

**Props:** `{ paused: boolean }` — gates animation when hovered (ModuleCard `cloneElement` pattern).

**Scene contents:**
- Wireframe cube: `<lineSegments>` with `<edgesGeometry args={[new THREE.BoxGeometry(1, 1, 1)]}>`; `lineBasicMaterial` ink color, opacity ~0.5
- Translucent amber cutting plane: `<mesh>` with `<planeGeometry args={[1.6, 1.6]}>`, tilted ~35° on X, `meshBasicMaterial` amber color, opacity 0.15, `side={THREE.DoubleSide}`
- Cheated hexagon outline: pre-baked `Float32Array` of 7 points (6 vertices + close) forming a regular hexagon, drawn as `<line>`, amber color, opacity 0.85
- Plane Y oscillates in `useFrame` via `Math.sin(t * 0.5)` × 0.25 range; hexagon opacity pulses in sync (brightest at diagonal)
- Whole scene in a `useRef<THREE.Group>` for future extension

**Canvas:** `camera={{ position: [0, 0, 2.8], fov: 42 }}`, `gl={{ antialias: true, alpha: true }}`, transparent background.

**Lazy-loaded** in `App.tsx` via `React.lazy` + `Suspense`, same pattern as other previews.

---

## New Section: `LiveDemoSection`

Uses `useScrollReveal` hook; children with `reveal-target` class animate on scroll entry (standard pattern).

**Copy:**
- Section label (SectionLabel component): `"Live Demo — Cross-Section Explorer"`
- No standalone heading above the card — the card title carries it
- Card heading: `"Cross-Section Explorer"` (Fraunces, ~22px, font-normal)
- Card subline: `"Drag a plane through a cube. Watch the slice become a hexagon."` (muted, 13–14px)
- CTA button text: `"Open demo →"`

**Layout — poster card (one-off, not ModuleCard):**

```
Desktop (≥521px): grid-cols-[1.2fr_1fr]
┌──────────────────────────┬───────────────────┐
│  CrossSectionPreview     │  [amber top bar]  │
│  (h-[260px] full height) │  Status badge     │
│                          │  Heading          │
│                          │  Subline          │
│                          │  [CTA button]     │
└──────────────────────────┴───────────────────┘

Mobile (<521px): single column, preview above text
┌────────────────────────┐
│  CrossSectionPreview   │
│  (h-[220px])           │
├────────────────────────┤
│  Status badge          │
│  Heading               │
│  Subline               │
│  [CTA button]          │
└────────────────────────┘
```

**Visual treatment — matches ModuleCard language:**
- Outer container: `border border-rule bg-surface overflow-hidden` with `hover:border-amber hover:bg-surface-hi transition-colors`
- Top amber bar: `h-[3px] w-full bg-amber-dim` (desktop: spans only the text column top; mobile: full width)
- Status badge: amber uppercase 11px — `"In Progress — CSE"`
- Preview pane: `opacity-60` idle, `opacity-100` on section hover (CSS group-hover or JS state)
- CTA: `<a href="https://creative-lab-demos.vercel.app" target="_blank" rel="noopener noreferrer">` — styled as inline amber text link with arrow, same as ModuleCard's "view module →"; NOT a button element

**No `ModuleCard` reuse** — the horizontal split and CTA-vs-nav-link difference make a one-off cleaner. The visual vocabulary is consistent (same tokens, same amber bar, same status/title/desc hierarchy) but the layout diverges.

---

## Lazy-load wiring

In `App.tsx`, add:

```ts
const CrossSectionPreview = lazy(() =>
  import('@/components/CrossSectionPreview').then(m => ({ default: m.CrossSectionPreview }))
)
```

In the section JSX, wrap in `<Suspense fallback={<div style={{ minHeight: 220, background: 'var(--color-surface)' }} />}>`.

The `paused` prop is passed directly (no `cloneElement` needed since this isn't inside `ModuleCard`). Hover state is tracked with `useState` on the poster card container.

---

## What this is NOT

- Not a new route or page — external link only
- Not a reuse of `ModuleCard` — one-off card layout
- Not the live hexagon-from-cube intersection math — cheated static hexagon
- Not Step 3 (Act Break) — that's a separate branch/PR between Live Demo and System
