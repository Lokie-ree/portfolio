import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { tokens } from '@/tokens'

const TRI_VERTS = new Float32Array([-0.5, -0.4, 0,  0.1, 0.5, 0,  0.5, -0.2, 0])
const TRI_LOOP  = new Float32Array([-0.5, -0.4, 0,  0.1, 0.5, 0,  0.5, -0.2, 0,  -0.5, -0.4, 0])
const TRI_FLIP  = new Float32Array([ 0.5, -0.4, 0, -0.1, 0.5, 0, -0.5, -0.2, 0,   0.5, -0.4, 0])
const AXIS_PTS  = new Float32Array([0, -0.9, 0,  0, 0.9, 0])

function Scene({ paused }: { paused: boolean }) {
  const preGroup  = useRef<THREE.Group>(null)
  const imgGroup  = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (paused) return
    const t = clock.getElapsedTime()
    const shift = Math.sin(t * 0.6) * 0.3
    if (preGroup.current)  preGroup.current.position.x  = -shift
    if (imgGroup.current)  imgGroup.current.position.x  =  shift
  })

  const preGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(TRI_VERTS.slice(), 3))
    g.setIndex([0, 1, 2])
    return g
  }, [])

  return (
    <>
      {/* Reflection axis */}
      <line>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[AXIS_PTS, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={tokens.three.amber} transparent opacity={0.5} />
      </line>

      {/* Pre-image */}
      <group ref={preGroup}>
        <mesh geometry={preGeo}>
          <meshBasicMaterial color={tokens.three.ink} transparent opacity={0.12} side={THREE.DoubleSide} />
        </mesh>
        <line>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[TRI_LOOP, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color={tokens.three.ink} transparent opacity={0.6} />
        </line>
      </group>

      {/* Reflected image */}
      <group ref={imgGroup}>
        <line>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[TRI_FLIP, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color={tokens.three.amber} transparent opacity={0.75} />
        </line>
      </group>
    </>
  )
}

export function RigidMotionsPreview({ paused }: { paused: boolean }) {
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
