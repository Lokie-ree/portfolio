import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { tokens } from '@/tokens'

interface PolyProps {
  position: [number, number, number]
  rotationZ: number
  scale: number
  sides: number
  speed: number
  drift: [number, number]
  opacity: number
}

function Polygon({ position, rotationZ, scale, sides, speed, drift, opacity, entranceDelay }: PolyProps & { entranceDelay: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const materialRef = useRef<THREE.LineBasicMaterial>(null)
  const timeOffset = useMemo(() => Math.random() * Math.PI * 2, [])

  const points = useMemo(() => {
    const pts: number[] = []
    for (let i = 0; i <= sides; i++) {
      const angle = (i / sides) * Math.PI * 2
      pts.push(Math.cos(angle), Math.sin(angle), 0)
    }
    return new Float32Array(pts)
  }, [sides])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    groupRef.current.rotation.z = rotationZ + t * speed
    groupRef.current.position.x = position[0] + Math.sin(t * drift[0] + timeOffset) * 0.3
    groupRef.current.position.y = position[1] + Math.cos(t * drift[1] + timeOffset) * 0.2
  })

  useEffect(() => {
    if (!materialRef.current || !groupRef.current) return
    const mat = materialRef.current
    const group = groupRef.current
    const targetZ = position[2]

    // Start offset below the target z position
    group.position.z = targetZ - 2

    const delay = 0.3 + entranceDelay

    // Animate opacity: 0 → target
    const t1 = gsap.fromTo(mat,
      { opacity: 0 },
      { opacity, duration: 1.4, delay, ease: 'power3.out' }
    )

    // Animate z-rise: targetZ - 2 → targetZ (no conflict — useFrame only touches x and y)
    const t2 = gsap.fromTo(group.position,
      { z: targetZ - 2 },
      { z: targetZ, duration: 1.4, delay, ease: 'power3.out' }
    )

    return () => { t1.kill(); t2.kill() }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  // Empty array is intentional — entrance fires once on mount only.

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <line>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[points, 3]} />
        </bufferGeometry>
        <lineBasicMaterial ref={materialRef} color={tokens.three.amber} transparent={true} opacity={0} />
      </line>
    </group>
  )
}

function ParallaxCamera({ isTouch }: { isTouch: boolean }) {
  const { camera } = useThree()
  const mouse = useRef({ x: 0, y: 0 })
  const target = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (isTouch) return
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [isTouch])

  useFrame(() => {
    if (isTouch) return
    target.current.x += (mouse.current.x * 0.4 - target.current.x) * 0.04
    target.current.y += (mouse.current.y * 0.3 - target.current.y) * 0.04
    camera.position.x = target.current.x
    camera.position.y = target.current.y
    camera.lookAt(0, 0, 0)
  })

  return null
}

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

export function HeroCanvas() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 520
  const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
  const activePolys = isMobile ? POLYS.slice(0, 7) : POLYS

  return (
    <div className="absolute inset-0" aria-hidden="true">
      <div className="hero-glow" />
      <Canvas
        className="bg-transparent"
        camera={{ position: [0, 0, 6], fov: 60 }}
        dpr={Math.min(window.devicePixelRatio, 2)}
        gl={{ antialias: true, alpha: true }}
      >
        <ParallaxCamera isTouch={isTouch} />
        {activePolys.map((p, i) => <Polygon key={i} {...p} entranceDelay={i * 0.08} />)}
      </Canvas>
    </div>
  )
}
