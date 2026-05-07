# Live Demo Section Implementation Plan

**Status:** Completed (implemented)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `LiveDemoSection` between `WorkSection` and `SystemSection` in `App.tsx`, with a `CrossSectionPreview` R3F component linking to https://creative-lab-demos.vercel.app

**Architecture:** One new component file (`CrossSectionPreview.tsx`) following the exact pattern of the three existing previews. One new `LiveDemoSection` function in `App.tsx` (same file, same pattern as all other section components). A horizontal-split poster card — one-off, not `ModuleCard` — with the preview on the left (1.2fr) and text+CTA on the right (1fr) at ≥521px, stacking preview-above-text on mobile. Lazy-loaded via `React.lazy` + `Suspense` identical to the other three previews.

**Tech Stack:** React 18, React Three Fiber 9, Three.js ~0.183, Tailwind v4, TypeScript

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/components/CrossSectionPreview.tsx` | **Create** | R3F scene: wireframe cube + oscillating amber plane + cheated hexagon outline |
| `src/App.tsx` | **Modify** | Add lazy import, add `LiveDemoSection` component, wire into JSX between `<WorkSection />` and `<SystemSection />` |

No other files touched.

---

### Task 1: Create feature branch

- [ ] **Step 1: Create and check out feature branch**

```bash
git checkout -b feat/step4-live-demo-section
```

Expected: switched to new branch `feat/step4-live-demo-section`

---

### Task 2: Create `CrossSectionPreview.tsx`

**Files:**
- Create: `src/components/CrossSectionPreview.tsx`

This follows the exact pattern of `PythagoreanTheoremPreview.tsx`: a `Scene` inner component driven by `useFrame`, exported wrapped in a `<Canvas>`. The `paused` prop gates animation when the poster card is hovered.

**Scene contents:**
- Wireframe cube via `useRef<THREE.Group>` on a `<lineSegments>` element using `THREE.EdgesGeometry`
- Amber translucent cutting plane (`<mesh>` with `<planeGeometry>`) tilted to body-diagonal angle, grouped with the hexagon so they stay coplanar
- Pre-baked regular hexagon (7-point `Float32Array`, radius 0.38, XZ plane)
- `useFrame` oscillates the plane group's Y position (`Math.sin(t * 0.5) * 0.25`) and syncs hexagon material opacity (brightest at y=0)
- Material refs via JSX `ref=` on `<lineBasicMaterial>` and `<meshBasicMaterial>` inner elements

**Hexagon vertices (pre-computed, copy exactly):**

```
r = 0.38, angles 0° 60° 120° 180° 240° 300° then close back to 0°
Points: (0.38,0,0) (0.19,0.33,0) (-0.19,0.33,0) (-0.38,0,0) (-0.19,-0.33,0) (0.19,-0.33,0) (0.38,0,0)
```

**Plane tilt** (to body-diagonal angle, perpendicular to (1,1,1) direction):
- `rotation={[-Math.acos(1 / Math.sqrt(3)), Math.PI / 4, 0]}`
- This is approximately `[-0.9553, 0.7854, 0]`

- [ ] **Step 1: Create the file**

```tsx
// src/components/CrossSectionPreview.tsx
import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { tokens } from '@/tokens'

const HEX_VERTS = new Float32Array([
  0.38,  0,     0,
  0.19,  0.33,  0,
 -0.19,  0.33,  0,
 -0.38,  0,     0,
 -0.19, -0.33,  0,
  0.19, -0.33,  0,
  0.38,  0,     0,  // close
])

function Scene({ paused }: { paused: boolean }) {
  const planeGroupRef = useRef<THREE.Group>(null)
  const hexMatRef = useRef<THREE.LineBasicMaterial>(null)

  const cubeEdges = useMemo(
    () => new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)),
    []
  )

  useFrame(({ clock }) => {
    if (paused) return
    const t = clock.getElapsedTime()
    const s = Math.sin(t * 0.5)
    if (planeGroupRef.current) planeGroupRef.current.position.y = s * 0.25
    if (hexMatRef.current) hexMatRef.current.opacity = (1 - Math.abs(s)) * 0.85
  })

  return (
    <group>
      {/* Wireframe cube */}
      <lineSegments geometry={cubeEdges}>
        <lineBasicMaterial color={tokens.three.ink} transparent opacity={0.5} />
      </lineSegments>

      {/* Cutting plane + hexagon grouped so they stay coplanar */}
      <group
        ref={planeGroupRef}
        rotation={[-Math.acos(1 / Math.sqrt(3)), Math.PI / 4, 0]}
      >
        <mesh>
          <planeGeometry args={[1.6, 1.6]} />
          <meshBasicMaterial
            color={tokens.three.amber}
            transparent
            opacity={0.12}
            side={THREE.DoubleSide}
          />
        </mesh>

        <line>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[HEX_VERTS, 3]} />
          </bufferGeometry>
          <lineBasicMaterial
            ref={hexMatRef}
            color={tokens.three.amber}
            transparent
            opacity={0}
          />
        </line>
      </group>
    </group>
  )
}

export function CrossSectionPreview({ paused }: { paused: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 2.8], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent', width: '100%', height: '100%' }}
    >
      <Scene paused={paused} />
    </Canvas>
  )
}
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
pnpm exec tsc --noEmit
```

Expected: exits 0 (or only the pre-existing HeroCanvas errors — check there are no new errors in CrossSectionPreview.tsx)

---

### Task 3: Add lazy import in `App.tsx`

**Files:**
- Modify: `src/App.tsx` (lines 13–15, after the `PythagoreanTheoremPreview` lazy import)

- [ ] **Step 1: Add the lazy import**

In `src/App.tsx`, after the existing lazy imports (around line 15), add:

```ts
const CrossSectionPreview = lazy(() =>
  import('@/components/CrossSectionPreview').then(m => ({ default: m.CrossSectionPreview }))
)
```

The four lazy imports should now read:

```ts
const RigidMotionsPreview = lazy(...)
const DilationsPreview = lazy(...)
const PythagoreanTheoremPreview = lazy(...)
const CrossSectionPreview = lazy(...)   // ← new
```

---

### Task 4: Add `LiveDemoSection` component in `App.tsx`

**Files:**
- Modify: `src/App.tsx` — add component function after `WorkSection` (before `SystemSection`)

The poster card is a one-off layout, not `ModuleCard`. It uses the same token/class vocabulary (amber bar, status badge, font scales) but with a horizontal split grid that `ModuleCard` doesn't support.

- [ ] **Step 1: Add `useState` to the import line**

The existing import at line 1 is:
```ts
import { useRef, lazy, Suspense } from 'react'
```

Change to:
```ts
import { useRef, lazy, Suspense, useState } from 'react'
```

- [ ] **Step 2: Add the `LiveDemoSection` component**

Insert this function in `App.tsx` immediately after `WorkSection` ends (before `SystemSection`):

```tsx
function LiveDemoSection() {
  const ref = useScrollReveal<HTMLElement>()
  const [hovered, setHovered] = useState(false)

  return (
    <section ref={ref} className={sectionClass}>
      <SectionLabel>Live Demo — Cross-Section Explorer</SectionLabel>

      <div
        className="reveal-target group relative overflow-hidden border border-rule bg-surface transition-[background-color,border-color] duration-150 cursor-pointer hover:border-amber hover:bg-surface-hi"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Amber top bar */}
        <div className="h-[3px] w-full shrink-0 bg-amber-dim" />

        {/* Horizontal split: preview (1.2fr) | text (1fr) */}
        <div className="grid grid-cols-1 min-[521px]:grid-cols-[1.2fr_1fr]">
          {/* Preview pane — above text on mobile (source order) */}
          <div className="h-[220px] min-[521px]:h-[280px] opacity-60 transition-opacity duration-300 group-hover:opacity-100">
            <Suspense fallback={<div style={{ minHeight: 220, background: 'var(--color-surface)' }} />}>
              <CrossSectionPreview paused={hovered} />
            </Suspense>
          </div>

          {/* Text pane */}
          <div className="flex flex-col justify-center border-t border-rule px-6 py-6 min-[521px]:border-l min-[521px]:border-t-0">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-amber">
              In Progress — CSE
            </p>
            <p className="mb-2 font-display text-[22px] font-normal leading-tight text-ink">
              Cross-Section Explorer
            </p>
            <p className="mb-5 text-[13px] leading-relaxed text-muted">
              Drag a plane through a cube. Watch the slice become a hexagon.
            </p>
            <a
              href="https://creative-lab-demos.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs tracking-wide text-amber no-underline transition-transform duration-200 ease-out group-hover:translate-x-1"
            >
              Open demo →
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
```

---

### Task 5: Wire `LiveDemoSection` into the page

**Files:**
- Modify: `src/App.tsx` — the `App` default export JSX (around line 378)

- [ ] **Step 1: Insert the section between WorkSection and SystemSection**

Find this in the JSX:

```tsx
<WorkSection />
<SystemSection />
```

Change to:

```tsx
<WorkSection />
<LiveDemoSection />
<SystemSection />
```

---

### Task 6: Visual verification in browser

- [ ] **Step 1: Start dev server**

```bash
pnpm run dev
```

Open http://localhost:5173

- [ ] **Step 2: Verify scroll reveal**

Scroll past the Work section. `LiveDemoSection` should fade+slide in via the standard `useScrollReveal` / `reveal-target` pattern.

- [ ] **Step 3: Verify preview animation**

The cube wireframe should be visible. The amber plane should oscillate vertically. The hexagon should pulse in (brightest) and out (invisible) as the plane sweeps through center.

- [ ] **Step 4: Verify hover behavior**

Hover the card:
- Border turns amber
- Background shifts to `surface-hi`
- Preview opacity goes from 60% → 100%
- Animation pauses (`paused={true}` passed to CrossSectionPreview)
- "Open demo →" arrow translates right

- [ ] **Step 5: Verify mobile layout**

Resize to <521px. Preview should be above text (stacked, source order). Preview height 220px.

- [ ] **Step 6: Verify CTA link**

Click "Open demo →". Should open `https://creative-lab-demos.vercel.app` in a new tab.

- [ ] **Step 7: Verify section order**

Page order should be: Work → Live Demo → System → About → Pelican → ISTE → Contact.

---

### Task 7: Lint check

- [ ] **Step 1: Run linter**

```bash
pnpm run lint
```

Expected: exits with code 1 (the 2 pre-existing HeroCanvas errors). Verify that CrossSectionPreview and App changes produce **no new errors**. If new errors appear, fix them before committing.

---

### Task 8: Commit and open PR

- [ ] **Step 1: Stage files**

```bash
git add src/components/CrossSectionPreview.tsx src/App.tsx docs/superpowers/specs/2026-05-01-live-demo-section-design.md docs/superpowers/plans/2026-05-01-step4-live-demo-section.md
```

- [ ] **Step 2: Commit**

```bash
git commit -m "feat: add LiveDemoSection and CrossSectionPreview — Step 4"
```

- [ ] **Step 3: Push and open PR**

```bash
git push -u origin feat/step4-live-demo-section
gh pr create --title "feat: Step 4 — Live Demo section" --body "$(cat <<'EOF'
## Summary
- Adds `CrossSectionPreview` — wireframe cube + oscillating amber plane + cheated hexagon outline
- Adds `LiveDemoSection` — horizontal-split poster card linking to https://creative-lab-demos.vercel.app
- Inserts between WorkSection and SystemSection per creative direction: Work → Live Demo → System

## Visual
- Desktop: `grid-cols-[1.2fr_1fr]` (preview left, text+CTA right)
- Mobile: preview above text (source order, stacked)
- Hover: amber border, surface-hi bg, preview opacity 100%, animation paused, arrow translates right

## Test plan
- [ ] Scroll reveal fires correctly on entry
- [ ] Preview animation: plane oscillates, hexagon pulses at center position
- [ ] Hover state: border/bg/opacity/arrow all respond
- [ ] CTA opens https://creative-lab-demos.vercel.app in new tab
- [ ] Mobile: preview above text at <521px
- [ ] No new lint errors beyond the 2 pre-existing HeroCanvas ones

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```
