import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { WORLD } from '../../data/world.js'
import RoomShell from './RoomShell.jsx'
import Interactable from '../Interactable.jsx'
import Door from '../Door.jsx'
import { Slab, Lamp } from '../props.jsx'
import { useGame } from '../store.js'

const R = WORLD.rooms.library
const O = WORLD.objects

// Three shelves of colour-coded book spines, authored rather than randomised
// so the shelf reads as deliberately arranged, not procedurally noisy.
const SHELF_ROWS = [
  { y: -0.55, books: [['#7a5c3e', 0.09], ['#5c4a7a', 0.07], ['#3e6b5c', 0.1], ['#8a3b2e', 0.08], ['#3a4a6b', 0.09], ['#6b5c3e', 0.07], ['#4a3f5c', 0.1]] },
  { y: 0.05, books: [['#3a4a6b', 0.08], ['#8a3b2e', 0.09], ['#5c4a7a', 0.07], ['#3e6b5c', 0.09], ['#6b5c3e', 0.08], ['#7a5c3e', 0.1]] },
  { y: 0.65, books: [['#5c4a7a', 0.09], ['#3a4a6b', 0.07], ['#7a5c3e', 0.1], ['#8a3b2e', 0.08], ['#3e6b5c', 0.09], ['#6b5c3e', 0.07], ['#4a3f5c', 0.08]] },
]

function Bookshelf({ position }) {
  return (
    <group position={position}>
      <Slab args={[1.4, 1.6, 0.35]} position={[0, 0, 0]} color="#2c2333" radius={0.03} />
      {SHELF_ROWS.map((row, ri) => {
        let x = -0.6
        return (
          <group key={ri}>
            <Slab args={[1.3, 0.03, 0.32]} position={[0, row.y - 0.22, 0.01]} color="#1f1927" radius={0.01} />
            {row.books.map(([color, w], i) => {
              const bx = x + w / 2
              x += w + 0.015
              return <Slab key={i} args={[w, 0.42, 0.28]} position={[bx, row.y, 0]} color={color} radius={0.006} />
            })}
          </group>
        )
      })}
    </group>
  )
}

// NeoNate Mom, treated tenderly: a small glass dome over a warm light that
// beats like a heartbeat (thump-thump, pause) rather than a flat pulse —
// brightening further on inspect instead of switching to a different idle.
function NeonateExhibit() {
  const active = useGame((s) => s.inspectId === 'library-neonate')
  const calm = useGame((s) => s.calm)
  const dome = useRef()
  const glow = useRef()

  useFrame((s, dt) => {
    const t = s.clock.elapsedTime
    const k = 1 - Math.exp(-6 * dt)
    const cycle = t % 1.4
    let beat = 0
    if (cycle < 0.12) beat = Math.sin((cycle / 0.12) * Math.PI)
    else if (cycle > 0.22 && cycle < 0.34) beat = Math.sin(((cycle - 0.22) / 0.12) * Math.PI) * 0.7
    const domeTarget = calm ? 0.7 : 0.55 + beat * (active ? 1.3 : 0.65)
    if (dome.current) dome.current.material.emissiveIntensity += (domeTarget - dome.current.material.emissiveIntensity) * k
    const glowTarget = (active ? 0.32 : 0.14) + (calm ? 0 : beat * 0.1)
    if (glow.current) glow.current.material.opacity += (glowTarget - glow.current.material.opacity) * k
  })

  return (
    <group>
      <mesh ref={glow} position={[0, 0.05, 0]}>
        <sphereGeometry args={[0.32, 20, 20]} />
        <meshBasicMaterial color="#ffb3c6" transparent opacity={0.14} />
      </mesh>
      <mesh ref={dome} position={[0, 0.05, 0]}>
        <sphereGeometry args={[0.2, 20, 20]} />
        <meshStandardMaterial color="#ffe3ea" emissive="#ff8fa3" emissiveIntensity={0.6} transparent opacity={0.85} toneMapped={false} />
      </mesh>
    </group>
  )
}

// A small hanging constellation of ideas: nodes connected by thin glowing
// rods, rotating slowly as a whole — "everything connects to everything"
// rendered as a literal little network instead of a metaphor in prose alone.
function MindConstellation() {
  const active = useGame((s) => s.inspectId === 'library-constellation')
  const calm = useGame((s) => s.calm)
  const group = useRef()
  const nodeRefs = useRef([])

  const nodes = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2
        const r = 0.5 + (i % 2) * 0.18
        return [Math.cos(a) * r, Math.sin(a * 1.3) * 0.3, Math.sin(a) * r]
      }),
    []
  )
  const edges = useMemo(() => [[0, 2], [2, 4], [4, 0], [1, 3], [3, 5], [5, 1], [0, 1], [2, 3]], [])
  const edgeData = useMemo(
    () =>
      edges.map(([a, b]) => {
        const start = new THREE.Vector3(...nodes[a])
        const end = new THREE.Vector3(...nodes[b])
        const dir = end.clone().sub(start)
        const len = dir.length()
        const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
        return { mid: start.clone().add(end).multiplyScalar(0.5).toArray(), len, quat }
      }),
    [nodes, edges]
  )

  useFrame((s, dt) => {
    if (group.current && !calm) group.current.rotation.y += dt * 0.18
    const t = s.clock.elapsedTime
    nodeRefs.current.forEach((m, i) => {
      if (!m) return
      const pulse = calm ? 0.6 : Math.sin(t * 1.6 + i) * 0.5 + 0.5
      m.material.emissiveIntensity = (active ? 1.6 : 0.9) + pulse * 0.4
    })
  })

  return (
    <group ref={group}>
      {edgeData.map((e, i) => (
        <mesh key={i} position={e.mid} quaternion={e.quat}>
          <cylinderGeometry args={[0.006, 0.006, e.len, 6]} />
          <meshBasicMaterial color={R.accent} transparent opacity={0.35} />
        </mesh>
      ))}
      {nodes.map((p, i) => (
        <mesh key={i} ref={(el) => (nodeRefs.current[i] = el)} position={p}>
          <sphereGeometry args={[0.05, 14, 14]} />
          <meshStandardMaterial color={R.accent} emissive={R.accent} emissiveIntensity={1} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

export default function Library() {
  return (
    <>
      <RoomShell origin={R.origin} accent={R.accent} fill={R.fill} />

      {/* ---- dressing (non-interactive) ---- */}
      <group position={R.origin}>
        <Bookshelf position={[-3.5, 0.85, -2.0]} />
        <Bookshelf position={[3.5, 0.85, -2.0]} />
        <Lamp position={[-1.2, 0.2, 1.6]} />
        {/* small table under the NeoNate exhibit */}
        <Slab args={[0.55, 0.06, 0.55]} position={[-1.2, 0.86, -1.6]} color="#4a3624" radius={0.02} />
        {/* reading chair */}
        <Slab args={[0.8, 0.1, 0.8]} position={[0, 0.05, 1.8]} color="#4a3624" radius={0.05} />
        <Slab args={[0.8, 0.8, 0.1]} position={[0, 0.5, 1.45]} color="#4a3624" radius={0.05} />
        {/* rug */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.88, 0.3]}>
          <planeGeometry args={[3.4, 2.4]} />
          <meshStandardMaterial color="#241f30" roughness={1} />
        </mesh>
      </group>

      {/* ---- interactables ---- */}
      <Interactable
        id="library-neonate"
        label={O['library-neonate'].label}
        position={O['library-neonate'].position}
        radius={0.55}
        labelY={0.55}
        accent={R.accent}
        kind="neonate"
      >
        <NeonateExhibit />
      </Interactable>

      <Interactable
        id="library-constellation"
        label={O['library-constellation'].label}
        position={O['library-constellation'].position}
        radius={0.9}
        labelY={0.9}
        accent={R.accent}
        kind="constellation"
        lift={false}
      >
        <MindConstellation />
      </Interactable>

      {/* ---- door — glows with the destination room's own accent ---- */}
      {R.doors.map((d) => (
        <Door key={d.to} to={d.to} position={d.position} rotation={d.rotation} label={d.label} accent={WORLD.rooms[d.to].accent} />
      ))}
    </>
  )
}
