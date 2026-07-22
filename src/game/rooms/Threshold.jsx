import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { WORLD } from '../../data/world.js'
import RoomShell from './RoomShell.jsx'
import Interactable from '../Interactable.jsx'
import Door from '../Door.jsx'
import { Slab, Lamp, Plant } from '../props.jsx'
import { useGame } from '../store.js'

const R = WORLD.rooms.threshold
const O = WORLD.objects

// A sealed letter waiting on its little table — idles closed and still; on
// inspect it lifts slightly and the wax seal brightens, like being picked up
// to be read.
function Letter() {
  const active = useGame((s) => s.inspectId === 'threshold-letter')
  const calm = useGame((s) => s.calm)
  const group = useRef()
  const seal = useRef()

  useFrame((s, dt) => {
    const t = s.clock.elapsedTime
    const k = 1 - Math.exp(-6 * dt)
    if (group.current) {
      const targetY = active ? 0.035 : 0
      group.current.position.y += (targetY - group.current.position.y) * k
    }
    if (seal.current) {
      const pulse = calm ? 0.5 : Math.sin(t * 2.4) * 0.5 + 0.5
      const target = active ? 1.8 : 0.6 + pulse * 0.35
      seal.current.material.emissiveIntensity += (target - seal.current.material.emissiveIntensity) * k
    }
  })

  return (
    <group ref={group}>
      <Slab args={[0.56, 0.02, 0.38]} color="#e9dfc7" radius={0.008} />
      {/* flap seam, sketched as a shallow V */}
      {[-1, 1].map((sx) => (
        <mesh key={sx} position={[sx * 0.14, 0.012, -0.095]} rotation={[-Math.PI / 2, 0, sx * 0.62]}>
          <planeGeometry args={[0.32, 0.012]} />
          <meshBasicMaterial color="#9c8f6d" transparent opacity={0.6} />
        </mesh>
      ))}
      <mesh ref={seal} position={[0, 0.013, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.05, 20]} />
        <meshStandardMaterial color="#c0392b" emissive="#c0392b" emissiveIntensity={0.6} toneMapped={false} />
      </mesh>
    </group>
  )
}

// The mailbox: its flag lifts on hover/inspect (an unmistakable "there's
// mail" gesture) and its slot glow brightens like every other artifact does.
function Mailbox() {
  const active = useGame((s) => s.inspectId === 'threshold-mailbox')
  const hovered = useGame((s) => s.hoverId === 'threshold-mailbox')
  const calm = useGame((s) => s.calm)
  const flagRef = useRef()
  const slotRef = useRef()

  useFrame((s, dt) => {
    const t = s.clock.elapsedTime
    const k = 1 - Math.exp(-8 * dt)
    const flagUp = active || hovered
    if (flagRef.current) {
      const target = flagUp ? -1.3 : -0.1
      flagRef.current.rotation.z += (target - flagRef.current.rotation.z) * k
    }
    if (slotRef.current) {
      const pulse = calm ? 0.5 : Math.sin(t * 2.2) * 0.5 + 0.5
      const target = active ? 1.6 : 0.5 + pulse * 0.5
      slotRef.current.material.emissiveIntensity += (target - slotRef.current.material.emissiveIntensity) * k
    }
  })

  return (
    <group>
      <Slab args={[0.08, 0.9, 0.08]} position={[0, -0.45, 0]} color="#4a4038" radius={0.02} />
      <Slab args={[0.4, 0.32, 0.34]} position={[0, 0.05, 0]} color="#8a3b2e" radius={0.06} />
      <mesh ref={slotRef} position={[0, 0.05, 0.171]}>
        <planeGeometry args={[0.26, 0.045]} />
        <meshStandardMaterial color="#ffb98a" emissive="#ff7a45" emissiveIntensity={0.5} toneMapped={false} />
      </mesh>
      <group position={[0.22, 0.14, 0]}>
        <Slab args={[0.02, 0.16, 0.02]} color="#4a4038" radius={0.004} />
        <group ref={flagRef} position={[0, 0.08, 0]}>
          <Slab args={[0.02, 0.13, 0.02]} position={[0, 0.06, 0]} color="#4a4038" radius={0.004} />
          <Slab args={[0.02, 0.09, 0.09]} position={[0, 0.11, 0.045]} color="#c0392b" radius={0.004} />
        </group>
      </group>
    </group>
  )
}

export default function Threshold() {
  return (
    <>
      <RoomShell origin={R.origin} accent={R.accent} fill={R.fill} />

      {/* ---- dressing (non-interactive) ---- */}
      <group position={R.origin}>
        {/* welcome mat, proud of the door */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.89, -2.3]}>
          <planeGeometry args={[1.6, 1.6]} />
          <meshStandardMaterial color="#3a2a1c" roughness={1} />
        </mesh>
        {/* stepping stones leading from the door toward the letter/mailbox */}
        {[-1.7, -1.0, -0.3].map((z, i) => (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.89, z]}>
            <circleGeometry args={[0.26, 16]} />
            <meshStandardMaterial color="#332a22" roughness={1} />
          </mesh>
        ))}
        {/* flanking lanterns */}
        <Lamp position={[-3.0, 0.0, 1.6]} />
        <Lamp position={[3.0, 0.0, 1.6]} />
        {/* flanking plants near the entrance */}
        <Plant position={[-4.3, -0.9, -2.6]} />
        <Plant position={[4.3, -0.9, -2.6]} />
        {/* small table under the letter */}
        <Slab args={[0.9, 0.06, 0.6]} position={[-1.5, 0.86, -1]} color="#4a3624" radius={0.02} />
      </group>

      {/* ---- interactables ---- */}
      <Interactable
        id="threshold-letter"
        label={O['threshold-letter'].label}
        position={O['threshold-letter'].position}
        radius={0.55}
        labelY={0.5}
        accent={R.accent}
        kind="letter"
      >
        <Letter />
      </Interactable>

      <Interactable
        id="threshold-mailbox"
        label={O['threshold-mailbox'].label}
        position={O['threshold-mailbox'].position}
        radius={0.6}
        labelY={0.75}
        accent={R.accent}
        kind="mailbox"
      >
        <Mailbox />
      </Interactable>

      {/* ---- door — glows with the destination room's own accent ---- */}
      {R.doors.map((d) => (
        <Door key={d.to} to={d.to} position={d.position} rotation={d.rotation} label={d.label} accent={WORLD.rooms[d.to].accent} />
      ))}
    </>
  )
}
