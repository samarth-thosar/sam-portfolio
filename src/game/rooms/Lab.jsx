import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { WORLD } from '../../data/world.js'
import RoomShell from './RoomShell.jsx'
import Interactable from '../Interactable.jsx'
import Door from '../Door.jsx'
import { Slab, GradCamScreen, StackIQScreen, NeuralCore, Lamp } from '../props.jsx'
import { posterAI } from '../../three/posters.js'
import { useGame } from '../store.js'

const R = WORLD.rooms.lab
const O = WORLD.objects
const STUDIO_ACCENT = WORLD.rooms.studio.accent

function WallPoster({ make, position, rotation, size }) {
  const tex = useMemo(make, [make])
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  )
}

// The server rack's status LEDs actually chase/blink instead of sitting at a
// fixed colour — a small sonic-less "heartbeat" for the room that pairs with
// the server-hum audio layer. Panel-line trim + a rim strip break its
// silhouette up so it reads as a rack, not an anonymous black slab.
function ServerRack() {
  const ledRefs = useRef([])
  const calm = useGame((s) => s.calm)
  useFrame((s) => {
    if (calm) {
      ledRefs.current.forEach((m) => {
        if (m) m.material.opacity = 0.7
      })
      return
    }
    const t = s.clock.elapsedTime
    ledRefs.current.forEach((m, i) => {
      if (!m) return
      const on = Math.sin(t * 2.4 - i * 0.9) > 0.3
      m.material.opacity = on ? 0.98 : 0.3
    })
  })
  return (
    <group>
      <Slab args={[0.9, 2.2, 0.7]} position={[-3.6, 0.2, -2.4]} color="#181b21" radius={0.04} />
      {/* panel-line trim so the rack reads as paneled equipment, not a flat slab */}
      {[0.68, 0.06, -0.56].map((y, i) => (
        <mesh key={i} position={[-3.16, y, -2.4]}>
          <planeGeometry args={[0.94, 0.025]} />
          <meshBasicMaterial color="#5ad1ff" transparent opacity={0.22} toneMapped={false} />
        </mesh>
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} ref={(el) => (ledRefs.current[i] = el)} position={[-3.15, 1.05 - i * 0.32, -2.4]}>
          <planeGeometry args={[0.055, 0.16]} />
          <meshStandardMaterial
            color={i % 2 ? '#5ad1ff' : '#58c079'}
            emissive={i % 2 ? '#5ad1ff' : '#58c079'}
            emissiveIntensity={1.6}
            transparent
            opacity={0.85}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  )
}

// Predictive-maintenance drone: idle-hovers, its rotors actually spin (a thin
// bright blade streak per rotor, since a rotationally-symmetric blur disc
// can't visibly convey spin), and its status light periodically throws a
// brief amber "diagnostic" blip. On inspect the rotors spin up and the light
// flashes green rapid-fire — "systems nominal" — instead of staying inert.
function Drone({ active = false }) {
  const body = useRef()
  const bladeRefs = useRef([])
  const statusMat = useRef()
  const wasActive = useRef(false)
  const wakeT = useRef(null)
  const calm = useGame((s) => s.calm)

  const rotors = [
    [0.3, 0.3],
    [-0.3, 0.3],
    [0.3, -0.3],
    [-0.3, -0.3],
  ]

  useFrame((s, dt) => {
    const t = s.clock.elapsedTime
    if (active && !wasActive.current) wakeT.current = t
    wasActive.current = active

    if (body.current && !calm) {
      body.current.position.y = Math.sin(t * 1.8) * 0.02
    }
    const spinUp = wakeT.current !== null && t - wakeT.current < 1.2
    const speed = calm ? 0 : spinUp ? 22 : 3.2
    bladeRefs.current.forEach((b, i) => {
      if (b) b.rotation.y += dt * speed * (i % 2 ? 1 : -1)
    })

    if (statusMat.current) {
      let emissive = '#58c079'
      let intensity = 1.6 + Math.sin(t * 2) * 0.3
      if (spinUp) {
        // rapid green flash — "systems nominal" after a wake
        intensity = 2.2 + (Math.sin((t - wakeT.current) * 26) > 0 ? 1.6 : 0)
      } else if (t % 8 < 0.3) {
        // a brief amber diagnostic blip every ~8s
        emissive = '#ffb154'
        intensity = 2.4
      }
      statusMat.current.color.set(emissive)
      statusMat.current.emissive.set(emissive)
      statusMat.current.emissiveIntensity = intensity
    }
  })

  return (
    <group ref={body}>
      <Slab args={[0.4, 0.12, 0.4]} position={[0, 0, 0]} color="#22262d" radius={0.04} />
      {rotors.map(([x, z], i) => (
        <group key={i} position={[x, 0.02, z]}>
          <Slab args={[0.28, 0.03, 0.06]} position={[x * 0.3, 0, z * 0.3]} rotation={[0, Math.atan2(z, x), 0]} color="#3a3f47" radius={0.01} />
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.015, 20]} />
            <meshStandardMaterial color="#5ad1ff" emissive="#5ad1ff" emissiveIntensity={0.6} transparent opacity={0.5} toneMapped={false} />
          </mesh>
          <mesh ref={(el) => (bladeRefs.current[i] = el)} position={[0, 0.06, 0]}>
            <boxGeometry args={[0.3, 0.006, 0.018]} />
            <meshBasicMaterial color="#e9f6ff" transparent opacity={0.55} toneMapped={false} />
          </mesh>
        </group>
      ))}
      {/* status light */}
      <mesh position={[0, 0.09, 0]}>
        <sphereGeometry args={[0.04, 10, 10]} />
        <meshStandardMaterial ref={statusMat} color="#58c079" emissive="#58c079" emissiveIntensity={2} toneMapped={false} />
      </mesh>
    </group>
  )
}

// StackIQ, his newest project: five ascending steps — four lit cyan
// (read-only stages), the fifth lit amber (the one stage that acts, and only
// behind a human-approval gate) — leading up to the terminal screen.
function StackIQ({ active }) {
  const steps = [0, 1, 2, 3, 4]
  return (
    <group>
      {steps.map((i) => {
        const gated = i === 4
        const x = -0.6 + i * 0.3
        const stepH = 0.12 + i * 0.06
        const y = -0.55 + stepH / 2 + i * 0.05
        return (
          <group key={i}>
            <Slab args={[0.24, stepH, 0.24]} position={[x, y, 0]} color="#181b21" radius={0.02} />
            <mesh position={[x, y + stepH / 2 + 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.2, 0.2]} />
              <meshStandardMaterial
                color={gated ? '#ff7a45' : '#5ad1ff'}
                emissive={gated ? '#ff7a45' : '#5ad1ff'}
                emissiveIntensity={gated ? 1.2 : 0.8}
                toneMapped={false}
              />
            </mesh>
          </group>
        )
      })}
      {/* terminal screen at the summit */}
      <Slab args={[0.06, 0.5, 0.06]} position={[0.6, 0.15, 0]} color="#3a3f47" radius={0.02} />
      <Slab args={[0.95, 0.62, 0.05]} position={[0.6, 0.55, 0]} color="#0f1216" radius={0.03} />
      <StackIQScreen position={[0.6, 0.55, 0.035]} size={[0.85, 0.5]} active={active} />
    </group>
  )
}

export default function Lab() {
  const neuralActive = useGame((s) => s.inspectId === 'lab-neural')
  const visionguardActive = useGame((s) => s.inspectId === 'lab-visionguard')
  const droneActive = useGame((s) => s.inspectId === 'lab-drone')
  const stackiqActive = useGame((s) => s.inspectId === 'lab-stackiq')

  return (
    <>
      <RoomShell
        origin={R.origin}
        accent={R.accent}
        fill={R.fill}
        rim={R.rim}
        floorRoughness={R.floorRoughness}
        floorMetalness={R.floorMetalness}
        particles={R.particles}
      />

      {/* ---- dressing ---- */}
      <group position={R.origin}>
        {/* pedestal for the neural core */}
        <Slab args={[1.2, 0.5, 1.2]} position={[0, -0.62, -1.6]} color="#1b1f26" radius={0.05} />
        {/* table for the screen */}
        <Slab args={[2.4, 0.1, 1.0]} position={[1.6, 0.55, -1.6]} color="#22262d" />
        {[[0.7, -1.9], [2.5, -1.9], [0.7, -1.3], [2.5, -1.3]].map(([x, z], i) => (
          <Slab key={i} args={[0.08, 0.55, 0.08]} position={[x, 0.27, z]} color="#181b21" radius={0.02} />
        ))}
        <ServerRack />
        {/* pedestal for the drone — kept low/small so the drone stays the
            larger silhouette in frame, not the block it stands near */}
        <Slab args={[0.7, 0.4, 0.7]} position={[-1.5, -0.68, -1.4]} color="#161a20" radius={0.05} />
        <Lamp position={[3.2, 0.6, -2.0]} />
        {/* AI poster on the wall */}
        <WallPoster make={posterAI} position={[2.9, 2.35, -3.26]} rotation={[0, 0, 0]} size={[1.1, 1.42]} />
      </group>

      {/* ---- interactables ---- */}
      {/* explicit hitbox: the auto one is wide enough to eclipse the drone
          along the iso view ray, stealing its hover/click */}
      <Interactable
        id="lab-neural"
        label={O['lab-neural'].label}
        position={O['lab-neural'].position}
        radius={1.1}
        labelY={1.2}
        hitbox={[1.7, 1.8, 1.5]}
        accent={R.accent}
        kind="neural"
      >
        <NeuralCore color="#5ad1ff" active={neuralActive} />
      </Interactable>

      {/* flat screen gets a screen-shaped hitbox — the default box is deep
          enough in z to eclipse the neural core's hover from the iso camera.
          Viewfinder brackets instead of a floor ring — it's literally a detector. */}
      <Interactable
        id="lab-visionguard"
        label={O['lab-visionguard'].label}
        position={O['lab-visionguard'].position}
        radius={0.9}
        hitbox={[1.5, 1.3, 0.7]}
        accent={R.accent}
        kind="screen"
        haloShape="brackets"
        frameSize={[1.7, 1.4]}
      >
        <Slab args={[0.1, 0.3, 0.1]} position={[0, -0.5, 0]} color="#3a3f47" radius={0.02} />
        <Slab args={[1.55, 0.95, 0.08]} position={[0, 0, 0]} color="#0f1216" radius={0.03} />
        <GradCamScreen position={[0, 0, 0.05]} size={[1.4, 0.82]} active={visionguardActive} />
      </Interactable>

      <Interactable
        id="lab-drone"
        label={O['lab-drone'].label}
        position={O['lab-drone'].position}
        radius={0.75}
        labelY={0.7}
        accent={R.accent}
        kind="drone"
      >
        <Drone active={droneActive} />
      </Interactable>

      <Interactable
        id="lab-stackiq"
        label={O['lab-stackiq'].label}
        position={O['lab-stackiq'].position}
        radius={0.85}
        hitbox={[1.7, 1.3, 0.7]}
        labelY={0.9}
        accent={R.accent}
        kind="stackiq"
      >
        <StackIQ active={stackiqActive} />
      </Interactable>

      {/* ---- door — glows with the STUDIO's accent, foreshadowing the warmth ---- */}
      {R.doors.map((d) => (
        <Door key={d.to} to={d.to} position={d.position} rotation={d.rotation} label={d.label} accent={STUDIO_ACCENT} />
      ))}
    </>
  )
}
