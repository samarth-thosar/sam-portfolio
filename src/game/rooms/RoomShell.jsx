import { Sparkles, ContactShadows } from '@react-three/drei'
import { useGame } from '../store.js'
import { DataMotes } from '../props.jsx'

// Fixed corner insets the wall math is built around (see the derivation in
// the room-expansion plan) — kept constant so wall centers stay correct for
// any floorSize, not just the original [11, 9].
const X_INSET = 0.9
const Z_INSET = 1.2

/**
 * Floor + two walls that frame a room, plus its accent fill light and ambient
 * particle life. Drawn at `origin` in world space; a room's props/interactables
 * are rendered as siblings in absolute coordinates.
 *
 * `floorSize`/`wallsEnabled` let a room diverge from the default boxed L-shape
 * — e.g. a wider hub room, or an open-sky room with no walls at all.
 */
export default function RoomShell({
  origin = [0, 0, 0],
  accent = '#ff7a45',
  fill = '#2a3550',
  rim = accent, // back-rim colour; defaults to accent but a room can diverge (e.g. cool rim in a warm-accent room)
  floorRoughness = 0.94,
  floorMetalness = 0.02,
  particles = 'dust', // 'dust' (warm random drift) | 'data' (motes shuttling rack -> core)
  floorSize = [11, 9],
  wallsEnabled = true,
  wallHeight = 5.5,
}) {
  const calm = useGame((s) => s.calm)
  const [W, D] = floorSize
  const backWallWidth = W - X_INSET
  const backWallZ = -D / 2 + Z_INSET
  const sideWallDepth = D - Z_INSET
  const sideWallX = -W / 2 + X_INSET

  return (
    <group position={origin}>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.9, 0]} receiveShadow>
        <planeGeometry args={floorSize} />
        <meshStandardMaterial color="#1f242c" roughness={floorRoughness} metalness={floorMetalness} />
      </mesh>

      {wallsEnabled && (
        <>
          {/* back wall — runs from the side wall to the floor edge, so the
              two walls meet exactly at the corner instead of overshooting */}
          <mesh position={[0.45, wallHeight / 2 - 1.15, backWallZ]} receiveShadow>
            <planeGeometry args={[backWallWidth, wallHeight]} />
            <meshStandardMaterial color="#181d24" roughness={1} />
          </mesh>
          {/* side wall — runs from the back wall to the floor edge */}
          <mesh position={[sideWallX, wallHeight / 2 - 1.15, 0.6]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
            <planeGeometry args={[sideWallDepth, wallHeight]} />
            <meshStandardMaterial color="#141920" roughness={1} />
          </mesh>
          {/* skirting accent line where floor meets back wall */}
          <mesh position={[0.45, -0.86, backWallZ + 0.02]}>
            <planeGeometry args={[backWallWidth, 0.03]} />
            <meshBasicMaterial color={accent} transparent opacity={0.25} />
          </mesh>
        </>
      )}

      <ambientLight intensity={0.3} color={fill} />
      <pointLight position={[2.4, 2.8, 2.4]} intensity={0.7} color={accent} distance={17} />

      {/* soft grounding shadow so props sit in the room */}
      <ContactShadows position={[0, -0.88, 0]} scale={13} blur={2.6} far={4.5} opacity={0.6} color="#000000" />
      {/* back-rim for silhouette separation — its own colour, not always warm */}
      <pointLight position={[-2, 1.5, -2.6]} intensity={0.55} color={rim} distance={10} />

      {!calm && particles === 'dust' && (
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
      {!calm && particles === 'data' && <DataMotes color={accent} />}
    </group>
  )
}
