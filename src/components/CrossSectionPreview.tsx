import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { tokens } from '@/tokens'

const HEX_VERTS = new Float32Array([
  0.38,  0,     0,
  0.19,  0.33,  0,
 -0.19,  0.33,  0,
 -0.38,  0,     0,
 -0.19, -0.33,  0,
  0.19, -0.33,  0,
  0.38,  0,     0,  // close
])

function Scene({ paused }: { paused: boolean }) {
  const planeGroupRef = useRef<THREE.Group>(null)
  const hexMatRef = useRef<THREE.LineBasicMaterial>(null)

  const cubeEdges = useMemo(
    () => new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)),
    []
  )

  useFrame(({ clock }) => {
    if (paused) return
    const t = clock.getElapsedTime()
    const s = Math.sin(t * 0.5)
    if (planeGroupRef.current) planeGroupRef.current.position.y = s * 0.25
    if (hexMatRef.current) hexMatRef.current.opacity = (1 - Math.abs(s)) * 0.85
  })

  return (
    <group>
      {/* Wireframe cube */}
      <lineSegments geometry={cubeEdges}>
        <lineBasicMaterial color={tokens.three.ink} transparent opacity={0.5} />
      </lineSegments>

      {/* Cutting plane + hexagon grouped so they stay coplanar */}
      <group
        ref={planeGroupRef}
        rotation={[-Math.acos(1 / Math.sqrt(3)), Math.PI / 4, 0]}
      >
        <mesh>
          <planeGeometry args={[1.6, 1.6]} />
          <meshBasicMaterial
            color={tokens.three.amber}
            transparent
            opacity={0.12}
            side={THREE.DoubleSide}
          />
        </mesh>

        <line>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[HEX_VERTS, 3]} />
          </bufferGeometry>
          <lineBasicMaterial
            ref={hexMatRef}
            color={tokens.three.amber}
            transparent
            opacity={0}
          />
        </line>
      </group>
    </group>
  )
}

export function CrossSectionPreview({ paused }: { paused: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 2.8], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent', width: '100%', height: '100%' }}
    >
      <Scene paused={paused} />
    </Canvas>
  )
}
