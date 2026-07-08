import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { useGame } from './store.js'
import { screenCode } from '../three/posters.js'

/* Reusable greybox props. Simple forms, but each one is *alive* — screens
   flicker, cores rotate, lamps breathe — so the world never feels static. */

const CHARCOAL = '#14171c'
const CHARCOAL_D = '#0f1216'

export function Slab({ args, position, rotation, color = CHARCOAL, radius = 0.04, ...rest }) {
  return (
    <RoundedBox
      args={args}
      radius={radius}
      smoothness={3}
      position={position}
      rotation={rotation}
      castShadow
      receiveShadow
      {...rest}
    >
      <meshStandardMaterial color={color} roughness={0.85} metalness={0.05} />
    </RoundedBox>
  )
}

// A glowing display that gently flickers, like a monitor left on.
export function GlowScreen({ position, rotation, size = [1.5, 0.9], color = '#5ad1ff' }) {
  const mat = useRef()
  const calm = useGame((s) => s.calm)
  useFrame((s) => {
    if (!mat.current) return
    const base = 0.85
    mat.current.emissiveIntensity = calm ? base : base + Math.sin(s.clock.elapsedTime * 3.1) * 0.07
  })
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshStandardMaterial
        ref={mat}
        color="#0d1016"
        emissive={color}
        emissiveIntensity={0.85}
        toneMapped={false}
      />
    </mesh>
  )
}

// A monitor showing real, glowing code (canvas texture) — "monitors show live code".
export function CodeScreen({ position, rotation, size = [1.4, 0.82] }) {
  const tex = useMemo(() => screenCode(), [])
  const mat = useRef()
  const calm = useGame((s) => s.calm)
  useFrame((s) => {
    if (mat.current)
      mat.current.emissiveIntensity = calm ? 1 : 1 + Math.sin(s.clock.elapsedTime * 3) * 0.06
  })
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshStandardMaterial
        ref={mat}
        map={tex}
        emissive="#ffffff"
        emissiveMap={tex}
        emissiveIntensity={1}
        toneMapped={false}
      />
    </mesh>
  )
}

// The Lab's neural sculpture: a slowly rotating wireframe with orbiting nodes
// and a warm/cool core light.
export function NeuralCore({ position = [0, 0, 0], color = '#5ad1ff' }) {
  const group = useRef()
  const calm = useGame((s) => s.calm)
  const nodes = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * Math.PI * 2
        const r = 0.75
        return [Math.cos(a) * r, Math.sin(a * 1.7) * 0.4, Math.sin(a) * r]
      }),
    []
  )
  useFrame((s, dt) => {
    if (group.current && !calm) {
      group.current.rotation.y += dt * 0.3
      group.current.rotation.x = Math.sin(s.clock.elapsedTime * 0.4) * 0.12
    }
  })
  return (
    <group position={position} ref={group}>
      <mesh>
        <icosahedronGeometry args={[0.8, 1]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.5} />
      </mesh>
      <mesh scale={0.35}>
        <icosahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} toneMapped={false} />
      </mesh>
      {nodes.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.6} toneMapped={false} />
        </mesh>
      ))}
      <pointLight color={color} intensity={3} distance={6} decay={2} />
    </group>
  )
}

// A practical desk lamp that casts a warm pool of light and quietly breathes.
export function Lamp({ position = [0, 0, 0], color = '#ff9a5c' }) {
  const light = useRef()
  const calm = useGame((s) => s.calm)
  useFrame((s) => {
    if (light.current)
      light.current.intensity = calm ? 6 : 6 + Math.sin(s.clock.elapsedTime * 2.3) * 0.5
  })
  return (
    <group position={position}>
      <Slab args={[0.28, 0.05, 0.28]} position={[0, 0.02, 0]} color="#3a3f47" radius={0.02} />
      <Slab args={[0.05, 0.9, 0.05]} position={[0, 0.45, 0]} color="#3a3f47" radius={0.02} />
      <Slab args={[0.06, 0.5, 0.06]} position={[0.2, 0.85, 0]} rotation={[0, 0, -0.9]} color="#3a3f47" radius={0.02} />
      <mesh position={[0.42, 1.0, 0]} rotation={[0, 0, -0.6]}>
        <coneGeometry args={[0.16, 0.24, 18, 1, true]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} side={THREE.DoubleSide} />
      </mesh>
      <pointLight ref={light} position={[0.5, 0.85, 0]} intensity={6} distance={6} decay={2} color={color} castShadow />
    </group>
  )
}

// Simple potted plant with a soft idle sway.
export function Plant({ position = [0, 0, 0] }) {
  const g = useRef()
  const calm = useGame((s) => s.calm)
  useFrame((s) => {
    if (g.current && !calm) g.current.rotation.z = Math.sin(s.clock.elapsedTime * 0.8) * 0.04
  })
  return (
    <group position={position}>
      <mesh position={[0, 0.28, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.16, 0.55, 14]} />
        <meshStandardMaterial color="#2c231a" roughness={0.8} />
      </mesh>
      <group ref={g} position={[0, 0.5, 0]}>
        {[
          [0, 0.5, 0, 1],
          [0.14, 0.42, 0.08, 0.8],
          [-0.12, 0.46, -0.06, 0.85],
        ].map(([x, y, z, sc], i) => (
          <mesh key={i} position={[x, y, z]} scale={sc} castShadow>
            <coneGeometry args={[0.22, 0.7, 8]} />
            <meshStandardMaterial color="#4e7a52" roughness={0.85} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
