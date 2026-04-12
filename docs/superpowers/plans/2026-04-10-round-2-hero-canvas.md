# Round 2 — Hero Canvas Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade HeroCanvas with depth-based polygon opacity, a staggered GSAP entrance animation (opacity + z-rise), a pixelRatio performance cap, and a CSS ambient glow behind the canvas.

**Architecture:** All changes are self-contained in `src/components/HeroCanvas.tsx` and `src/index.css`. The `Polygon` component owns its own entrance animation via an internal `materialRef` and `useEffect` — no parent-level ref coordination needed. GSAP tweens directly on the Three.js material object and group position.

**Tech Stack:** React Three Fiber, Three.js, GSAP, TypeScript

---

## Files Touched

| File | Change |
|------|--------|
| `src/components/HeroCanvas.tsx` | Add `opacity` to `PolyProps` + `POLYS`; update `Polygon` with `materialRef` + entrance animation; add `entranceDelay` prop; pixelRatio cap on `<Canvas>` |
| `src/index.css` | Add `.hero-glow` CSS rule |

---

## Task 1: Update PolyProps, POLYS config, and pixelRatio cap

**Files:**
- Modify: `src/components/HeroCanvas.tsx`

This task makes three small, non-breaking changes that lay the groundwork for Task 2.

- [ ] **Step 1: Add `opacity` to the `PolyProps` interface**

Find the `PolyProps` interface (currently lines 6–13) and add the `opacity` field:

```ts
interface PolyProps {
  position: [number, number, number]
  rotationZ: number
  scale: number
  sides: number
  speed: number
  drift: [number, number]
  opacity: number
}
```

- [ ] **Step 2: Replace the `POLYS` config array with opacity values**

Replace the existing `POLYS` array (currently lines 73–84) with this version that includes depth-based opacity (deeper z = lower opacity):

```ts
const POLYS: PolyProps[] = [
  { position: [-3.5,  1.5, -1.0], rotationZ: 0.3, scale: 0.9, sides: 3, speed:  0.040, drift: [0.30, 0.20], opacity: 0.20 },
  { position: [ 3.2, -1.0, -2.0], rotationZ: 1.1, scale: 1.4, sides: 3, speed: -0.030, drift: [0.20, 0.35], opacity: 0.12 },
  { position: [ 0.5,  2.5, -3.0], rotationZ: 0.7, scale: 0.7, sides: 4, speed:  0.025, drift: [0.15, 0.25], opacity: 0.08 },
  { position: [-4.5, -2.0, -2.0], rotationZ: 0.2, scale: 1.1, sides: 4, speed: -0.020, drift: [0.40, 0.20], opacity: 0.12 },
  { position: [ 4.8,  2.2, -1.5], rotationZ: 0.5, scale: 0.6, sides: 6, speed:  0.035, drift: [0.25, 0.30], opacity: 0.15 },
  { position: [-1.5, -2.8, -1.0], rotationZ: 1.4, scale: 0.8, sides: 6, speed: -0.040, drift: [0.35, 0.15], opacity: 0.22 },
  { position: [ 2.0,  0.8, -3.5], rotationZ: 0.9, scale: 1.6, sides: 3, speed:  0.015, drift: [0.20, 0.40], opacity: 0.08 },
  { position: [-2.8,  3.2, -2.5], rotationZ: 0.1, scale: 0.5, sides: 4, speed:  0.050, drift: [0.30, 0.20], opacity: 0.10 },
  { position: [ 5.5, -0.5, -2.0], rotationZ: 0.6, scale: 0.9, sides: 3, speed: -0.025, drift: [0.20, 0.30], opacity: 0.14 },
  { position: [-5.0,  0.5, -3.0], rotationZ: 1.8, scale: 1.2, sides: 6, speed:  0.020, drift: [0.15, 0.35], opacity: 0.08 },
]
```

- [ ] **Step 3: Add pixelRatio cap to the `<Canvas>` element**

Find the `<Canvas>` element in `HeroCanvas` (currently line 90) and update the `gl` prop:

```tsx
<Canvas
  camera={{ position: [0, 0, 6], fov: 60 }}
  gl={{ antialias: true, alpha: true, pixelRatio: Math.min(window.devicePixelRatio, 2) }}
  style={{ background: 'transparent' }}
>
```

- [ ] **Step 4: Run build to verify no TypeScript errors**

```bash
cd C:/Users/rplap/OneDrive/Desktop/personal/portfolio && npm run build
```

Expected: clean build. TypeScript will error if `opacity` is missing from any POLYS entry.

---

## Task 2: Upgrade the Polygon component with entrance animation

**Files:**
- Modify: `src/components/HeroCanvas.tsx`

This task rewrites the `Polygon` component to add a `materialRef`, accept `entranceDelay`, and fire a GSAP entrance animation on mount.

- [ ] **Step 1: Add the `gsap` import**

At the top of `HeroCanvas.tsx`, add alongside the existing imports:

```ts
import gsap from 'gsap'
```

- [ ] **Step 2: Replace the `Polygon` function signature and add refs**

Find the `Polygon` function. Update its signature to accept `opacity` and `entranceDelay`, and add a `materialRef`:

```tsx
function Polygon({ position, rotationZ, scale, sides, speed, drift, opacity, entranceDelay }: PolyProps & { entranceDelay: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const materialRef = useRef<THREE.LineBasicMaterial>(null)
  const timeOffset = useMemo(() => Math.random() * Math.PI * 2, [])
```

- [ ] **Step 3: Add the entrance animation `useEffect`**

Add this `useEffect` inside `Polygon`, after the existing `useFrame`:

```ts
useEffect(() => {
  if (!materialRef.current || !groupRef.current) return
  const mat = materialRef.current
  const group = groupRef.current
  const targetZ = position[2]

  // Start offset below the target z position
  group.position.z = targetZ - 2

  const delay = 0.3 + entranceDelay

  // Animate opacity: 0 → target
  gsap.fromTo(mat,
    { opacity: 0 },
    { opacity, duration: 1.4, delay, ease: 'power3.out' }
  )

  // Animate z-rise: targetZ - 2 → targetZ
  gsap.fromTo(group.position,
    { z: targetZ - 2 },
    { z: targetZ, duration: 1.4, delay, ease: 'power3.out' }
  )
}, []) // eslint-disable-line react-hooks/exhaustive-deps
// Empty array is intentional — entrance fires once on mount only.
// position, opacity, entranceDelay are stable for the component's lifetime.
```

- [ ] **Step 4: Update the `<lineBasicMaterial>` JSX**

Replace the existing `<lineBasicMaterial>` in the `Polygon` return with one that uses `ref`, `transparent={true}`, and starts at `opacity={0}`:

```tsx
<lineBasicMaterial ref={materialRef} color={tokens.three.amber} transparent={true} opacity={0} />
```

- [ ] **Step 5: Update HeroCanvas to pass `entranceDelay` to each Polygon**

Find the `POLYS.map(...)` render in `HeroCanvas` and add `entranceDelay`:

```tsx
{POLYS.map((p, i) => <Polygon key={i} {...p} entranceDelay={i * 0.08} />)}
```

- [ ] **Step 6: Run build and verify**

```bash
npm run build
```

Expected: clean build. No TypeScript errors.

- [ ] **Step 7: Verify entrance animation in dev server**

```bash
npm run dev
```

Open `http://localhost:5173`. Hard-refresh (`Ctrl+Shift+R`) and watch the hero:
- [ ] Polygons start invisible
- [ ] They fade in and rise into place over ~1.4s, staggered (first polygon at 0.3s, last at ~1.0s)
- [ ] After entrance, the drift animation runs normally
- [ ] Deeper (smaller, more distant) polygons are more transparent than closer ones

---

## Task 3: Add ambient glow

**Files:**
- Modify: `src/index.css`
- Modify: `src/components/HeroCanvas.tsx`

- [ ] **Step 1: Add `.hero-glow` CSS rule to `index.css`**

Append after the `.reveal-target` rule:

```css
.hero-glow {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: radial-gradient(
    ellipse 60% 40% at 30% 60%,
    oklch(72% 0.16 78 / 0.06) 0%,
    transparent 70%
  );
  pointer-events: none;
}
```

- [ ] **Step 2: Add the glow div inside the HeroCanvas wrapper**

Find the `HeroCanvas` return (currently `<div style={{ position: 'absolute', inset: 0 }} aria-hidden="true">`). Add `.hero-glow` as the first child, before `<Canvas>`:

```tsx
export function HeroCanvas() {
  return (
    <div style={{ position: 'absolute', inset: 0 }} aria-hidden="true">
      <div className="hero-glow" />
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        gl={{ antialias: true, alpha: true, pixelRatio: Math.min(window.devicePixelRatio, 2) }}
        style={{ background: 'transparent' }}
      >
        <ParallaxCamera />
        {POLYS.map((p, i) => <Polygon key={i} {...p} entranceDelay={i * 0.08} />)}
      </Canvas>
    </div>
  )
}
```

- [ ] **Step 3: Final build and visual check**

```bash
npm run build && npm run preview
```

Open `http://localhost:4173`. Verify:
- [ ] A warm amber radial glow is visible in the lower-left area of the hero (subtle — 6% opacity)
- [ ] The glow is behind the polygons and does not block mouse interaction
- [ ] Hard-refresh: polygons entrance animation still fires cleanly
- [ ] No console errors
