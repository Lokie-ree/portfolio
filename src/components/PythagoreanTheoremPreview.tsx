import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { tokens } from '@/tokens'
import { usePauseSafeElapsed } from '@/hooks/usePauseSafeElapsed'

// Right triangle: right angle at O, horizontal leg a=0.4, vertical leg b=0.3, hypotenuse c=0.5
const Ox = -0.2, Oy = -0.15
const Ax =  0.2, Ay = -0.15   // O + (0.4, 0)
const Bx = -0.2, By =  0.15   // O + (0, 0.3)

const TRI = new Float32Array([Ox, Oy, 0,  Ax, Ay, 0,  Bx, By, 0,  Ox, Oy, 0])

const RA = new Float32Array([
  Ox + 0.06, Oy, 0,
  Ox + 0.06, Oy + 0.06, 0,
  Ox, Oy + 0.06, 0,
])

const SQ_A = new Float32Array([
  Ox, Oy, 0,   Ax, Ay, 0,   Ax, Ay - 0.4, 0,   Ox, Oy - 0.4, 0,   Ox, Oy, 0,
])

const SQ_B = new Float32Array([
  Ox, Oy, 0,   Bx, By, 0,   Bx - 0.3, By, 0,   Ox - 0.3, Oy, 0,   Ox, Oy, 0,
])

const SQ_C = new Float32Array([
  Ax, Ay, 0,
  Bx, By, 0,
  Bx + 0.3, By + 0.4, 0,
  Ax + 0.3, Ay + 0.4, 0,
  Ax, Ay, 0,
])

// ── Animation cycle (~5.5s) ─────────────────────────────────────────────────

const INTRO   = 0.4
const SNAP    = 0.25
const GAP     = 0.35
const HOLD    = 1.5
const RESET   = 0.4

const T_A = INTRO
const T_B = T_A + SNAP + GAP
const T_C = T_B + SNAP + GAP
const T_HOLD_END = T_C + SNAP + HOLD
const CYCLE = T_HOLD_END + RESET

function easeOutBack(t: number): number {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

function easeInCubic(t: number): number {
  return t * t * t
}

/** 0 before start, 1 after start+dur, easeOutBack snap in between */
function snapIn(elapsed: number, start: number, dur: number): number {
  if (elapsed < start) return 0
  if (elapsed >= start + dur) return 1
  return easeOutBack((elapsed - start) / dur)
}

/** 1 before start, 0 after start+dur, easeInCubic scale-out */
function snapOut(elapsed: number, start: number, dur: number): number {
  if (elapsed < start) return 1
  if (elapsed >= start + dur) return 0
  return 1 - easeInCubic((elapsed - start) / dur)
}

function squareScale(elapsed: number, snapStart: number): number {
  const t = elapsed % CYCLE
  const inT = snapIn(t, snapStart, SNAP)
  const outT = snapOut(t, T_HOLD_END, RESET)
  return inT * outT
}

function makeLabel(text: string, color: string): THREE.Sprite {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')!
  ctx.font = 'bold 64px sans-serif'
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 64, 64)
  const texture = new THREE.CanvasTexture(canvas)
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true })
  return new THREE.Sprite(material)
}

function Scene({ paused }: { paused: boolean }) {
  const groupA = useRef<THREE.Group>(null)
  const groupB = useRef<THREE.Group>(null)
  const groupC = useRef<THREE.Group>(null)
  const { advance } = usePauseSafeElapsed(paused)

  const labelA = useMemo(() => makeLabel('a²', '#7a7268'), [])
  const labelB = useMemo(() => makeLabel('b²', '#7a7268'), [])
  const labelC = useMemo(() => makeLabel('c²', '#d4962a'), [])

  useFrame(({ clock }) => {
    const elapsed = advance(clock.getElapsedTime())
    if (paused) return

    const sA = squareScale(elapsed, T_A)
    const sB = squareScale(elapsed, T_B)
    const sC = squareScale(elapsed, T_C)

    if (groupA.current) groupA.current.scale.setScalar(sA)
    if (groupB.current) groupB.current.scale.setScalar(sB)
    if (groupC.current) groupC.current.scale.setScalar(sC)
  })

  return (
    <group>
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

      {/* a² square + label */}
      <group ref={groupA} scale={[0, 0, 0]}>
        <line>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[SQ_A, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color={tokens.three.ink} transparent opacity={0.35} />
        </line>
        <primitive object={labelA} position={[0, -0.35, 0.01]} scale={[0.18, 0.18, 0.18]} />
      </group>

      {/* b² square + label */}
      <group ref={groupB} scale={[0, 0, 0]}>
        <line>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[SQ_B, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color={tokens.three.ink} transparent opacity={0.35} />
        </line>
        <primitive object={labelB} position={[-0.35, 0, 0.01]} scale={[0.18, 0.18, 0.18]} />
      </group>

      {/* c² square + label (amber) */}
      <group ref={groupC} scale={[0, 0, 0]}>
        <line>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[SQ_C, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color={tokens.three.amber} transparent opacity={0.75} />
        </line>
        <primitive object={labelC} position={[0.15, 0.2, 0.01]} scale={[0.18, 0.18, 0.18]} />
      </group>
    </group>
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
