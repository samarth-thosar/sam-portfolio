import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, useCursor } from '@react-three/drei'
import { useGame } from './store.js'
import { playWhoosh } from './audio.js'
import './interactable.css'

const NOOP = () => {}

/**
 * A glowing archway. Clicking it whooshes the camera through to another room.
 * Not an "inspect" — doors navigate the world.
 *
 * The archway plane faces local +z; rotate it so the opening is perpendicular
 * to the direction of travel (doors between rooms along x get rotation
 * [0, PI/2, 0]). One invisible hitbox is the only raycast target — the visual
 * meshes don't raycast, so hover can't flicker between them.
 *
 * Tinted with the DESTINATION room's accent — the archway previews the mood
 * shift before you step through (Studio's door into the Lab glows cyan; the
 * Lab's door back glows orange) rather than one hardcoded colour everywhere.
 */
export default function Door({ to, position, rotation = [0, 0, 0], label, accent = '#ff7a45' }) {
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)
  const goToRoom = useGame((s) => s.goToRoom)
  const arch = useRef()
  const glow = useRef()

  useFrame((_, dt) => {
    const k = 1 - Math.exp(-10 * dt)
    if (arch.current) {
      const to = hovered ? 1.3 : 0.5
      arch.current.material.emissiveIntensity += (to - arch.current.material.emissiveIntensity) * k
    }
    if (glow.current) {
      const to = hovered ? 0.16 : 0.06
      glow.current.material.opacity += (to - glow.current.material.opacity) * k
    }
  })

  return (
    <group position={position} rotation={rotation}>
      {/* the only raycast target: covers the arch down to the floor */}
      <mesh
        position={[0, -0.4, 0]}
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
        <boxGeometry args={[2.2, 2.8, 0.7]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* portal glow — fills the opening down to the floor */}
      <mesh ref={glow} raycast={NOOP} position={[0, -0.55, -0.05]}>
        <planeGeometry args={[1.7, 2.4]} />
        <meshBasicMaterial color={accent} transparent opacity={0.06} depthWrite={false} />
      </mesh>
      {/* arch */}
      <mesh ref={arch} raycast={NOOP} position={[0, -0.05, 0]}>
        <torusGeometry args={[0.92, 0.055, 14, 40, Math.PI]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.5} toneMapped={false} />
      </mesh>
      {/* posts — from the arch ends down to the floor */}
      {[-0.92, 0.92].map((x) => (
        <mesh key={x} raycast={NOOP} position={[x, -0.925, 0]}>
          <cylinderGeometry args={[0.055, 0.055, 1.75, 12]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.5} toneMapped={false} />
        </mesh>
      ))}

      {hovered && (
        <Html
          position={[0, 1.5, 0]}
          center
          zIndexRange={[20, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div className="iobj is-hover">
            <span className="iobj__dot" />
            {label} →
          </div>
        </Html>
      )}
    </group>
  )
}
