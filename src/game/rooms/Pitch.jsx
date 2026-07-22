import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { WORLD } from '../../data/world.js'
import RoomShell from './RoomShell.jsx'
import Interactable from '../Interactable.jsx'
import Door from '../Door.jsx'
import { Slab } from '../props.jsx'
import { posterEight } from '../../three/posters.js'
import { useGame } from '../store.js'

const R = WORLD.rooms.pitch
const O = WORLD.objects

// Locker: the No.8 keepsake (the exact same poster texture from the Studio's
// wall, reappearing here, not a redraw) pinned beside a jersey hanging on a
// hook that sways gently, like it's actually being brushed past.
function Locker() {
  const active = useGame((s) => s.inspectId === 'pitch-locker')
  const calm = useGame((s) => s.calm)
  const posterTex = useMemo(posterEight, [])
  const jersey = useRef()
  const glow = useRef()

  useFrame((s, dt) => {
    const t = s.clock.elapsedTime
    const k = 1 - Math.exp(-6 * dt)
    if (jersey.current && !calm) jersey.current.rotation.z = Math.sin(t * 0.6) * 0.03
    if (glow.current) {
      const target = active ? 0.4 : 0.15
      glow.current.material.opacity += (target - glow.current.material.opacity) * k
    }
  })

  return (
    <group>
      <Slab args={[1.1, 1.7, 0.5]} position={[0, 0.05, -0.2]} color="#1b1f26" radius={0.03} />
      <mesh ref={glow} position={[0, 0.05, 0.05]}>
        <planeGeometry args={[0.95, 1.55]} />
        <meshBasicMaterial color={R.accent} transparent opacity={0.15} />
      </mesh>
      <mesh position={[-0.28, 0.35, 0.06]} rotation={[0, 0, 0.04]}>
        <planeGeometry args={[0.32, 0.42]} />
        <meshBasicMaterial map={posterTex} toneMapped={false} />
      </mesh>
      <group ref={jersey} position={[0.22, 0.15, 0.08]}>
        <Slab args={[0.02, 0.06, 0.02]} position={[0, 0.62, 0]} color="#3a3f47" radius={0.005} />
        <Slab args={[0.42, 0.55, 0.04]} position={[0, 0.25, 0]} color="#c65a3a" radius={0.06} />
        {[-0.28, 0.28].map((x) => (
          <Slab key={x} args={[0.16, 0.22, 0.04]} position={[x, 0.42, 0]} rotation={[0, 0, x > 0 ? -0.35 : 0.35]} color="#c65a3a" radius={0.05} />
        ))}
      </group>
    </group>
  )
}

// A 4-3-3-ish formation board — connecting lines between related positions
// instead of literal text labels, so "the formation is the skillset" reads
// as a real tactical diagram rather than a resume dressed up as a pitch.
const POSITIONS = [
  [0, -0.5],
  [-0.4, -0.25], [-0.14, -0.28], [0.14, -0.28], [0.4, -0.25],
  [-0.28, 0.02], [0, 0.05], [0.28, 0.02],
  [-0.32, 0.32], [0, 0.4], [0.32, 0.32],
]
const LINES = [
  [0, 1], [0, 2], [0, 3], [0, 4],
  [1, 5], [2, 5], [2, 6], [3, 6], [3, 7], [4, 7],
  [5, 8], [6, 9], [7, 10], [5, 6], [6, 7],
]

function TacticsBoard() {
  const active = useGame((s) => s.inspectId === 'pitch-tactics')
  const calm = useGame((s) => s.calm)
  const dotRefs = useRef([])
  const lineRefs = useRef([])

  useFrame((s, dt) => {
    const t = s.clock.elapsedTime
    const k = 1 - Math.exp(-7 * dt)
    dotRefs.current.forEach((m, i) => {
      if (!m) return
      const pulse = calm ? 0.5 : Math.sin(t * 1.6 + i * 0.5) * 0.5 + 0.5
      const target = (active ? 1.3 : 0.55) + pulse * 0.4
      m.material.emissiveIntensity += (target - m.material.emissiveIntensity) * k
    })
    lineRefs.current.forEach((m) => {
      if (!m) return
      const target = active ? 0.5 : 0.22
      m.material.opacity += (target - m.material.opacity) * k
    })
  })

  return (
    <group>
      <Slab args={[1.7, 1.15, 0.06]} position={[0, 0, 0]} color="#16321f" radius={0.03} />
      {LINES.map(([a, b], i) => {
        const [ax, ay] = POSITIONS[a]
        const [bx, by] = POSITIONS[b]
        const mid = [(ax + bx) / 2, (ay + by) / 2, 0.035]
        const len = Math.hypot(bx - ax, by - ay)
        const angle = Math.atan2(by - ay, bx - ax)
        return (
          <mesh key={i} ref={(el) => (lineRefs.current[i] = el)} position={mid} rotation={[0, 0, angle]}>
            <planeGeometry args={[len, 0.012]} />
            <meshBasicMaterial color="#eafff0" transparent opacity={0.22} />
          </mesh>
        )
      })}
      {POSITIONS.map(([x, y], i) => (
        <mesh key={i} ref={(el) => (dotRefs.current[i] = el)} position={[x, y, 0.04]}>
          <circleGeometry args={[0.045, 14]} />
          <meshStandardMaterial color="#eafff0" emissive="#eafff0" emissiveIntensity={0.6} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

// Turf stripes — alternating floor bands, the one purely decorative touch
// that says "pitch" before you've read a word of copy.
const STRIPES = [-4.4, -3.3, -2.2, -1.1, 0, 1.1, 2.2, 3.3, 4.4]

export default function Pitch() {
  return (
    <>
      <RoomShell origin={R.origin} accent={R.accent} fill={R.fill} />

      {/* ---- dressing (non-interactive) ---- */}
      <group position={R.origin}>
        {STRIPES.map((z, i) => (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.895, z]}>
            <planeGeometry args={[11, 1.1]} />
            <meshBasicMaterial color={i % 2 ? '#1c3a24' : '#193420'} transparent opacity={0.5} />
          </mesh>
        ))}
      </group>

      {/* ---- interactables ---- */}
      <Interactable
        id="pitch-locker"
        label={O['pitch-locker'].label}
        position={O['pitch-locker'].position}
        radius={0.7}
        hitbox={[1.3, 1.9, 0.7]}
        labelY={1.0}
        accent={R.accent}
        kind="jersey"
      >
        <Locker />
      </Interactable>

      <Interactable
        id="pitch-tactics"
        label={O['pitch-tactics'].label}
        position={O['pitch-tactics'].position}
        radius={1.05}
        labelY={0.85}
        accent={R.accent}
        kind="tactics"
        haloShape="none"
        lift={false}
      >
        <TacticsBoard />
      </Interactable>

      {/* ---- door — glows with the destination room's own accent ---- */}
      {R.doors.map((d) => (
        <Door key={d.to} to={d.to} position={d.position} rotation={d.rotation} label={d.label} accent={WORLD.rooms[d.to].accent} />
      ))}
    </>
  )
}
