import { Sparkles, ContactShadows } from '@react-three/drei'
import { useGame } from '../store.js'

/**
 * Floor + two walls that frame a room, plus its accent fill light and floating
 * dust. Drawn at `origin` in world space; a room's props/interactables are
 * rendered as siblings in absolute coordinates.
 */
export default function RoomShell({ origin = [0, 0, 0], accent = '#ff7a45', fill = '#2a3550' }) {
  const calm = useGame((s) => s.calm)
  return (
    <group position={origin}>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.9, 0]} receiveShadow>
        <planeGeometry args={[11, 9]} />
        <meshStandardMaterial color="#1f242c" roughness={0.94} metalness={0.02} />
      </mesh>
      {/* back wall — runs from the side wall (x=-4.6) to the floor edge, so the
          two walls meet exactly at the corner instead of overshooting */}
      <mesh position={[0.45, 1.6, -3.3]} receiveShadow>
        <planeGeometry args={[10.1, 5.5]} />
        <meshStandardMaterial color="#181d24" roughness={1} />
      </mesh>
      {/* side wall — runs from the back wall (z=-3.3) to the floor edge */}
      <mesh position={[-4.6, 1.6, 0.6]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[7.8, 5.5]} />
        <meshStandardMaterial color="#141920" roughness={1} />
      </mesh>
      {/* skirting accent line where floor meets back wall */}
      <mesh position={[0.45, -0.86, -3.28]}>
        <planeGeometry args={[10.1, 0.03]} />
        <meshBasicMaterial color={accent} transparent opacity={0.25} />
      </mesh>

      <ambientLight intensity={0.3} color={fill} />
      <pointLight position={[2.4, 2.8, 2.4]} intensity={0.7} color={accent} distance={17} />

      {/* soft grounding shadow so props sit in the room */}
      <ContactShadows position={[0, -0.88, 0]} scale={13} blur={2.6} far={4.5} opacity={0.6} color="#000000" />
      {/* warm back-rim for silhouette separation */}
      <pointLight position={[-2, 1.5, -2.6]} intensity={0.55} color="#ff7a45" distance={10} />

      {!calm && (
        <Sparkles
          count={26}
          scale={[8, 4, 7]}
          position={[0, 1.6, 0]}
          size={2}
          speed={0.22}
          opacity={0.32}
          color={accent}
        />
      )}
    </group>
  )
}
