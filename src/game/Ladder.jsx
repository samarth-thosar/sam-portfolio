import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, useCursor } from '@react-three/drei'
import { useGame } from './store.js'
import { playWhoosh } from './audio.js'
import './interactable.css'

const NOOP = () => {}

/**
 * A glowing ladder — the vertical counterpart to Door.jsx. Same behavioral
 * contract (hitbox + hover cursor + click -> goToRoom), different visual
 * language: two rails and climbing rungs instead of an archway, since this
 * travels straight up (Rooftop) rather than across to a neighboring room.
 */
export default function Ladder({ to, position, rotation = [0, 0, 0], label, accent = '#ff7a45' }) {
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)
  const goToRoom = useGame((s) => s.goToRoom)
  const railRefs = useRef([])
  const glow = useRef()
  const RAIL_X = 0.35
  const HEIGHT = 2.4
  const RUNGS = 6

  useFrame((_, dt) => {
    const k = 1 - Math.exp(-10 * dt)
    const targetGlow = hovered ? 1.3 : 0.5
    railRefs.current.forEach((r) => {
      if (r) r.material.emissiveIntensity += (targetGlow - r.material.emissiveIntensity) * k
    })
    if (glow.current) {
      const to = hovered ? 0.16 : 0.06
      glow.current.material.opacity += (to - glow.current.material.opacity) * k
    }
  })

  return (
    <group position={position} rotation={rotation}>
      {/* the only raycast target: covers the ladder's full climbing extent */}
      <mesh
        position={[0, HEIGHT / 2 - 0.9, 0]}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          setHovered(false)
        }}
        onClick={(e) => {
          e.stopPropagation()
          playWhoosh(to)
          goToRoom(to)
        }}
      >
        <boxGeometry args={[RAIL_X * 2 + 0.3, HEIGHT, 0.4]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* soft vertical glow behind the rungs */}
      <mesh ref={glow} raycast={NOOP} position={[0, HEIGHT / 2 - 0.9, -0.06]}>
        <planeGeometry args={[RAIL_X * 2, HEIGHT]} />
        <meshBasicMaterial color={accent} transparent opacity={0.06} depthWrite={false} />
      </mesh>
      {/* two rails, floor to the top of the climb */}
      {[-RAIL_X, RAIL_X].map((x, i) => (
        <mesh key={x} ref={(el) => (railRefs.current[i] = el)} raycast={NOOP} position={[x, HEIGHT / 2 - 0.9, 0]}>
          <cylinderGeometry args={[0.035, 0.035, HEIGHT, 10]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.5} toneMapped={false} />
        </mesh>
      ))}
      {/* climbing rungs */}
      {Array.from({ length: RUNGS }).map((_, i) => (
        <mesh key={i} raycast={NOOP} position={[0, -0.9 + ((i + 0.5) * HEIGHT) / RUNGS, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, RAIL_X * 2, 8]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.4} toneMapped={false} />
        </mesh>
      ))}

      {hovered && (
        <Html position={[0, HEIGHT - 0.6, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
          <div className="iobj is-hover">
            <span className="iobj__dot" />
            {label} →
          </div>
        </Html>
      )}
    </group>
  )
}
