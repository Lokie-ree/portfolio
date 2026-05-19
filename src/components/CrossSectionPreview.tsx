import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { tokens } from '@/tokens'
import { usePauseSafeElapsed } from '@/hooks/usePauseSafeElapsed'

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

// Scratch pool for computeIntersection — allocated once, reused each frame
const _scratchPoints: THREE.Vector3[] = Array.from({ length: 6 }, () => new THREE.Vector3())
const _scratchEdgeSet = new Set<number>()
const _scratchCentroid = new THREE.Vector3()
const _scratchDa = new THREE.Vector3()
const _scratchDb = new THREE.Vector3()
const _angles: number[] = [0, 0, 0, 0, 0, 0]

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
  const u = (t - SWEEP_IN - HOLD - SWEEP_OUT) / PAUSE
  return { k: 0.75 - 1.5 * easeInOutSine(u), holding: false }
}

// ── Intersection math ───────────────────────────────────────────────────────

/**
 * Compute where the plane x+y+z=k intersects the 12 cube edges.
 * Uses open interval (t > ε, t < 1-ε) to avoid double-counting shared corners.
 * Results are written into module-level scratch buffers (_scratchPoints, _scratchCentroid).
 * Returns count of intersection points and the set of intersected edge indices.
 */
function computeIntersection(k: number): {
  count: number
  edgeIndices: Set<number>
} {
  _scratchEdgeSet.clear()
  let count = 0
  const EPS = 1e-10

  for (let i = 0; i < CUBE_EDGES.length; i++) {
    const [A, B] = CUBE_EDGES[i]
    const denom = (B.x - A.x) + (B.y - A.y) + (B.z - A.z)
    if (Math.abs(denom) < EPS) continue
    const t = (k - (A.x + A.y + A.z)) / denom
    if (t > EPS && t < 1 - EPS) {
      _scratchPoints[count].set(
        A.x + t * (B.x - A.x),
        A.y + t * (B.y - A.y),
        A.z + t * (B.z - A.z),
      )
      _scratchEdgeSet.add(i)
      count++
    }
  }

  if (count >= 3) {
    // Compute centroid
    _scratchCentroid.set(0, 0, 0)
    for (let i = 0; i < count; i++) _scratchCentroid.add(_scratchPoints[i])
    _scratchCentroid.divideScalar(count)

    // Compute angle for each point
    for (let i = 0; i < count; i++) {
      _scratchDa.copy(_scratchPoints[i]).sub(_scratchCentroid)
      _angles[i] = Math.atan2(_scratchDa.dot(BASIS_V), _scratchDa.dot(BASIS_U))
    }

    // Insertion sort by angle (avoids Array.sort overhead for 3-6 elements)
    for (let i = 1; i < count; i++) {
      const keyAngle = _angles[i]
      _scratchDb.copy(_scratchPoints[i])
      let j = i - 1
      while (j >= 0 && _angles[j] > keyAngle) {
        _angles[j + 1] = _angles[j]
        _scratchPoints[j + 1].copy(_scratchPoints[j])
        j--
      }
      _angles[j + 1] = keyAngle
      _scratchPoints[j + 1].copy(_scratchDb)
    }
  }

  return { count, edgeIndices: _scratchEdgeSet }
}

// ── Per-instance Three.js objects ───────────────────────────────────────────
// Created outside React hooks so they are mutable without lint violations.

function createSceneObjects() {
  // 12 cube edges with individual materials for color highlight
  const edgeMats = EDGE_GEOMETRIES.map(
    () => new THREE.LineBasicMaterial({ color: tokens.three.ink, transparent: true, opacity: 0.35 })
  )
  const edgeLines = EDGE_GEOMETRIES.map(
    (geo, i) => new THREE.Line(geo, edgeMats[i])
  )

  // Cross-section outline — dynamic buffer
  const outlinePos = new Float32Array(21)
  const outlineAttr = new THREE.BufferAttribute(outlinePos, 3)
  outlineAttr.setUsage(THREE.DynamicDrawUsage)
  const outlineGeo = new THREE.BufferGeometry()
  outlineGeo.setAttribute('position', outlineAttr)
  outlineGeo.setDrawRange(0, 0)
  const outlineMat = new THREE.LineBasicMaterial({ color: tokens.three.amber, transparent: true, opacity: 0.85 })
  const outlineLine = new THREE.Line(outlineGeo, outlineMat)

  // Cross-section fill — dynamic buffer
  const fillPos = new Float32Array(36)
  const fillAttr = new THREE.BufferAttribute(fillPos, 3)
  fillAttr.setUsage(THREE.DynamicDrawUsage)
  const fillGeo = new THREE.BufferGeometry()
  fillGeo.setAttribute('position', fillAttr)
  fillGeo.setDrawRange(0, 0)
  const fillMat = new THREE.MeshBasicMaterial({ color: tokens.three.amber, transparent: true, opacity: 0.1, side: THREE.DoubleSide })
  const fillMesh = new THREE.Mesh(fillGeo, fillMat)

  // Vertex dot geometry (shared, positions set per-dot via mesh refs)
  const dotGeo = new THREE.SphereGeometry(0.025, 8, 8)

  return { edgeMats, edgeLines, outlinePos, outlineGeo, outlineMat, outlineLine, fillPos, fillGeo, fillMesh, dotGeo }
}

// ── Scene ───────────────────────────────────────────────────────────────────

function Scene({ paused }: { paused: boolean }) {
  const groupRef = useRef<THREE.Group>(null)

  // All mutable Three.js objects created once per component instance
  // eslint-disable-next-line react-hooks/use-memo
  const obj = useMemo(createSceneObjects, [])

  // Vertex dots: 6 pre-allocated mesh refs
  const dotRefs = useRef<(THREE.Mesh | null)[]>(Array(6).fill(null))

  const { advance } = usePauseSafeElapsed(paused)

  useFrame(({ clock }) => {
    const elapsed = advance(clock.getElapsedTime())

    if (paused || !groupRef.current) return

    // Rotate entire group — intersection math stays in local space
    groupRef.current.rotation.y += 0.004
    groupRef.current.rotation.x = Math.sin(elapsed * 0.12) * 0.15

    const { k, holding } = computeK(elapsed)
    const { count, edgeIndices } = computeIntersection(k)
    const n = count

    // Update edge highlight colors
    for (let i = 0; i < 12; i++) {
      if (edgeIndices.has(i)) {
        obj.edgeMats[i].color.setHex(tokens.three.amber)
        obj.edgeMats[i].opacity = 0.8
      } else {
        obj.edgeMats[i].color.setHex(tokens.three.ink)
        obj.edgeMats[i].opacity = 0.35
      }
    }

    if (n < 3) {
      obj.outlineGeo.setDrawRange(0, 0)
      obj.fillGeo.setDrawRange(0, 0)
      for (let i = 0; i < dotRefs.current.length; i++) {
        const d = dotRefs.current[i]
        if (d) d.visible = false
      }
      return
    }

    // Outline: write n points + closing repeat
    for (let i = 0; i < n; i++) {
      obj.outlinePos[i * 3]     = _scratchPoints[i].x
      obj.outlinePos[i * 3 + 1] = _scratchPoints[i].y
      obj.outlinePos[i * 3 + 2] = _scratchPoints[i].z
    }
    obj.outlinePos[n * 3]     = _scratchPoints[0].x
    obj.outlinePos[n * 3 + 1] = _scratchPoints[0].y
    obj.outlinePos[n * 3 + 2] = _scratchPoints[0].z
    ;(obj.outlineGeo.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true
    obj.outlineGeo.setDrawRange(0, n + 1)

    // Fill: triangle fan from p0 (n-2 triangles covers full convex polygon)
    let idx = 0
    for (let i = 1; i < n - 1; i++) {
      obj.fillPos[idx++] = _scratchPoints[0].x;         obj.fillPos[idx++] = _scratchPoints[0].y;         obj.fillPos[idx++] = _scratchPoints[0].z
      obj.fillPos[idx++] = _scratchPoints[i].x;         obj.fillPos[idx++] = _scratchPoints[i].y;         obj.fillPos[idx++] = _scratchPoints[i].z
      obj.fillPos[idx++] = _scratchPoints[i + 1].x;     obj.fillPos[idx++] = _scratchPoints[i + 1].y;     obj.fillPos[idx++] = _scratchPoints[i + 1].z
    }
    ;(obj.fillGeo.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true
    obj.fillGeo.setDrawRange(0, (n - 2) * 3)

    // Vertex dots
    const dotOpacity = holding ? 1.0 : 0.5
    for (let i = 0; i < 6; i++) {
      const dot = dotRefs.current[i]
      if (!dot) continue
      if (i < n) {
        dot.visible = true
        dot.position.copy(_scratchPoints[i])
        ;(dot.material as THREE.MeshBasicMaterial).opacity = dotOpacity
      } else {
        dot.visible = false
      }
    }

    // Outline opacity: slightly brighter during hold
    obj.outlineMat.opacity = holding ? 0.95 : 0.85
  })

  return (
    <group ref={groupRef}>
      {/* 12 individual cube edges — primitive THREE.Line objects with per-edge materials */}
      {obj.edgeLines.map((lineObj, i) => (
        <primitive key={i} object={lineObj} />
      ))}

      {/* Cross-section outline */}
      <primitive object={obj.outlineLine} />

      {/* Cross-section fill */}
      <primitive object={obj.fillMesh} />

      {/* 6 pre-allocated vertex dots */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh
          key={i}
          ref={(el: THREE.Mesh | null) => { dotRefs.current[i] = el }}
          geometry={obj.dotGeo}
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
