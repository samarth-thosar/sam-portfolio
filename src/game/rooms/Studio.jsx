import { useMemo } from 'react'
import { WORLD } from '../../data/world.js'
import RoomShell from './RoomShell.jsx'
import Interactable from '../Interactable.jsx'
import Door from '../Door.jsx'
import { Slab, CodeScreen, Lamp, Plant } from '../props.jsx'
import { posterEight } from '../../three/posters.js'

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

export default function Studio() {
  return (
    <>
      <RoomShell origin={R.origin} accent={R.accent} fill={R.fill} />

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
      <Interactable id="studio-monitor" label={O['studio-monitor'].label} position={O['studio-monitor'].position} radius={0.95}>
        {/* monitor */}
        <Slab args={[0.1, 0.34, 0.1]} position={[0, -0.5, 0]} color="#3a3f47" radius={0.02} />
        <Slab args={[0.5, 0.05, 0.28]} position={[0, -0.66, 0]} color="#3a3f47" radius={0.02} />
        <Slab args={[1.55, 0.95, 0.08]} position={[0, 0, 0]} color="#0f1216" radius={0.03} />
        <CodeScreen position={[0, 0, 0.05]} size={[1.4, 0.82]} />
      </Interactable>

      <Interactable id="studio-papers" label={O['studio-papers'].label} position={O['studio-papers'].position} radius={0.55} labelY={0.5}>
        {[0, 1, 2].map((i) => (
          <Slab key={i} args={[0.62, 0.02, 0.44]} position={[i * 0.03, i * 0.03, i * 0.02]} rotation={[0, i * 0.12, 0]} color={i === 1 ? '#e9e4da' : '#d8d2c6'} radius={0.005} />
        ))}
      </Interactable>

      <Interactable id="studio-whiteboard" label={O['studio-whiteboard'].label} position={O['studio-whiteboard'].position} radius={1.2} labelY={0.95}>
        <Slab args={[2.2, 1.4, 0.06]} position={[0, 0, 0]} color="#1b1f26" radius={0.03} />
        <mesh position={[0, 0, 0.035]}>
          <planeGeometry args={[2.05, 1.25]} />
          <meshStandardMaterial color="#12151a" roughness={0.7} />
        </mesh>
        {/* faint sketch lines */}
        {[[-0.5, 0.3, 0.9], [0.2, -0.1, 0.6], [-0.2, -0.35, 1.1]].map(([x, y, w], i) => (
          <mesh key={i} position={[x, y, 0.045]}>
            <planeGeometry args={[w, 0.02]} />
            <meshBasicMaterial color="#ff7a45" transparent opacity={0.5} />
          </mesh>
        ))}
      </Interactable>

      {/* ---- door ---- */}
      {R.doors.map((d) => (
        <Door key={d.to} to={d.to} position={d.position} rotation={d.rotation} label={d.label} />
      ))}
    </>
  )
}
