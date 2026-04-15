import { useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { tokens } from '@/tokens'

// Right triangle: right angle at O, horizontal leg a=0.4, vertical leg b=0.3, hypotenuse c=0.5
const Ox = -0.2, Oy = -0.15
const Ax =  0.2, Ay = -0.15   // O + (0.4, 0)
const Bx = -0.2, By =  0.15   // O + (0, 0.3)

// Triangle outline loop
const TRI = new Float32Array([Ox, Oy, 0,  Ax, Ay, 0,  Bx, By, 0,  Ox, Oy, 0])

// Right angle marker (L in corner, interior of triangle)
const RA = new Float32Array([
  Ox + 0.06, Oy, 0,
  Ox + 0.06, Oy + 0.06, 0,
  Ox, Oy + 0.06, 0,
])

// Square on leg a (extends downward, area = a² = 0.16)
const SQ_A = new Float32Array([
  Ox, Oy, 0,   Ax, Ay, 0,   Ax, Ay - 0.4, 0,   Ox, Oy - 0.4, 0,   Ox, Oy, 0,
])

// Square on leg b (extends leftward, area = b² = 0.09)
const SQ_B = new Float32Array([
  Ox, Oy, 0,   Bx, By, 0,   Bx - 0.3, By, 0,   Ox - 0.3, Oy, 0,   Ox, Oy, 0,
])

// Square on hypotenuse c (extends outward, area = c² = 0.25)
// AB direction: (-0.4, 0.3). Outward perpendicular (CW 90°): (0.3, 0.4)
const SQ_C = new Float32Array([
  Ax, Ay, 0,
  Bx, By, 0,
  Bx + 0.3, By + 0.4, 0,
  Ax + 0.3, Ay + 0.4, 0,
  Ax, Ay, 0,
])

function makeLine(pts: Float32Array, color: number, opacity: number) {
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pts.slice(), 3))
  const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity })
  return new THREE.Line(geo, mat)
}

function Scene({ paused }: { paused: boolean }) {
  // Imperative lines — avoids SVG/R3F <line> ref TS collision
  const sqA = useMemo(() => makeLine(SQ_A, tokens.three.ink as number, 0.35), [])
  const sqB = useMemo(() => makeLine(SQ_B, tokens.three.ink as number, 0.35), [])
  const sqC = useMemo(() => makeLine(SQ_C, tokens.three.amber as number, 0.62), [])

  useFrame(({ clock }) => {
    if (paused) return
    const t = clock.getElapsedTime()
    // a² and b² breathe together
    const legs = 0.35 + Math.sin(t * 0.85) * 0.25
    // c² follows with a phase offset — same rhythm, steadier presence
    const hyp = 0.62 + Math.sin(t * 0.85 + 1.2) * 0.13
    ;(sqA.material as THREE.LineBasicMaterial).opacity = legs
    ;(sqB.material as THREE.LineBasicMaterial).opacity = legs
    ;(sqC.material as THREE.LineBasicMaterial).opacity = hyp
  })

  return (
    <>
      {/* Triangle outline */}
      <line>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[TRI, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={tokens.three.ink} transparent opacity={0.65} />
      </line>

      {/* Right angle marker */}
      <line>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[RA, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={tokens.three.ink} transparent opacity={0.4} />
      </line>

      {/* Animated squares — a², b², c² */}
      <primitive object={sqA} />
      <primitive object={sqB} />
      <primitive object={sqC} />
    </>
  )
}

export function PythagoreanTheoremPreview({ paused }: { paused: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 2.5], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent', width: '100%', height: '100%' }}
    >
      <Scene paused={paused} />
    </Canvas>
  )
}
