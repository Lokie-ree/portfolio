import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { tokens } from '@/tokens'
import { usePauseSafeElapsed } from '@/hooks/usePauseSafeElapsed'

const VERTS = [-0.4, -0.35, 0,  0.1, 0.45, 0,  0.45, -0.2, 0]
const LOOP  = new Float32Array([...VERTS, VERTS[0], VERTS[1], VERTS[2]])

function Scene({ paused }: { paused: boolean }) {
  const imageGroup = useRef<THREE.Group>(null)
  const { advance } = usePauseSafeElapsed(paused)

  // Ray endpoints from origin to each vertex
  const rays = useMemo(() => [
    new Float32Array([0, 0, 0, VERTS[0], VERTS[1], 0]),
    new Float32Array([0, 0, 0, VERTS[3], VERTS[4], 0]),
    new Float32Array([0, 0, 0, VERTS[6], VERTS[7], 0]),
  ], [])

  useFrame(({ clock }) => {
    const t = advance(clock.getElapsedTime())
    if (paused || !imageGroup.current) return
    const k = 1.6 + Math.sin(t * 0.7) * 0.6
    imageGroup.current.scale.setScalar(k)
  })

  return (
    <>
      {/* Origin dot */}
      <mesh position={[0, 0, 0]}>
        <circleGeometry args={[0.04, 12]} />
        <meshBasicMaterial color={tokens.three.amber} />
      </mesh>

      {/* Dilation rays */}
      {rays.map((pts, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[pts, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color={tokens.three.amber} transparent opacity={0.2} />
        </line>
      ))}

      {/* Pre-image */}
      <line>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[LOOP, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={tokens.three.ink} transparent opacity={0.55} />
      </line>

      {/* Dilated image */}
      <group ref={imageGroup}>
        <line>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[LOOP, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color={tokens.three.amber} transparent opacity={0.75} />
        </line>
      </group>
    </>
  )
}

export function DilationsPreview({ paused }: { paused: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 2.8], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent', width: '100%', height: '100%' }}
    >
      <Scene paused={paused} />
    </Canvas>
  )
}
