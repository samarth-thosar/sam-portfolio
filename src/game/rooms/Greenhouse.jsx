import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { WORLD } from '../../data/world.js'
import RoomShell from './RoomShell.jsx'
import Interactable from '../Interactable.jsx'
import Door from '../Door.jsx'
import { Slab, Lamp, Plant } from '../props.jsx'
import { useGame } from '../store.js'

const R = WORLD.rooms.greenhouse
const O = WORLD.objects

// Revogreen, his first internship, rendered as the plant that's thriving —
// bigger than the decorative Plant prop, with a couple of small glowing
// "Smart Shunt" telemetry dots among its leaves standing in for the
// Bluetooth/IoT angle of that first build.
function RevogreenPlant() {
  const active = useGame((s) => s.inspectId === 'greenhouse-revogreen')
  const calm = useGame((s) => s.calm)
  const sway = useRef()
  const dotRefs = useRef([])

  useFrame((s, dt) => {
    const t = s.clock.elapsedTime
    if (sway.current && !calm) sway.current.rotation.z = Math.sin(t * 0.7) * 0.05
    dotRefs.current.forEach((m, i) => {
      if (!m) return
      const pulse = calm ? 0.5 : Math.sin(t * 1.8 - i * 1.1) * 0.5 + 0.5
      const target = (active ? 1.6 : 0.7) + pulse * 0.5
      m.material.emissiveIntensity += (target - m.material.emissiveIntensity) * (1 - Math.exp(-6 * dt))
    })
  })

  return (
    <group>
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.19, 0.6, 14]} />
        <meshStandardMaterial color="#2c231a" roughness={0.8} />
      </mesh>
      <group ref={sway} position={[0, 0.62, 0]}>
        {[
          [0, 0.6, 0, 1.1],
          [0.18, 0.5, 0.1, 0.85],
          [-0.16, 0.55, -0.08, 0.9],
          [0.05, 0.42, 0.18, 0.7],
        ].map(([x, y, z, sc], i) => (
          <mesh key={i} position={[x, y, z]} scale={sc} castShadow>
            <coneGeometry args={[0.24, 0.75, 9]} />
            <meshStandardMaterial color="#4e8a52" roughness={0.85} />
          </mesh>
        ))}
        {/* Smart Shunt telemetry dots, tucked among the leaves */}
        {[[0.2, 0.75, 0.14], [-0.14, 0.65, -0.1]].map((p, i) => (
          <mesh key={i} ref={(el) => (dotRefs.current[i] = el)} position={p}>
            <sphereGeometry args={[0.035, 10, 10]} />
            <meshStandardMaterial color="#7ed957" emissive="#7ed957" emissiveIntensity={0.7} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// Three seed-pots at different growth stages (seed / sprout / sapling) —
// his stated areas of interest as things still growing rather than a
// finished list. Inspect nudges them slightly larger and brighter, like
// they've just been watered.
function SeedTray() {
  const active = useGame((s) => s.inspectId === 'greenhouse-seeds')
  const calm = useGame((s) => s.calm)
  const potRefs = useRef([])
  const sproutRefs = useRef([])
  const STAGES = [{ h: 0.05 }, { h: 0.2 }, { h: 0.38 }]

  useFrame((s, dt) => {
    const t = s.clock.elapsedTime
    const k = 1 - Math.exp(-5 * dt)
    STAGES.forEach((_, i) => {
      const pot = potRefs.current[i]
      const sprout = sproutRefs.current[i]
      if (pot) {
        const targetScale = active ? 1.12 : 1
        const sc = pot.scale.x + (targetScale - pot.scale.x) * k
        pot.scale.setScalar(sc)
      }
      if (sprout) {
        const pulse = calm ? 0.5 : Math.sin(t * 1.4 + i * 1.3) * 0.5 + 0.5
        const target = (active ? 1.3 : 0.55) + pulse * 0.35
        sprout.material.emissiveIntensity += (target - sprout.material.emissiveIntensity) * k
      }
    })
  })

  return (
    <group>
      <Slab args={[0.95, 0.08, 0.34]} position={[0, -0.04, 0]} color="#4a3624" radius={0.02} />
      {STAGES.map((stg, i) => {
        const x = -0.32 + i * 0.32
        return (
          <group key={i} ref={(el) => (potRefs.current[i] = el)} position={[x, 0.02, 0]}>
            <mesh>
              <cylinderGeometry args={[0.11, 0.13, 0.08, 12]} />
              <meshStandardMaterial color="#3a2f24" roughness={0.9} />
            </mesh>
            <mesh ref={(el) => (sproutRefs.current[i] = el)} position={[0, 0.04 + stg.h / 2, 0]}>
              <coneGeometry args={[0.055, stg.h, 8]} />
              <meshStandardMaterial color="#7ed957" emissive="#7ed957" emissiveIntensity={0.5} toneMapped={false} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

export default function Greenhouse() {
  return (
    <>
      <RoomShell origin={R.origin} accent={R.accent} fill={R.fill} particles="dust" />

      {/* ---- dressing (non-interactive) ---- */}
      <group position={R.origin}>
        <Plant position={[-4.3, -0.9, -2.6]} />
        <Plant position={[4.3, -0.9, -2.6]} />
        <Plant position={[-4.6, -0.9, 2.2]} />
        <Plant position={[4.6, -0.9, 1.6]} />
        <Lamp position={[2.6, 0.0, 1.6]} />
        {/* potting bench under the seed tray */}
        <Slab args={[1.1, 0.06, 0.5]} position={[1.6, 0.93, -1.3]} color="#4a3624" radius={0.02} />
        {[[1.15, -1.55], [2.05, -1.55], [1.15, -1.05], [2.05, -1.05]].map(([x, z], i) => (
          <Slab key={i} args={[0.06, 0.9, 0.06]} position={[x, 0.47, z]} color="#3a2f24" radius={0.01} />
        ))}
      </group>

      {/* ---- interactables ---- */}
      <Interactable
        id="greenhouse-revogreen"
        label={O['greenhouse-revogreen'].label}
        position={O['greenhouse-revogreen'].position}
        radius={0.6}
        labelY={1.5}
        accent={R.accent}
        kind="revogreen"
      >
        <RevogreenPlant />
      </Interactable>

      <Interactable
        id="greenhouse-seeds"
        label={O['greenhouse-seeds'].label}
        position={O['greenhouse-seeds'].position}
        radius={0.55}
        labelY={0.4}
        accent={R.accent}
        kind="seeds"
      >
        <SeedTray />
      </Interactable>

      {/* ---- door — glows with the destination room's own accent ---- */}
      {R.doors.map((d) => (
        <Door key={d.to} to={d.to} position={d.position} rotation={d.rotation} label={d.label} accent={WORLD.rooms[d.to].accent} />
      ))}
    </>
  )
}
