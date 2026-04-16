import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { tokens } from '@/tokens'

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

// Square on leg a (extends downward)
const SQ_A = new Float32Array([
  Ox, Oy, 0,   Ax, Ay, 0,   Ax, Ay - 0.4, 0,   Ox, Oy - 0.4, 0,   Ox, Oy, 0,
])

// Square on leg b (extends leftward)
const SQ_B = new Float32Array([
  Ox, Oy, 0,   Bx, By, 0,   Bx - 0.3, By, 0,   Ox - 0.3, Oy, 0,   Ox, Oy, 0,
])

// Square on hypotenuse c (outward perpendicular CW 90°: (0.3, 0.4))
const SQ_C = new Float32Array([
  Ax, Ay, 0,
  Bx, By, 0,
  Bx + 0.3, By + 0.4, 0,
  Ax + 0.3, Ay + 0.4, 0,
  Ax, Ay, 0,
])

// Canvas texture sprite — lightweight alternative to troika-three-text
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
  const group = useRef<THREE.Group>(null)

  // Square centers: a²=(0,−0.35), b²=(−0.35,0), c²=(0.15,0.2)
  const labelA = useMemo(() => makeLabel('a²', '#7a7268'), [])
  const labelB = useMemo(() => makeLabel('b²', '#7a7268'), [])
  const labelC = useMemo(() => makeLabel('c²', '#d4962a'), [])

  useFrame(({ clock }) => {
    if (paused || !group.current) return
    const t = clock.getElapsedTime()
    const k = 1 + Math.sin(t * 0.85) * 0.12
    group.current.scale.setScalar(k)
  })

  return (
    <group ref={group}>
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

      {/* a² square (ink) */}
      <line>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[SQ_A, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={tokens.three.ink} transparent opacity={0.35} />
      </line>

      {/* b² square (ink) */}
      <line>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[SQ_B, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={tokens.three.ink} transparent opacity={0.35} />
      </line>

      {/* c² square (amber) */}
      <line>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[SQ_C, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={tokens.three.amber} transparent opacity={0.75} />
      </line>

      {/* Labels centered within each square */}
      <primitive object={labelA} position={[0, -0.35, 0.01]} scale={[0.18, 0.18, 0.18]} />
      <primitive object={labelB} position={[-0.35, 0, 0.01]} scale={[0.18, 0.18, 0.18]} />
      <primitive object={labelC} position={[0.15, 0.2, 0.01]} scale={[0.18, 0.18, 0.18]} />
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
