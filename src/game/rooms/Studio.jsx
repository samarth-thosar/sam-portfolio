import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { WORLD } from '../../data/world.js'
import RoomShell from './RoomShell.jsx'
import Interactable from '../Interactable.jsx'
import Door from '../Door.jsx'
import Ladder from '../Ladder.jsx'
import { Slab, IDEScreen, Lamp, Plant } from '../props.jsx'
import { posterEight, posterDraftStamp } from '../../three/posters.js'
import { useGame } from '../store.js'

const R = WORLD.rooms.studio
const O = WORLD.objects

function WallPoster({ make, position, rotation, size }) {
  const tex = useMemo(make, [make])
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  )
}

// Two IEEE papers + the ACM CHI submission "under review" — idles with a
// slow settle (as if caught by the AC), and on inspect the top page lifts
// and turns slightly, like being picked up to read.
function Papers() {
  const active = useGame((s) => s.inspectId === 'studio-papers')
  const calm = useGame((s) => s.calm)
  const top = useRef()
  const stampTex = useMemo(posterDraftStamp, [])
  const wasActive = useRef(false)
  const liftT = useRef(null)

  useFrame((s, dt) => {
    if (active && !wasActive.current) liftT.current = s.clock.elapsedTime
    wasActive.current = active
    const t = s.clock.elapsedTime
    let liftY = 0
    let liftRot = 0
    if (liftT.current !== null) {
      const p = Math.min(1, (t - liftT.current) / 0.5)
      const ease = 1 - Math.pow(1 - p, 3)
      liftY = Math.sin(ease * Math.PI) * 0.05
      liftRot = Math.sin(ease * Math.PI) * 0.12
    }
    if (top.current) {
      const idleSettle = calm ? 0 : Math.sin(t * 0.7) * 0.008
      const k = 1 - Math.exp(-6 * dt)
      top.current.position.y += (0.06 + liftY - top.current.position.y) * k
      top.current.rotation.x += (idleSettle + liftRot - top.current.rotation.x) * k
    }
  })

  return (
    <group>
      {[0, 1].map((i) => (
        <Slab
          key={i}
          args={[0.62, 0.02, 0.44]}
          position={[i * 0.03, i * 0.03, i * 0.02]}
          rotation={[0, i * 0.12, 0]}
          color={i === 1 ? '#e9e4da' : '#d8d2c6'}
          radius={0.005}
        />
      ))}
      <group ref={top} position={[0.06, 0.06, 0.04]} rotation={[0, 0.24, 0]}>
        <Slab args={[0.62, 0.02, 0.44]} position={[0, 0, 0]} color="#f2efe9" radius={0.005} />
        {/* ACM CHI "under review" stamp on the top page's corner */}
        <mesh position={[0.18, 0.012, -0.13]} rotation={[-Math.PI / 2, 0, -0.3]}>
          <planeGeometry args={[0.22, 0.13]} />
          <meshBasicMaterial map={stampTex} transparent toneMapped={false} />
        </mesh>
      </group>
    </group>
  )
}

// The systems-thinking sketch — sketch lines fade in staggered every time the
// board is inspected (an idea assembling itself), and the frame brightens on
// hover instead of the board physically lifting off the wall it's mounted to.
function Whiteboard() {
  const hovered = useGame((s) => s.hoverId === 'studio-whiteboard')
  const active = useGame((s) => s.inspectId === 'studio-whiteboard')
  const discovered = useGame((s) => s.discovered.includes('studio-whiteboard'))
  const calm = useGame((s) => s.calm)
  const wasActive = useRef(false)
  const revealT = useRef(null)
  const lineRefs = useRef([])
  const glow = useRef()
  const phase = useMemo(() => Math.random() * Math.PI * 2, [])
  const LINES = [
    [-0.5, 0.3, 0.9],
    [0.2, -0.1, 0.6],
    [-0.2, -0.35, 1.1],
  ]

  useFrame((s, dt) => {
    if (active && !wasActive.current) revealT.current = s.clock.elapsedTime
    wasActive.current = active
    const t = s.clock.elapsedTime
    const k = 1 - Math.exp(-8 * dt)
    // calm mode: skip the staggered per-line reveal, just settle to the target
    const staggerDur = calm ? 0.001 : 0.45
    const staggerGap = calm ? 0 : 0.22
    LINES.forEach((_, i) => {
      const mesh = lineRefs.current[i]
      if (!mesh) return
      let target = 0.5
      if (revealT.current !== null) {
        const p = Math.min(1, Math.max(0, (t - revealT.current - i * staggerGap) / staggerDur))
        target = p * 0.5
      }
      mesh.material.opacity += (target - mesh.material.opacity) * k
    })
    if (glow.current) {
      // the only affordance this wall-mounted board gets (no ring, no lift) —
      // a gentle idle breathing so it doesn't read as inert set-dressing
      const pulse = calm ? 0 : Math.sin(t * 2.2 + phase) * 0.5 + 0.5
      const idle = discovered ? 0.1 : 0.08 + pulse * 0.08
      const target = hovered ? 0.4 : idle
      glow.current.material.opacity += (target - glow.current.material.opacity) * k
    }
  })

  return (
    <group>
      {/* hover glow frame, in-plane — this board is wall-mounted and can't float */}
      <mesh ref={glow} position={[0, 0, -0.01]}>
        <planeGeometry args={[2.35, 1.55]} />
        <meshBasicMaterial color={R.accent} transparent opacity={0.08} />
      </mesh>
      <Slab args={[2.2, 1.4, 0.06]} position={[0, 0, 0]} color="#1b1f26" radius={0.03} />
      <mesh position={[0, 0, 0.035]}>
        <planeGeometry args={[2.05, 1.25]} />
        <meshStandardMaterial color="#12151a" roughness={0.7} />
      </mesh>
      {LINES.map(([x, y, w], i) => (
        <mesh key={i} ref={(el) => (lineRefs.current[i] = el)} position={[x, y, 0.045]}>
          <planeGeometry args={[w, 0.02]} />
          <meshBasicMaterial color={R.accent} transparent opacity={0} />
        </mesh>
      ))}
    </group>
  )
}

export default function Studio() {
  const monitorActive = useGame((s) => s.inspectId === 'studio-monitor')

  return (
    <>
      <RoomShell origin={R.origin} accent={R.accent} fill={R.fill} floorSize={R.floorSize} />

      {/* ---- dressing (non-interactive) ---- */}
      <group position={R.origin}>
        {/* desk */}
        <Slab args={[3.6, 0.12, 1.25]} position={[-0.5, 0.78, -1.7]} color="#3a2f24" />
        {[[-2.1, -2.2], [1.1, -2.2], [-2.1, -1.2], [1.1, -1.2]].map(([x, z], i) => (
          <Slab key={i} args={[0.1, 0.78, 0.1]} position={[x, 0.39, z]} color="#2c231a" radius={0.02} />
        ))}
        <Lamp position={[-2.3, 0.84, -2.0]} />
        {/* front-left corner, clear of the doorway sightline */}
        <Plant position={[-3.8, -0.9, 1.4]} />
        {/* chair */}
        <Slab args={[0.8, 0.1, 0.8]} position={[-0.5, 0.5, -0.2]} color="#6b4a34" radius={0.05} />
        <Slab args={[0.8, 0.8, 0.1]} position={[-0.5, 0.95, -0.55]} color="#6b4a34" radius={0.05} />
        {/* rug */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.3, -0.88, 0.2]}>
          <planeGeometry args={[3, 2]} />
          <meshStandardMaterial color="#241c14" roughness={1} />
        </mesh>

        {/* desk clutter — density + character */}
        {/* keyboard */}
        <Slab args={[0.85, 0.045, 0.3]} position={[-1.4, 0.86, -1.05]} color="#20242b" radius={0.02} />
        {/* mug */}
        <mesh position={[0.75, 0.95, -1.25]} castShadow>
          <cylinderGeometry args={[0.09, 0.08, 0.2, 16]} />
          <meshStandardMaterial color="#c65a3a" roughness={0.6} />
        </mesh>
        {/* small book stack */}
        {[0, 1, 2].map((i) => (
          <Slab
            key={i}
            args={[0.5, 0.08, 0.34]}
            position={[1.4, 0.88 + i * 0.09, -2.0]}
            rotation={[0, i * 0.14, 0]}
            color={['#3f6d55', '#b5502f', '#2f4a6b'][i]}
            radius={0.01}
          />
        ))}
        {/* wall poster — the No.8 */}
        <WallPoster make={posterEight} position={[2.9, 2.35, -3.26]} rotation={[0, 0, 0]} size={[1.1, 1.42]} />
      </group>

      {/* ---- interactables ---- */}
      <Interactable
        id="studio-monitor"
        label={O['studio-monitor'].label}
        position={O['studio-monitor'].position}
        radius={0.95}
        accent={R.accent}
        kind="monitor"
      >
        {/* monitor */}
        <Slab args={[0.1, 0.34, 0.1]} position={[0, -0.5, 0]} color="#3a3f47" radius={0.02} />
        <Slab args={[0.5, 0.05, 0.28]} position={[0, -0.66, 0]} color="#3a3f47" radius={0.02} />
        <Slab args={[1.55, 0.95, 0.08]} position={[0, 0, 0]} color="#0f1216" radius={0.03} />
        <IDEScreen position={[0, 0, 0.05]} size={[1.4, 0.82]} active={monitorActive} />
      </Interactable>

      <Interactable
        id="studio-papers"
        label={O['studio-papers'].label}
        position={O['studio-papers'].position}
        radius={0.55}
        labelY={0.5}
        accent={R.accent}
        kind="papers"
      >
        <Papers />
      </Interactable>

      <Interactable
        id="studio-whiteboard"
        label={O['studio-whiteboard'].label}
        position={O['studio-whiteboard'].position}
        radius={1.2}
        labelY={0.95}
        accent={R.accent}
        kind="whiteboard"
        haloShape="none"
        lift={false}
      >
        <Whiteboard />
      </Interactable>

      {/* ---- doors/ladder — each glows with its destination room's own accent,
          foreshadowing the mood shift before you arrive ---- */}
      {R.doors.map((d) => {
        const Trigger = d.kind === 'ladder' ? Ladder : Door
        return (
          <Trigger
            key={d.to}
            to={d.to}
            position={d.position}
            rotation={d.rotation}
            label={d.label}
            accent={WORLD.rooms[d.to].accent}
          />
        )
      })}
    </>
  )
}
