import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { WORLD } from '../../data/world.js'
import RoomShell from './RoomShell.jsx'
import Interactable from '../Interactable.jsx'
import Door from '../Door.jsx'
import { Slab, Lamp } from '../props.jsx'
import { useGame } from '../store.js'

const R = WORLD.rooms.vault
const O = WORLD.objects

// Six badges — five Anthropic certifications plus IBM Full-Stack — each its
// own colour, idling with a slow staggered shimmer rather than one flat glow.
const BADGES = ['#d4af37', '#5ad1ff', '#ff7a45', '#a78bfa', '#7ed957', '#ff9ab0']

function CertRack() {
  const active = useGame((s) => s.inspectId === 'vault-certs')
  const calm = useGame((s) => s.calm)
  const badgeRefs = useRef([])

  useFrame((s, dt) => {
    const t = s.clock.elapsedTime
    const k = 1 - Math.exp(-6 * dt)
    badgeRefs.current.forEach((m, i) => {
      if (!m) return
      const pulse = calm ? 0.5 : Math.sin(t * 1.5 + i * 0.8) * 0.5 + 0.5
      const target = (active ? 1.4 : 0.6) + pulse * 0.4
      m.material.emissiveIntensity += (target - m.material.emissiveIntensity) * k
    })
  })

  return (
    <group>
      <Slab args={[1.5, 1.0, 0.08]} position={[0, 0, 0]} color="#241d10" radius={0.03} />
      {BADGES.map((color, i) => {
        const col = i % 3
        const row = Math.floor(i / 3)
        const x = -0.5 + col * 0.5
        const y = 0.25 - row * 0.5
        return (
          <group key={i} position={[x, y, 0.06]}>
            <mesh>
              <circleGeometry args={[0.16, 20]} />
              <meshStandardMaterial color="#1b1f26" />
            </mesh>
            <mesh ref={(el) => (badgeRefs.current[i] = el)} position={[0, 0, 0.01]}>
              <ringGeometry args={[0.09, 0.13, 24]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} toneMapped={false} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

// A small rotating wireframe globe with scattered lights — impact at global
// scale (3M+ users), the other half of the whiteboard's architecture story.
function ImpactGlobe() {
  const active = useGame((s) => s.inspectId === 'vault-globe')
  const calm = useGame((s) => s.calm)
  const group = useRef()
  const dotRefs = useRef([])

  const dots = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => {
        const phi = Math.acos(1 - (2 * (i + 0.5)) / 10)
        const theta = Math.PI * (1 + Math.sqrt(5)) * i
        const r = 0.42
        return [r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi)]
      }),
    []
  )

  useFrame((s, dt) => {
    if (group.current && !calm) group.current.rotation.y += dt * 0.25
    const t = s.clock.elapsedTime
    const k = 1 - Math.exp(-6 * dt)
    dotRefs.current.forEach((m, i) => {
      if (!m) return
      const pulse = calm ? 0.5 : Math.sin(t * 2 + i) * 0.5 + 0.5
      const target = (active ? 1.6 : 0.8) + pulse * 0.5
      m.material.emissiveIntensity += (target - m.material.emissiveIntensity) * k
    })
  })

  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[0.4, 2]} />
        <meshBasicMaterial color={R.accent} wireframe transparent opacity={0.4} />
      </mesh>
      {dots.map((p, i) => (
        <mesh key={i} ref={(el) => (dotRefs.current[i] = el)} position={p}>
          <sphereGeometry args={[0.03, 10, 10]} />
          <meshStandardMaterial color="#ffe9b8" emissive="#ffe9b8" emissiveIntensity={0.8} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

// A quiet plaque — four bars in a rhythm rather than literal digits (the
// real numbers live in the story copy); this stays an object, not a label.
const BARS = [0.3, 0.5, 0.7, 0.42]

function NumbersPlaque() {
  const active = useGame((s) => s.inspectId === 'vault-plaque')
  const calm = useGame((s) => s.calm)
  const barRefs = useRef([])

  useFrame((s, dt) => {
    const t = s.clock.elapsedTime
    const k = 1 - Math.exp(-6 * dt)
    barRefs.current.forEach((m, i) => {
      if (!m) return
      const pulse = calm ? 0.5 : Math.sin(t * 1.3 + i * 0.9) * 0.5 + 0.5
      const target = (active ? 1.3 : 0.55) + pulse * 0.4
      m.material.emissiveIntensity += (target - m.material.emissiveIntensity) * k
    })
  })

  return (
    <group>
      <Slab args={[1.1, 0.8, 0.07]} position={[0, 0, 0]} color="#241d10" radius={0.03} />
      {BARS.map((h, i) => (
        <mesh key={i} ref={(el) => (barRefs.current[i] = el)} position={[-0.33 + i * 0.22, -0.3 + h / 2, 0.05]}>
          <boxGeometry args={[0.12, h, 0.04]} />
          <meshStandardMaterial color={R.accent} emissive={R.accent} emissiveIntensity={0.6} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

export default function Vault() {
  return (
    <>
      <RoomShell origin={R.origin} accent={R.accent} fill={R.fill} floorSize={R.floorSize} />

      {/* ---- dressing (non-interactive) ---- */}
      <group position={R.origin}>
        <Lamp position={[-1.4, 0.1, -1.0]} />
        {/* small pedestal under the globe */}
        <Slab args={[0.4, 0.4, 0.4]} position={[-1.0, -0.7, -0.6]} color="#1b1f26" radius={0.04} />
        {/* rug */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.88, -0.3]}>
          <planeGeometry args={[2.2, 1.8]} />
          <meshStandardMaterial color="#1a1409" roughness={1} />
        </mesh>
      </group>

      {/* ---- interactables ---- */}
      <Interactable
        id="vault-certs"
        label={O['vault-certs'].label}
        position={O['vault-certs'].position}
        radius={0.85}
        labelY={0.65}
        accent={R.accent}
        kind="certs"
        haloShape="none"
        lift={false}
      >
        <CertRack />
      </Interactable>

      <Interactable
        id="vault-globe"
        label={O['vault-globe'].label}
        position={O['vault-globe'].position}
        radius={0.6}
        labelY={0.6}
        accent={R.accent}
        kind="globe"
      >
        <ImpactGlobe />
      </Interactable>

      <Interactable
        id="vault-plaque"
        label={O['vault-plaque'].label}
        position={O['vault-plaque'].position}
        radius={0.65}
        labelY={0.55}
        accent={R.accent}
        kind="plaque"
        haloShape="none"
        lift={false}
      >
        <NumbersPlaque />
      </Interactable>

      {/* ---- door — glows with the destination room's own accent ---- */}
      {R.doors.map((d) => (
        <Door key={d.to} to={d.to} position={d.position} rotation={d.rotation} label={d.label} accent={WORLD.rooms[d.to].accent} />
      ))}
    </>
  )
}
