import { useMemo } from 'react'
import { WORLD } from '../../data/world.js'
import RoomShell from './RoomShell.jsx'
import Interactable from '../Interactable.jsx'
import Door from '../Door.jsx'
import { Slab, CodeScreen, NeuralCore, Lamp } from '../props.jsx'
import { posterAI } from '../../three/posters.js'

const R = WORLD.rooms.lab
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

function Drone() {
  return (
    <group>
      <Slab args={[0.4, 0.12, 0.4]} position={[0, 0, 0]} color="#22262d" radius={0.04} />
      {[[0.3, 0.3], [-0.3, 0.3], [0.3, -0.3], [-0.3, -0.3]].map(([x, z], i) => (
        <group key={i} position={[x, 0.02, z]}>
          <Slab args={[0.28, 0.03, 0.06]} position={[x * 0.3, 0, z * 0.3]} rotation={[0, Math.atan2(z, x), 0]} color="#3a3f47" radius={0.01} />
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.015, 20]} />
            <meshStandardMaterial color="#5ad1ff" emissive="#5ad1ff" emissiveIntensity={0.6} transparent opacity={0.5} toneMapped={false} />
          </mesh>
        </group>
      ))}
      {/* status light */}
      <mesh position={[0, 0.09, 0]}>
        <sphereGeometry args={[0.04, 10, 10]} />
        <meshStandardMaterial color="#58c079" emissive="#58c079" emissiveIntensity={2} toneMapped={false} />
      </mesh>
    </group>
  )
}

export default function Lab() {
  return (
    <>
      <RoomShell origin={R.origin} accent={R.accent} fill={R.fill} />

      {/* ---- dressing ---- */}
      <group position={R.origin}>
        {/* pedestal for the neural core */}
        <Slab args={[1.2, 0.5, 1.2]} position={[0, -0.62, -1.6]} color="#1b1f26" radius={0.05} />
        {/* table for the screen */}
        <Slab args={[2.4, 0.1, 1.0]} position={[1.6, 0.55, -1.6]} color="#22262d" />
        {[[0.7, -1.9], [2.5, -1.9], [0.7, -1.3], [2.5, -1.3]].map(([x, z], i) => (
          <Slab key={i} args={[0.08, 0.55, 0.08]} position={[x, 0.27, z]} color="#181b21" radius={0.02} />
        ))}
        {/* server rack */}
        <Slab args={[0.9, 2.2, 0.7]} position={[-3.6, 0.2, -2.4]} color="#181b21" radius={0.04} />
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={i} position={[-3.16, 1.05 - i * 0.32, -2.4]}>
            <planeGeometry args={[0.02, 0.12]} />
            <meshBasicMaterial color={i % 2 ? '#5ad1ff' : '#58c079'} />
          </mesh>
        ))}
        {/* pedestal for the drone */}
        <Slab args={[1.0, 0.7, 1.0]} position={[-1.5, -0.52, -1.4]} color="#1b1f26" radius={0.05} />
        <Lamp position={[3.2, 0.6, -2.0]} />
        {/* AI poster on the wall */}
        <WallPoster make={posterAI} position={[2.9, 2.35, -3.26]} rotation={[0, 0, 0]} size={[1.1, 1.42]} />
      </group>

      {/* ---- interactables ---- */}
      {/* explicit hitbox: the auto one is wide enough to eclipse the drone
          along the iso view ray, stealing its hover/click */}
      <Interactable id="lab-neural" label={O['lab-neural'].label} position={O['lab-neural'].position} radius={1.1} labelY={1.2} hitbox={[1.7, 1.8, 1.5]}>
        <NeuralCore color="#5ad1ff" />
      </Interactable>

      {/* flat screen gets a screen-shaped hitbox — the default box is deep
          enough in z to eclipse the neural core's hover from the iso camera */}
      <Interactable id="lab-visionguard" label={O['lab-visionguard'].label} position={O['lab-visionguard'].position} radius={0.9} hitbox={[1.5, 1.3, 0.7]}>
        <Slab args={[0.1, 0.3, 0.1]} position={[0, -0.5, 0]} color="#3a3f47" radius={0.02} />
        <Slab args={[1.55, 0.95, 0.08]} position={[0, 0, 0]} color="#0f1216" radius={0.03} />
        <CodeScreen position={[0, 0, 0.05]} size={[1.4, 0.82]} />
      </Interactable>

      <Interactable id="lab-drone" label={O['lab-drone'].label} position={O['lab-drone'].position} radius={0.75} labelY={0.7}>
        <Drone />
      </Interactable>

      {/* ---- door ---- */}
      {R.doors.map((d) => (
        <Door key={d.to} to={d.to} position={d.position} rotation={d.rotation} label={d.label} />
      ))}
    </>
  )
}
