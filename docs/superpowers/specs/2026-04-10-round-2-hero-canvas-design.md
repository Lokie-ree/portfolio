# Round 2 — Hero Canvas Upgrade Design

**Status:** Approved  
**Source spec:** `docs/CREATIVE_DIRECTION.md § Hero Canvas — Revised Spec` and `§ Ambient Glow`  
**Build order ref:** `docs/BUILD_ORDER.md Round 2`

---

## Goal

Upgrade `HeroCanvas.tsx` with four improvements: a pixelRatio performance cap, depth-based polygon opacity, a staggered entrance animation, and a CSS ambient glow behind the canvas.

---

## Files Touched

| File | Change |
|------|--------|
| `src/components/HeroCanvas.tsx` | All four changes |
| `src/index.css` | Add `.hero-glow` rule |

No other files need modification. `App.tsx` already positions `HeroCanvas` absolutely within the hero div.

---

## Change 1 — pixelRatio Cap

On the `<Canvas>` element, add `pixelRatio: Math.min(window.devicePixelRatio, 2)` to the `gl` prop.

```tsx
<Canvas
  camera={{ position: [0, 0, 6], fov: 60 }}
  gl={{ antialias: true, alpha: true, pixelRatio: Math.min(window.devicePixelRatio, 2) }}
  style={{ background: 'transparent' }}
>
```

---

## Change 2 — Depth-Based Opacity

Add `opacity: number` to the `PolyProps` interface:

```ts
interface PolyProps {
  position: [number, number, number]
  rotationZ: number
  scale: number
  sides: number
  speed: number
  drift: [number, number]
  opacity: number   // ← new
}
```

Add `opacity` to the `POLYS` config array. `Polygon` receives it as a prop and passes it to `<lineBasicMaterial>`. It also becomes the GSAP entrance target.

Updated `POLYS` array with assigned opacity values (based on z-depth: shallow z > -1.5 → 0.18–0.22, mid -1.5 to -2.5 → 0.12–0.15, deep z < -2.5 → 0.08–0.10):

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

---

## Change 3 — Entrance Animation (Self-Contained per Polygon)

### Interface changes

`Polygon` currently accepts `PolyProps`. Add `entranceDelay` as an additional prop by extending the type inline:

```ts
function Polygon({ position, rotationZ, scale, sides, speed, drift, opacity, entranceDelay }: PolyProps & { entranceDelay: number }) {
```

- `opacity` comes from `PolyProps` (already in the config array)
- `entranceDelay` is computed at render as `i * 0.08` and **not** stored in the config array

### GSAP import

Add to the top of `HeroCanvas.tsx` (alongside the existing `tokens` import):

```ts
import gsap from 'gsap'
```

### Implementation inside `Polygon`

1. Add `materialRef = useRef<THREE.LineBasicMaterial>(null)` 
2. Attach to `<lineBasicMaterial ref={materialRef} ... opacity={0} />` — starts invisible
Note: the `<lineBasicMaterial>` must have `transparent={true}` for opacity animation to work. Start it at `opacity={0}`:

```tsx
<lineBasicMaterial ref={materialRef} color={tokens.three.amber} transparent={true} opacity={0} />
```

3. `useEffect` runs once after mount:

```ts
useEffect(() => {
  if (!materialRef.current || !groupRef.current) return
  const mat = materialRef.current
  const group = groupRef.current
  const targetZ = position[2]

  // Start z offset
  group.position.z = targetZ - 2

  const delay = 0.3 + entranceDelay

  gsap.fromTo(mat, { opacity: 0 }, {
    opacity,
    duration: 1.4,
    delay,
    ease: 'power3.out',
  })

  gsap.fromTo(group.position, { z: targetZ - 2 }, {
    z: targetZ,
    duration: 1.4,
    delay,
    ease: 'power3.out',
  })
}, []) // eslint-disable-line react-hooks/exhaustive-deps
```

### HeroCanvas changes

Pass `opacity` and `entranceDelay` when rendering polygons:

```tsx
{POLYS.map((p, i) => (
  <Polygon key={i} {...p} entranceDelay={i * 0.08} />
))}
```

---

## Change 4 — Ambient Glow

### In `index.css`

Add after `.reveal-target`:

```css
.hero-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse 60% 40% at 30% 60%,
    oklch(72% 0.16 78 / 0.06) 0%,
    transparent 70%
  );
  pointer-events: none;
  z-index: 0;
}
```

### In `HeroCanvas.tsx`

The wrapper div becomes:

```tsx
<div style={{ position: 'absolute', inset: 0 }} aria-hidden="true">
  <div className="hero-glow" />
  <Canvas ...>
    ...
  </Canvas>
</div>
```

The glow div sits behind the canvas in DOM order. The canvas has `background: transparent` so the glow shows through.

---

## Constraints

- `useFrame` drift loop modifies only `position.x` and `position.y` — no conflict with the z entrance animation
- `lineBasicMaterial` requires `transparent={true}` for opacity to work
- Empty `useEffect` dependency array is intentional — entrance fires once on mount only
- No z-fighting: the glow is CSS, not a Three.js element
