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

The cube is a unit cube centered at the origin (vertices at ±0.5 on each axis). All intersection math is computed in the cube's **local space** — the local cube is always axis-aligned regardless of visual rotation (see Scene Group Architecture below).

The plane equation is `x + y + z = k`. As `k` sweeps from −0.75 to +0.75, the cross-section evolves:

```
k = −0.75  →  small triangle (near vertex [−0.5,−0.5,−0.5])
k =  0      →  regular hexagon (midpoints of all 6 cut edges)
k = +0.75  →  small triangle (near vertex [+0.5,+0.5,+0.5])
```

### Scene Group Architecture

**All scene objects — cube edges, cutting plane, cross-section polygon, vertex dots — are children of a single wrapper `<group ref={groupRef}>`.** The visual rotation is applied to `groupRef.current.rotation` in `useFrame`:

```ts
groupRef.current.rotation.y += 0.004
groupRef.current.rotation.x = Math.sin(t * 0.12) * 0.15
```

Because the group's children stay in a fixed local frame (unit cube at origin), the intersection math (`x + y + z = k`) remains geometrically correct at all times. The group's world transform handles all visual rotation. Do not rotate the cube independently of the plane or polygon geometry.

The `planeGroup` with the cutting plane's fixed tilt (`[-Math.acos(1/Math.sqrt(3)), Math.PI/4, 0]`) is a child of `groupRef`, not a sibling. The cross-section polygon and vertex dots are also children of `groupRef` at the top level (not inside `planeGroup`), so their positions are in the same local coordinate space as the cube edges.

### Intersection Computation (runs in `useFrame`)

The 12 cube edges are stored as a module-level constant — an array of `[A, B]` `THREE.Vector3` pairs defining each edge of a unit cube at origin. This array is never recreated.

For each edge, parameterize as `P(t) = A + t*(B−A)`, `t ∈ (0, 1)` **open interval** to avoid double-counting shared vertices at cube corners:

```ts
const denom = (B.x - A.x) + (B.y - A.y) + (B.z - A.z)
if (Math.abs(denom) < 1e-10) continue  // edge parallel to plane
const t = (k - (A.x + A.y + A.z)) / denom
if (t > 1e-10 && t < 1 - 1e-10) {        // open interval — avoids corner double-count
  pts.push(A.clone().lerp(B, t))
  intersectedEdgeIndices.add(edgeIndex)
}
```

Using a strict open interval (`> 1e-10`, `< 1 - 1e-10`) ensures that cube corners — where three edges meet at a single point — are only counted once (by none of the three edges, which each would produce `t=0` or `t=1`). At extreme `k` values the polygon degenerates to a point; fewer than 3 intersection points means no polygon is drawn.

After collecting intersection points, sort them as a convex polygon:
1. Compute centroid of all points
2. Project onto the cutting plane using these two fixed orthonormal basis vectors:
   - `u = normalize(new THREE.Vector3(1, -1, 0))` → `[0.7071, -0.7071, 0]`
   - `v = normalize(new THREE.Vector3(1,  1, -2))` → `[0.4082, 0.4082, -0.8165]`
3. For each point `p`, compute `pu = dot(p - centroid, u)` and `pv = dot(p - centroid, v)`, then angle = `Math.atan2(pv, pu)`
4. Sort points by ascending angle
5. Use sorted order to build/update the `BufferGeometry` for the outline and fill

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

**Cube edges:**
- The existing `<lineSegments geometry={cubeEdges}>` + `EdgesGeometry` is **removed entirely**.
- Replace with 12 individual `<line>` primitives, one per cube edge, each with its own `lineBasicMaterial` ref.
- This allows per-edge color: intersected edges use `tokens.three.amber` opacity 0.8, all others use `tokens.three.ink` opacity 0.35.
- All 12 `<line>` elements and their material refs are allocated once; only `color` and `opacity` are mutated in `useFrame`.
- Visual rotation is handled by the parent `groupRef` — individual edge meshes are never rotated directly.

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

- All geometry objects are allocated once and mutated in `useFrame` — no geometry recreation per frame
- **Outline line loop:** pre-allocate `Float32Array(21)` — max 6 points + 1 closing repeat, 3 floats each: (6+1)×3=21. Write sorted points into the array each frame, then set `attribute.needsUpdate = true` on the position `bufferAttribute` so Three.js re-uploads to the GPU. Update `bufferAttribute.count` to `n + 1` (n points plus the closing repeat).
- **Fill mesh:** pre-allocate `Float32Array(36)` — max fan is 4 triangles × 3 vertices × 3 floats = 36. Fan formula: for `n` perimeter points, `(n-2)` triangles. Write the triangle-fan positions into the array, set `attribute.needsUpdate = true`, and update `geometry.setDrawRange(0, (n-2)*3)` each frame.
- **Vertex dots:** pre-allocate 6 `THREE.Mesh` instances with `SphereGeometry(0.025)`, each with its own `MeshBasicMaterial({ color: tokens.three.amber, transparent: true })` set at construction. In `useFrame`, toggle `.visible`, set `.position` from the intersection points, and set `.material.opacity` directly (1.0 during hold phase, 0.5 during sweep). Never create new material instances in `useFrame`.
- **Edge constant:** the 12 `[A, B]` pairs are a module-level `const CUBE_EDGES` — `THREE.Vector3` pairs, never recreated.
- **`paused` behavior:** when `paused` is true, `useFrame` returns early — the animation cycle freezes at its current `k` value and the polygon holds whatever shape it was at. This is correct (the viewer sees the frozen geometry, not a blank canvas). No special handling needed for the hold phase.

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

Follows the same `useEffect`-only pattern as `useProofBlockReveal` — `gsap.set` and `ScrollTrigger.create` both live in a single `useEffect`. Do **not** use `useLayoutEffect` here; ScrollTrigger measurements must wait until after the browser has painted and laid out sections below.

```ts
export function useActBreakReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
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
        once: true,                          // fires only on first entry — no flash on scroll-up/re-enter
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
