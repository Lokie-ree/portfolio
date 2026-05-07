# Act Break + Live Demo Elevation — Design Spec
**Date:** 2026-05-07
**Status:** Approved for implementation

---

## Scope

Three coordinated changes that complete the two-act page structure:

1. **Section reorder** — `LiveDemoSection` moves before `WorkSection`
2. **`CrossSectionPreview` overhaul** — live intersection geometry, orchestrated reveal cycle
3. **`ActBreakSection`** — typographic beat between Act 1 and Act 2

---

## 1. Section Reorder

`LiveDemoSection` becomes the first section the visitor reaches after the hero, before `WorkSection`. The two-act structure:

```
ACT 1 — EXPERIENCE
  Hero
  LiveDemoSection   ← first section after hero
  WorkSection

  ── act break ──

ACT 2 — UNDERSTAND
  SystemSection
  AboutSection
  PelicanSection
  ISTESection
  ContactSection
  Footer
```

**Implementation:** Swap the render order of `<LiveDemoSection />` and `<WorkSection />` in the `App` component's JSX. No other changes to either component.

---

## 2. CrossSectionPreview Overhaul

Complete rewrite of `src/components/CrossSectionPreview.tsx`. The existing pre-baked hexagon is replaced with live intersection geometry computed every frame.

### The Math

The cube is a unit cube centered at the origin (vertices at ±0.5 on each axis). The cutting plane is kept perpendicular to the cube's main diagonal — the existing rotation `[-Math.acos(1/Math.sqrt(3)), Math.PI/4, 0]` is correct and unchanged.

The plane equation is `x + y + z = k`. As `k` sweeps from −0.75 to +0.75, the cross-section evolves:

```
k = −0.75  →  small triangle (near vertex [−0.5,−0.5,−0.5])
k =  0      →  regular hexagon (midpoints of all 6 cut edges)
k = +0.75  →  small triangle (near vertex [+0.5,+0.5,+0.5])
```

### Intersection Computation (runs in `useFrame`)

For each of the 12 cube edges, parameterize as `P(t) = A + t*(B−A)`, `t ∈ [0,1]`:

```ts
const denom = (B.x - A.x) + (B.y - A.y) + (B.z - A.z)
if (Math.abs(denom) < 1e-10) continue  // edge parallel to plane
const t = (k - (A.x + A.y + A.z)) / denom
if (t >= 0 && t <= 1) {
  intersectionPoints.push(A.clone().lerp(B, t))
  intersectedEdgeIndices.add(edgeIndex)
}
```

After collecting intersection points, sort them as a convex polygon:
1. Compute centroid of all points
2. Project onto the cutting plane using two orthogonal basis vectors perpendicular to `[1,1,1]/√3`
3. Sort by `atan2` of the projected 2D coordinates
4. Use sorted order to build the `BufferGeometry` for the outline and fill

### Animation Cycle

Controlled by a single time parameter in `useFrame`. Total cycle: ~6 seconds.

| Phase | Duration | k value | What's visible |
|-------|----------|---------|----------------|
| Sweep in | 2s | −0.75 → 0 | Triangle grows into hexagon |
| **Hold** | **1.5s** | **0** | **Hexagon — amber dots glowing, fill visible** |
| Sweep out | 2s | 0 → +0.75 | Hexagon shrinks to triangle |
| Reset pause | 0.5s | +0.75 | Brief hold before next cycle |

Use a custom easing for the sweep phases — `easeInOutSine` feels natural for a physical plane moving through space. The hold is a hard pause (k clamped to 0).

### What's Rendered

**Cube:**
- `EdgesGeometry` on a `BoxGeometry(1,1,1)` — unchanged concept, but with slow rotation
- Rotation: `mesh.rotation.y += 0.004` per frame; `mesh.rotation.x = Math.sin(t * 0.12) * 0.15` (gentle wobble)
- Color: `tokens.three.ink`, opacity 0.45

**Intersected edge highlights:**
- Re-render the 12 edges individually as `<line>` segments
- Edges currently intersected by the plane: `tokens.three.amber`, opacity 0.8
- All other edges: `tokens.three.ink`, opacity 0.35

**Cross-section fill:**
- `THREE.BufferGeometry` built from the sorted intersection polygon (triangle fan from centroid)
- `meshBasicMaterial`, color `tokens.three.amber`, opacity 0.1, `DoubleSide`

**Cross-section outline:**
- Closed `<line>` loop through sorted intersection points
- `lineBasicMaterial`, color `tokens.three.amber`, opacity 0.85

**Vertex dots:**
- One `THREE.Mesh` with `SphereGeometry(0.025)` per intersection point (max 6)
- `meshBasicMaterial`, color `tokens.three.amber`
- At the hold phase: opacity 1.0. During sweep: opacity 0.5.

**Camera:**
- Position: `[1.5, 1.2, 2.2]`, fov: 38
- More dramatic perspective than the current head-on view — cube reads as clearly 3D

### Implementation notes

- All geometry objects (sphere, line buffer) are allocated once in `useMemo` / component init and mutated in `useFrame` — no geometry recreation per frame
- Max 6 intersection points — pre-allocate `Float32Array(18)` for the line loop positions, update in place
- Pre-allocate up to 6 sphere meshes, toggle `visible` based on intersection count
- The 12 cube edges can be stored as a constant array of `[A, B]` vertex pairs and referenced by index

---

## 3. ActBreakSection

New component added to `App.tsx` between `WorkSection` and `SystemSection`.

### Visual

```
                    [padding: py-20]

        "Now you know what it feels like.
              Here's how it works."

                    ────────
                  [40px rule]

                    [padding: py-20]
```

- Font: Fraunces, `font-weight: 300`, italic
- Color: `--color-amber`
- Size: `clamp(20px, 3vw, 28px)`
- Alignment: `text-center`
- Rule: `width: 40px`, `height: 1px`, `background: var(--color-rule)`, `margin: 0 auto`
- No section label. No border. No `sectionClass`.

**Copy (working placeholder):** *"Now you know what it feels like. Here's how it works."*
Final copy is a manual human task before deploy.

### Animation — `useActBreakReveal` hook

New hook in `src/hooks/useScrollReveal.ts`. Does **not** extend `useScrollReveal` — the delay behavior is semantically different.

```ts
export function useActBreakReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const text = el.querySelector('.act-break-text')
    const rule = el.querySelector('.act-break-rule')

    const ctx = gsap.context(() => {
      gsap.set([text, rule], { opacity: 0 })
      gsap.set(text, { y: 20 })

      ScrollTrigger.create({
        trigger: el,
        start: 'top 80%',
        onEnter: () => {
          gsap.to(text, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.6 })
          gsap.to(rule, { opacity: 1, duration: 0.3, delay: 1.0 })
        },
      })
    }, el)

    return () => ctx.revert()
  }, [])

  return ref
}
```

The 0.6s delay on the text is the beat of silence — it confirms what the visitor already feels rather than announcing it. The rule fades in 0.3s after the text lands (delay 1.0s = 0.6 + 0.7 × ~0.5 + 0.3 margin).

### JSX

```tsx
function ActBreakSection() {
  const ref = useActBreakReveal<HTMLDivElement>()
  return (
    <div ref={ref} className="py-20 text-center">
      <p
        className="act-break-text font-display font-light italic text-amber"
        style={{ fontSize: 'clamp(20px, 3vw, 28px)' }}
      >
        Now you know what it feels like. Here's how it works.
      </p>
      <div className="act-break-rule mt-8 h-px w-10 bg-rule mx-auto" />
    </div>
  )
}
```

---

## What Does Not Change

- `LiveDemoSection` layout (side-by-side card) is unchanged — the improvement is the preview quality, not the card chrome
- `useScrollReveal`, `useNavReveal`, and all other hooks are unchanged except for the addition of `useActBreakReveal`
- `sectionClass` is not applied to `ActBreakSection` — no border, no standard padding
- The existing `CrossSectionPreview` `paused` prop interface is preserved
