# Step 5: Act Break + Live Demo Elevation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the two-act page structure by reordering sections, upgrading the CrossSectionPreview to live intersection geometry with an orchestrated reveal cycle, and adding the typographic Act Break between Act 1 and Act 2.

**Architecture:** Three sequential changes to three files. Section reorder is a one-line swap in App.tsx. The Act Break adds a hook to useScrollReveal.ts and a component to App.tsx. The CrossSectionPreview is a full rewrite of one component file — live Three.js intersection math replaces the pre-baked hexagon.

**Tech Stack:** React 19, TypeScript, Three.js ~0.183, React Three Fiber 9, GSAP + ScrollTrigger, Tailwind CSS v4

---

## File Map

| File | Change |
|------|--------|
| `src/App.tsx` | Swap section order; add `ActBreakSection` component and JSX insertion |
| `src/hooks/useScrollReveal.ts` | Add `useActBreakReveal` export |
| `src/components/CrossSectionPreview.tsx` | Full rewrite |

No new files created. No other files touched.

---

## Pre-flight

- [ ] Confirm dev server runs: `pnpm run dev` → `http://localhost:5173`
- [ ] Confirm baseline: page loads, `LiveDemoSection` appears after `WorkSection`, no console errors

---

## Task 1: Section Reorder

**Files:** Modify `src/App.tsx`

The only change is swapping the render order of `<LiveDemoSection />` and `<WorkSection />` in the `App` component's return. No props, logic, or component internals change.

- [ ] **Step 1: Locate the section order in App.tsx**

Find the block in `App()` that reads (approximately lines 398–430):
```tsx
<WorkSection />
<LiveDemoSection />
<SystemSection />
```

- [ ] **Step 2: Swap the two components**

Change to:
```tsx
<LiveDemoSection />
<WorkSection />
<SystemSection />
```

- [ ] **Step 3: Verify in browser**

Run `pnpm run dev`. Scroll down from the hero — the Cross-Section Explorer card should appear first, the three module cards second. The System section follows unchanged.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: move LiveDemoSection before WorkSection (Act 1 ordering)"
```

---

## Task 2: ActBreakSection

**Files:** Modify `src/hooks/useScrollReveal.ts`, modify `src/App.tsx`

### Step 2a — Add `useActBreakReveal` hook

- [ ] **Step 1: Add the hook to useScrollReveal.ts**

Append to the end of `src/hooks/useScrollReveal.ts` (after `useContactUnderline`):

```ts
/**
 * Animate the act break text and rule on scroll entry.
 * Targets .act-break-text (opacity + y) and .act-break-rule (opacity only).
 * 0.6s delay on text — the beat of silence before the reveal.
 * Uses useEffect (not useLayoutEffect) — ScrollTrigger needs post-paint layout.
 */
export function useActBreakReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!ref.current) return
    const text = ref.current.querySelector<HTMLElement>('.act-break-text')
    const rule = ref.current.querySelector<HTMLElement>('.act-break-rule')
    if (!text || !rule) return

    const ctx = gsap.context(() => {
      gsap.set([text, rule], { opacity: 0 })
      gsap.set(text, { y: 20 })

      ScrollTrigger.create({
        trigger: ref.current,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap.to(text, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.6 })
          gsap.to(rule,  { opacity: 1, duration: 0.3, delay: 1.0 })
        },
      })
    }, ref)

    return () => ctx.revert()
  }, [])

  return ref
}
```

- [ ] **Step 2: Add `useActBreakReveal` to the import in App.tsx**

In `src/App.tsx`, find the existing hook import line:
```ts
import { useScrollReveal, useNavReveal, useHeroEntrance, useProofBlockReveal, useISTEEntrance, useContactUnderline, useScrollProgress } from '@/hooks/useScrollReveal'
```

Add `useActBreakReveal` to the named imports:
```ts
import { useScrollReveal, useNavReveal, useHeroEntrance, useProofBlockReveal, useISTEEntrance, useContactUnderline, useScrollProgress, useActBreakReveal } from '@/hooks/useScrollReveal'
```

### Step 2b — Add `ActBreakSection` component to App.tsx

- [ ] **Step 3: Add the component**

Add this function to `src/App.tsx` before the `App` default export (e.g., after `LiveDemoSection`):

```tsx
function ActBreakSection() {
  const ref = useActBreakReveal<HTMLDivElement>()
  return (
    <div ref={ref} className="py-20 text-center">
      <p
        className="act-break-text font-display font-light italic text-amber"
        style={{ fontSize: 'clamp(20px, 3vw, 28px)' }}
      >
        Now you know what it feels like. Here&rsquo;s how it works.
      </p>
      <div className="act-break-rule mt-8 h-px w-10 bg-rule mx-auto" />
    </div>
  )
}
```

Note: `Here&rsquo;s` is the HTML entity for the right single quotation mark — avoids a raw apostrophe in JSX.

- [ ] **Step 4: Insert `<ActBreakSection />` between WorkSection and SystemSection in App.tsx**

Find the section order from Task 1:
```tsx
<LiveDemoSection />
<WorkSection />
<SystemSection />
```

Change to:
```tsx
<LiveDemoSection />
<WorkSection />
<ActBreakSection />
<SystemSection />
```

- [ ] **Step 5: Verify in browser**

Run `pnpm run dev`. Scroll past the Work section module cards — an amber italic sentence should fade in, followed by a short horizontal rule. The timing: text appears ~0.6s after the section enters view, rule appears ~0.4s after text.

Check: scrolling up and back down should NOT re-trigger the animation (the `once: true` guard).

- [ ] **Step 6: Verify no lint errors**

```bash
pnpm run lint
```

Expected: exits code 1 (the two pre-existing HeroCanvas.tsx errors). Zero new errors.

- [ ] **Step 7: Commit**

```bash
git add src/hooks/useScrollReveal.ts src/App.tsx
git commit -m "feat: add ActBreakSection and useActBreakReveal hook"
```

---

## Task 3: CrossSectionPreview Overhaul

**Files:** Full rewrite of `src/components/CrossSectionPreview.tsx`

This is the most complex task. Read this entire task before starting.

**What changes:**
- The pre-baked hexagon shape and oscillating plane group are removed entirely
- The `EdgesGeometry` + single `lineSegments` is removed; replaced with 12 individual `<line>` elements
- Live intersection geometry is computed each frame in `useFrame`
- An orchestrated animation cycle (triangle → hexagon → hold → triangle) drives a `k` parameter
- All geometry buffers are pre-allocated; only their contents are mutated in `useFrame`
- The wrapper `<group ref={groupRef}>` handles all visual rotation — intersection math stays in local space

- [ ] **Step 1: Replace the entire file**

Replace `src/components/CrossSectionPreview.tsx` with:

```tsx
import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { tokens } from '@/tokens'

// ── Module-level constants (never recreated) ────────────────────────────────

const s = 0.5
const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)

/** 12 edges of a unit cube centered at origin */
const CUBE_EDGES: [THREE.Vector3, THREE.Vector3][] = [
  // Bottom face
  [v(-s,-s,-s), v( s,-s,-s)],
  [v( s,-s,-s), v( s,-s, s)],
  [v( s,-s, s), v(-s,-s, s)],
  [v(-s,-s, s), v(-s,-s,-s)],
  // Top face
  [v(-s, s,-s), v( s, s,-s)],
  [v( s, s,-s), v( s, s, s)],
  [v( s, s, s), v(-s, s, s)],
  [v(-s, s, s), v(-s, s,-s)],
  // Vertical edges
  [v(-s,-s,-s), v(-s, s,-s)],
  [v( s,-s,-s), v( s, s,-s)],
  [v( s,-s, s), v( s, s, s)],
  [v(-s,-s, s), v(-s, s, s)],
]

/** Orthonormal basis vectors perpendicular to [1,1,1] for polygon sort */
const BASIS_U = new THREE.Vector3(1, -1, 0).normalize()
const BASIS_V = new THREE.Vector3(1, 1, -2).normalize()

/** Geometry pre-built for each cube edge (positions never change) */
const EDGE_GEOMETRIES = CUBE_EDGES.map(([A, B]) => {
  const positions = new Float32Array([A.x, A.y, A.z, B.x, B.y, B.z])
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  return g
})

// ── Animation cycle ─────────────────────────────────────────────────────────

const SWEEP_IN  = 2.0  // seconds: k from -0.75 to 0
const HOLD      = 1.5  // seconds: k held at 0 (hexagon)
const SWEEP_OUT = 2.0  // seconds: k from 0 to 0.75
const PAUSE     = 0.5  // seconds: brief reset before next cycle
const CYCLE     = SWEEP_IN + HOLD + SWEEP_OUT + PAUSE  // 6s total

function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2
}

function computeK(elapsed: number): { k: number; holding: boolean } {
  const t = elapsed % CYCLE
  if (t < SWEEP_IN) {
    return { k: -0.75 + 0.75 * easeInOutSine(t / SWEEP_IN), holding: false }
  }
  if (t < SWEEP_IN + HOLD) {
    return { k: 0, holding: true }
  }
  if (t < SWEEP_IN + HOLD + SWEEP_OUT) {
    return { k: 0.75 * easeInOutSine((t - SWEEP_IN - HOLD) / SWEEP_OUT), holding: false }
  }
  return { k: 0.75, holding: false }
}

// ── Intersection math ───────────────────────────────────────────────────────

/**
 * Compute where the plane x+y+z=k intersects the 12 cube edges.
 * Uses open interval (t > ε, t < 1-ε) to avoid double-counting shared corners.
 * Returns sorted convex polygon vertices and the set of intersected edge indices.
 */
function computeIntersection(k: number): {
  points: THREE.Vector3[]
  edgeIndices: Set<number>
} {
  const points: THREE.Vector3[] = []
  const edgeIndices = new Set<number>()
  const EPS = 1e-10

  for (let i = 0; i < CUBE_EDGES.length; i++) {
    const [A, B] = CUBE_EDGES[i]
    const denom = (B.x - A.x) + (B.y - A.y) + (B.z - A.z)
    if (Math.abs(denom) < EPS) continue
    const t = (k - (A.x + A.y + A.z)) / denom
    if (t > EPS && t < 1 - EPS) {
      points.push(A.clone().lerp(B, t))
      edgeIndices.add(i)
    }
  }

  if (points.length < 3) return { points, edgeIndices }

  // Sort as convex polygon using angle around centroid projected onto the plane
  const centroid = new THREE.Vector3()
  points.forEach(p => centroid.add(p))
  centroid.divideScalar(points.length)

  points.sort((a, b) => {
    const da = a.clone().sub(centroid)
    const db = b.clone().sub(centroid)
    return Math.atan2(da.dot(BASIS_V), da.dot(BASIS_U))
         - Math.atan2(db.dot(BASIS_V), db.dot(BASIS_U))
  })

  return { points, edgeIndices }
}

// ── Scene ───────────────────────────────────────────────────────────────────

function Scene({ paused }: { paused: boolean }) {
  const groupRef = useRef<THREE.Group>(null)

  // Outline: max 7 points (6 + closing repeat), 3 floats each = 21
  const outlinePositions = useMemo(() => new Float32Array(21), [])
  const outlineGeo = useMemo(() => {
    const attr = new THREE.BufferAttribute(outlinePositions, 3)
    attr.setUsage(THREE.DynamicDrawUsage)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', attr)
    g.setDrawRange(0, 0)
    return g
  }, [outlinePositions])
  const outlineMatRef = useRef<THREE.LineBasicMaterial>(null)

  // Fill: max 4 triangles × 3 vertices × 3 floats = 36
  const fillPositions = useMemo(() => new Float32Array(36), [])
  const fillGeo = useMemo(() => {
    const attr = new THREE.BufferAttribute(fillPositions, 3)
    attr.setUsage(THREE.DynamicDrawUsage)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', attr)
    g.setDrawRange(0, 0)
    return g
  }, [fillPositions])

  // Vertex dots: 6 pre-allocated meshes
  const dotRefs = useRef<(THREE.Mesh | null)[]>(Array(6).fill(null))
  const dotGeo = useMemo(() => new THREE.SphereGeometry(0.025, 8, 8), [])

  // Edge material refs: 12 individual materials, one per cube edge
  const edgeMatRefs = useRef<(THREE.LineBasicMaterial | null)[]>(Array(12).fill(null))

  useFrame(({ clock }) => {
    if (paused || !groupRef.current) return

    const elapsed = clock.getElapsedTime()

    // Rotate entire group — intersection math stays in local space
    groupRef.current.rotation.y += 0.004
    groupRef.current.rotation.x = Math.sin(elapsed * 0.12) * 0.15

    const { k, holding } = computeK(elapsed)
    const { points, edgeIndices } = computeIntersection(k)
    const n = points.length

    // Update edge highlight colors
    for (let i = 0; i < 12; i++) {
      const mat = edgeMatRefs.current[i]
      if (!mat) continue
      if (edgeIndices.has(i)) {
        mat.color.setHex(tokens.three.amber)
        mat.opacity = 0.8
      } else {
        mat.color.setHex(tokens.three.ink)
        mat.opacity = 0.35
      }
    }

    if (n < 3) {
      outlineGeo.setDrawRange(0, 0)
      fillGeo.setDrawRange(0, 0)
      dotRefs.current.forEach(d => d && (d.visible = false))
      return
    }

    // Outline: write n points + closing repeat
    for (let i = 0; i < n; i++) {
      outlinePositions[i * 3]     = points[i].x
      outlinePositions[i * 3 + 1] = points[i].y
      outlinePositions[i * 3 + 2] = points[i].z
    }
    outlinePositions[n * 3]     = points[0].x
    outlinePositions[n * 3 + 1] = points[0].y
    outlinePositions[n * 3 + 2] = points[0].z
    ;(outlineGeo.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true
    outlineGeo.setDrawRange(0, n + 1)

    // Fill: triangle fan from centroid
    const centroid = new THREE.Vector3()
    points.forEach(p => centroid.add(p))
    centroid.divideScalar(n)
    let idx = 0
    for (let i = 0; i < n - 2; i++) {
      fillPositions[idx++] = centroid.x;    fillPositions[idx++] = centroid.y;    fillPositions[idx++] = centroid.z
      fillPositions[idx++] = points[i].x;   fillPositions[idx++] = points[i].y;   fillPositions[idx++] = points[i].z
      fillPositions[idx++] = points[i+1].x; fillPositions[idx++] = points[i+1].y; fillPositions[idx++] = points[i+1].z
    }
    ;(fillGeo.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true
    fillGeo.setDrawRange(0, (n - 2) * 3)

    // Vertex dots
    const dotOpacity = holding ? 1.0 : 0.5
    for (let i = 0; i < 6; i++) {
      const dot = dotRefs.current[i]
      if (!dot) continue
      if (i < n) {
        dot.visible = true
        dot.position.copy(points[i])
        ;(dot.material as THREE.MeshBasicMaterial).opacity = dotOpacity
      } else {
        dot.visible = false
      }
    }

    // Outline opacity: slightly brighter during hold
    if (outlineMatRef.current) {
      outlineMatRef.current.opacity = holding ? 0.95 : 0.85
    }
  })

  return (
    <group ref={groupRef}>
      {/* 12 individual cube edges — replaces the former EdgesGeometry lineSegments */}
      {EDGE_GEOMETRIES.map((geo, i) => (
        <line key={i} geometry={geo}>
          <lineBasicMaterial
            ref={(el: THREE.LineBasicMaterial | null) => { edgeMatRefs.current[i] = el }}
            color={tokens.three.ink}
            transparent
            opacity={0.35}
          />
        </line>
      ))}

      {/* Cross-section outline */}
      <line geometry={outlineGeo}>
        <lineBasicMaterial
          ref={outlineMatRef}
          color={tokens.three.amber}
          transparent
          opacity={0.85}
        />
      </line>

      {/* Cross-section fill */}
      <mesh geometry={fillGeo}>
        <meshBasicMaterial
          color={tokens.three.amber}
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 6 pre-allocated vertex dots */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh
          key={i}
          ref={(el: THREE.Mesh | null) => { dotRefs.current[i] = el }}
          geometry={dotGeo}
          visible={false}
        >
          <meshBasicMaterial
            color={tokens.three.amber}
            transparent
            opacity={0.5}
          />
        </mesh>
      ))}
    </group>
  )
}

// ── Export ──────────────────────────────────────────────────────────────────

export function CrossSectionPreview({ paused }: { paused: boolean }) {
  return (
    <Canvas
      camera={{ position: [1.5, 1.2, 2.2], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
      dpr={Math.min(window.devicePixelRatio, 2)}
      style={{ background: 'transparent', width: '100%', height: '100%' }}
    >
      <Scene paused={paused} />
    </Canvas>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm run build
```

Expected: clean build, no TypeScript errors. If there are type errors on `ref` callbacks, check that the type annotation matches `(el: THREE.LineBasicMaterial | null) => void`.

- [ ] **Step 3: Verify in browser — animation cycle**

Run `pnpm run dev`. Navigate to the Live Demo section. Watch the CrossSectionPreview:

1. The cube should rotate slowly and read as clearly 3D (not flat)
2. A cross-section polygon should appear and change shape — starts as a triangle, grows to a hexagon
3. At the hexagon, the animation **pauses for ~1.5 seconds** — amber vertex dots glow brighter
4. The hexagon then shrinks back to a triangle
5. The cycle repeats cleanly (~6s per loop)
6. Cube edges that are currently intersected by the cutting plane should highlight in amber

- [ ] **Step 4: Verify hover pause**

Hover over the Live Demo card. The animation should freeze at whatever shape it's currently displaying. Mouse out — animation resumes from the frozen point.

- [ ] **Step 5: Verify no regressions**

Scroll the full page: hero, live demo, work section, act break, system, about, pelican, ISTE, contact. All scroll animations should fire as before. The act break amber text should animate in on scroll.

- [ ] **Step 6: Verify no new lint errors**

```bash
pnpm run lint
```

Expected: exits code 1 (the two pre-existing HeroCanvas.tsx errors only). Zero new errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/CrossSectionPreview.tsx
git commit -m "feat: overhaul CrossSectionPreview with live intersection geometry and reveal cycle"
```

---

## Final Check

- [ ] Run `pnpm run build` — clean TypeScript compile, no errors
- [ ] Confirm section order in browser: Live Demo → Work → Act Break → System
- [ ] Confirm the hexagon hold is the visual center of the Live Demo preview
- [ ] Confirm act break text and rule animate in exactly once on scroll
