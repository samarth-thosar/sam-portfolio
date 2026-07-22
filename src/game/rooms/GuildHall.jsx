import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { WORLD } from '../../data/world.js'
import RoomShell from './RoomShell.jsx'
import Interactable from '../Interactable.jsx'
import Door from '../Door.jsx'
import { Slab, Lamp } from '../props.jsx'
import { useGame } from '../store.js'

const R = WORLD.rooms.guildhall
const O = WORLD.objects
const COLS = 7
const ROWS = 5

// 35 small lights, one per mentee — a wave of warmth sweeps across them
// idly, brightening together on inspect rather than a static plaque.
function MenteeWall() {
  const active = useGame((s) => s.inspectId === 'guildhall-mentees')
  const calm = useGame((s) => s.calm)
  const dotRefs = useRef([])

  useFrame((s, dt) => {
    const t = s.clock.elapsedTime
    const k = 1 - Math.exp(-6 * dt)
    dotRefs.current.forEach((m, i) => {
      if (!m) return
      const col = i % COLS
      const row = Math.floor(i / COLS)
      const wave = calm ? 0.5 : Math.sin(t * 1.4 - (col + row) * 0.35) * 0.5 + 0.5
      const target = (active ? 1.4 : 0.55) + wave * 0.5
      m.material.emissiveIntensity += (target - m.material.emissiveIntensity) * k
    })
  })

  return (
    <group>
      <Slab args={[1.9, 1.3, 0.1]} position={[0, 0, 0]} color="#241d10" radius={0.03} />
      {Array.from({ length: COLS * ROWS }).map((_, i) => {
        const col = i % COLS
        const row = Math.floor(i / COLS)
        const x = -0.78 + col * 0.26
        const y = 0.48 - row * 0.26
        return (
          <mesh key={i} ref={(el) => (dotRefs.current[i] = el)} position={[x, y, 0.07]}>
            <circleGeometry args={[0.06, 12]} />
            <meshStandardMaterial color={R.accent} emissive={R.accent} emissiveIntensity={0.6} toneMapped={false} />
          </mesh>
        )
      })}
    </group>
  )
}

// A small tree built from branching rods and leaf-lights — open source as
// something that keeps branching outward the more people join it.
function OpenSourceTree() {
  const active = useGame((s) => s.inspectId === 'guildhall-opensource')
  const calm = useGame((s) => s.calm)
  const leafRefs = useRef([])

  const branches = useMemo(
    () => [
      [[0, 0, 0], [0, 0.5, 0]],
      [[0, 0.5, 0], [0.32, 0.82, 0.08]],
      [[0, 0.5, 0], [-0.28, 0.78, -0.1]],
      [[0, 0.5, 0], [0.05, 0.92, -0.24]],
      [[0.32, 0.82, 0.08], [0.5, 1.05, 0.14]],
      [[-0.28, 0.78, -0.1], [-0.42, 1.0, -0.2]],
    ],
    []
  )
  const branchData = useMemo(
    () =>
      branches.map(([a, b]) => {
        const start = new THREE.Vector3(...a)
        const end = new THREE.Vector3(...b)
        const dir = end.clone().sub(start)
        const len = dir.length()
        const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
        return { mid: start.clone().add(end).multiplyScalar(0.5).toArray(), len, quat }
      }),
    [branches]
  )
  const leaves = useMemo(
    () => [
      [0.5, 1.05, 0.14],
      [-0.42, 1.0, -0.2],
      [0.05, 0.92, -0.24],
      [0.32, 0.82, 0.08],
      [-0.28, 0.78, -0.1],
    ],
    []
  )

  useFrame((s, dt) => {
    const t = s.clock.elapsedTime
    const k = 1 - Math.exp(-6 * dt)
    leafRefs.current.forEach((m, i) => {
      if (!m) return
      const pulse = calm ? 0.5 : Math.sin(t * 1.7 + i * 1.1) * 0.5 + 0.5
      const target = (active ? 1.5 : 0.7) + pulse * 0.5
      m.material.emissiveIntensity += (target - m.material.emissiveIntensity) * k
    })
  })

  return (
    <group>
      {branchData.map((b, i) => (
        <mesh key={i} position={b.mid} quaternion={b.quat}>
          <cylinderGeometry args={[0.025, 0.035, b.len, 6]} />
          <meshStandardMaterial color="#5c4a2e" roughness={0.9} />
        </mesh>
      ))}
      {leaves.map((p, i) => (
        <mesh key={i} ref={(el) => (leafRefs.current[i] = el)} position={p}>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial color={R.accent} emissive={R.accent} emissiveIntensity={0.7} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

// A phone mockup: a small grid of coloured "app icons" rather than a live
// canvas screen — this is about having led the team that shipped it, not
// about the app's own UI.
function IEEEAppScreen() {
  const active = useGame((s) => s.inspectId === 'guildhall-app')
  const calm = useGame((s) => s.calm)
  const screenGlow = useRef()
  const ICONS = ['#ffc857', '#5ad1ff', '#7ed957', '#ff7a45', '#a78bfa', '#ff9ab0']

  useFrame((s, dt) => {
    const t = s.clock.elapsedTime
    const k = 1 - Math.exp(-6 * dt)
    if (screenGlow.current) {
      const pulse = calm ? 0.7 : 0.6 + Math.sin(t * 2.4) * 0.1
      const target = active ? 1.0 : pulse
      screenGlow.current.material.emissiveIntensity += (target - screenGlow.current.material.emissiveIntensity) * k
    }
  })

  return (
    <group>
      <Slab args={[0.45, 0.9, 0.06]} position={[0, 0, 0]} color="#181b21" radius={0.06} />
      <mesh ref={screenGlow} position={[0, 0.02, 0.035]}>
        <planeGeometry args={[0.36, 0.72]} />
        <meshStandardMaterial color="#0d1016" emissive="#e8f0ff" emissiveIntensity={0.6} toneMapped={false} />
      </mesh>
      {ICONS.map((color, i) => {
        const col = i % 2
        const row = Math.floor(i / 2)
        return (
          <mesh key={i} position={[-0.08 + col * 0.16, 0.28 - row * 0.16, 0.04]}>
            <planeGeometry args={[0.1, 0.1]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} toneMapped={false} />
          </mesh>
        )
      })}
    </group>
  )
}

export default function GuildHall() {
  return (
    <>
      <RoomShell origin={R.origin} accent={R.accent} fill={R.fill} />

      {/* ---- dressing (non-interactive) ---- */}
      <group position={R.origin}>
        <Lamp position={[-2.6, 0.2, -1.6]} />
        {/* small table under the app mockup */}
        <Slab args={[0.6, 0.06, 0.5]} position={[2.6, 0.86, 1.2]} color="#4a3624" radius={0.02} />
        {/* bench */}
        <Slab args={[1.2, 0.12, 0.42]} position={[0, -0.55, 2.2]} color="#3a2f24" radius={0.03} />
        {/* rug */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.88, 0.4]}>
          <planeGeometry args={[3.6, 2.6]} />
          <meshStandardMaterial color="#2a2110" roughness={1} />
        </mesh>
      </group>

      {/* ---- interactables ---- */}
      <Interactable
        id="guildhall-mentees"
        label={O['guildhall-mentees'].label}
        position={O['guildhall-mentees'].position}
        radius={1.0}
        labelY={0.85}
        accent={R.accent}
        kind="mentees"
        haloShape="none"
        lift={false}
      >
        <MenteeWall />
      </Interactable>

      <Interactable
        id="guildhall-opensource"
        label={O['guildhall-opensource'].label}
        position={O['guildhall-opensource'].position}
        radius={0.7}
        labelY={1.3}
        accent={R.accent}
        kind="opensource"
      >
        <OpenSourceTree />
      </Interactable>

      <Interactable
        id="guildhall-app"
        label={O['guildhall-app'].label}
        position={O['guildhall-app'].position}
        radius={0.55}
        labelY={0.6}
        accent={R.accent}
        kind="ieeeapp"
      >
        <IEEEAppScreen />
      </Interactable>

      {/* ---- door — glows with the destination room's own accent ---- */}
      {R.doors.map((d) => (
        <Door key={d.to} to={d.to} position={d.position} rotation={d.rotation} label={d.label} accent={WORLD.rooms[d.to].accent} />
      ))}
    </>
  )
}
