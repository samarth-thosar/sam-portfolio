import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { WORLD } from '../../data/world.js'
import RoomShell from './RoomShell.jsx'
import Interactable from '../Interactable.jsx'
import Ladder from '../Ladder.jsx'
import { Slab, Plant } from '../props.jsx'
import { useGame } from '../store.js'

const R = WORLD.rooms.rooftop
const O = WORLD.objects

// A short parapet ledge tracing the floor's perimeter — rooftop-appropriate
// without boxing the space in the way a full RoomShell wall would (this room
// deliberately renders with wallsEnabled=false for the open-sky feel).
const PARAPET = [
  [0, -4.85, 0, 12.6],
  [0, 4.85, 0, 12.6],
  [-6.35, 0, Math.PI / 2, 9.6],
  [6.35, 0, Math.PI / 2, 9.6],
]

// The running trail: a winding dashed line on the floor, each dash idling
// with a slow chase pulse and brightening together on inspect — the pace of
// a long run rendered as light instead of literal footprints.
function Trail() {
  const active = useGame((s) => s.inspectId === 'rooftop-trail')
  const calm = useGame((s) => s.calm)
  const dashRefs = useRef([])
  const points = useMemo(() => {
    const N = 12
    return Array.from({ length: N }, (_, i) => {
      const p = i / (N - 1)
      const x = -1.4 + p * 2.9
      const z = Math.sin(p * Math.PI * 1.6) * 0.85
      return [x, z]
    })
  }, [])

  useFrame((s, dt) => {
    const t = s.clock.elapsedTime
    const k = 1 - Math.exp(-6 * dt)
    dashRefs.current.forEach((m, i) => {
      if (!m) return
      const chase = calm ? 0.5 : Math.sin(t * 1.4 - i * 0.4) * 0.5 + 0.5
      const target = active ? 0.85 : 0.3 + chase * 0.35
      m.material.opacity += (target - m.material.opacity) * k
    })
  })

  return (
    <group position={[0, -1.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {points.map(([x, z], i) => (
        <mesh key={i} ref={(el) => (dashRefs.current[i] = el)} position={[x, z, 0]} rotation={[0, 0, Math.atan2(0, 1)]}>
          <planeGeometry args={[0.22, 0.06]} />
          <meshBasicMaterial color={R.accent} transparent opacity={0.35} />
        </mesh>
      ))}
      {/* finish marker at the trail's end */}
      <mesh position={[1.5, 0.9, 0]}>
        <circleGeometry args={[0.05, 14]} />
        <meshStandardMaterial color={R.accent} emissive={R.accent} emissiveIntensity={1} toneMapped={false} />
      </mesh>
    </group>
  )
}

// The yoga mat: a slow, held "breathing" scale — inhale/exhale rendered as a
// gentle pulse rather than a percussive wake beat, matching this room's
// calmer register.
function YogaMat() {
  const active = useGame((s) => s.inspectId === 'rooftop-yoga')
  const calm = useGame((s) => s.calm)
  const mat = useRef()
  const glow = useRef()

  useFrame((s, dt) => {
    const t = s.clock.elapsedTime
    const k = 1 - Math.exp(-4 * dt)
    if (mat.current) {
      const breathe = calm ? 1 : 1 + Math.sin(t * 0.55) * (active ? 0.035 : 0.015)
      mat.current.scale.y += (breathe - mat.current.scale.y) * k
    }
    if (glow.current) {
      const pulse = calm ? 0.5 : Math.sin(t * 0.55) * 0.5 + 0.5
      const target = active ? 0.7 : 0.22 + pulse * 0.18
      glow.current.material.opacity += (target - glow.current.material.opacity) * k
    }
  })

  return (
    <group>
      <mesh ref={glow} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.16, 0]}>
        <planeGeometry args={[1.1, 0.6]} />
        <meshBasicMaterial color={R.accent} transparent opacity={0.22} />
      </mesh>
      <mesh ref={mat} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.15, 0]} receiveShadow>
        <planeGeometry args={[0.6, 1.4]} />
        <meshStandardMaterial color="#3f6d7a" roughness={0.85} />
      </mesh>
    </group>
  )
}

export default function Rooftop() {
  return (
    <>
      <RoomShell
        origin={R.origin}
        accent={R.accent}
        fill={R.fill}
        floorSize={R.floorSize}
        wallsEnabled={R.wallsEnabled}
        particles={R.particles}
      />

      {/* ---- dressing (non-interactive) ---- */}
      <group position={R.origin}>
        {PARAPET.map(([x, z, rotY, len], i) => (
          <Slab key={i} args={[len, 0.5, 0.12]} position={[x, -0.65, z]} rotation={[0, rotY, 0]} color="#232833" radius={0.02} />
        ))}
        <Plant position={[-5.6, -0.9, 3.6]} />
        <Plant position={[5.4, -0.9, -3.4]} />
        {/* small bench near the yoga mat */}
        <Slab args={[1.1, 0.12, 0.4]} position={[2.6, -0.55, -0.6]} color="#3a2f24" radius={0.03} />
      </group>

      {/* ---- interactables ---- */}
      <Interactable
        id="rooftop-trail"
        label={O['rooftop-trail'].label}
        position={O['rooftop-trail'].position}
        radius={1.1}
        hitbox={[3, 1, 2.2]}
        labelY={0.5}
        accent={R.accent}
        kind="trail"
        haloShape="none"
        lift={false}
      >
        <Trail />
      </Interactable>

      <Interactable
        id="rooftop-yoga"
        label={O['rooftop-yoga'].label}
        position={O['rooftop-yoga'].position}
        radius={0.65}
        labelY={0.35}
        accent={R.accent}
        kind="yogamat"
        haloShape="none"
        lift={false}
      >
        <YogaMat />
      </Interactable>

      {/* ---- ladder — glows with the destination room's own accent ---- */}
      {R.doors.map((d) => (
        <Ladder key={d.to} to={d.to} position={d.position} rotation={d.rotation} label={d.label} accent={WORLD.rooms[d.to].accent} />
      ))}
    </>
  )
}
