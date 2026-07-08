import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  OrbitControls,
  ContactShadows,
  RoundedBox,
  Float,
  AdaptiveDpr,
} from '@react-three/drei'
import { Suspense, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { prefersReducedMotion } from '../lib/lenis.js'

/* -------------------------------------------------------------- */
/*  Guided tour — camera stops, each framing one part of the room  */
/* -------------------------------------------------------------- */
export const STATIONS = [
  {
    id: 'welcome',
    pos: [7.5, 5.5, 7.5],
    target: [0, 0.2, 0],
    title: 'Come on in.',
    body: "This is where I think and build. Take a look around — I'll show you the pieces that make me tick.",
  },
  {
    id: 'desk',
    pos: [2.4, 1.5, 1.4],
    target: [-1.4, 0.4, -2.8],
    title: 'The workbench',
    body: 'Where it happens — AI document-intelligence platforms, full-stack systems, drone health monitoring. I architect both ends and make them ship.',
  },
  {
    id: 'eight',
    pos: [-0.6, 1.7, 1.2],
    target: [-1.9, 1.5, -3.9],
    title: 'No. 8',
    body: 'Box-to-box in football, same in engineering: I cover the whole pitch — from data to deployment. The playmaker who connects the team.',
  },
  {
    id: 'marathon',
    pos: [2.0, 1.7, 1.1],
    target: [0.6, 1.5, -3.9],
    title: '42.195 km',
    body: "Distance running taught me pace. I don't sprint at problems — I hold a rhythm until they're solved.",
  },
  {
    id: 'ai',
    pos: [-0.8, 1.4, -0.6],
    target: [-3.9, 1.3, -1.6],
    title: 'AI · GenAI · RAG',
    body: 'My playground — LLM workflows, retrieval systems, deepfake detection, prompt-driven tools. I like making models genuinely useful.',
  },
  {
    id: 'shelf',
    pos: [-1.0, 0.8, 0.9],
    target: [-3.8, 0.5, -1.4],
    title: 'Always learning',
    body: 'Two IEEE papers, a CHI submission, and a shelf that keeps growing. Curiosity is the engine.',
  },
  {
    id: 'football',
    pos: [-0.7, 0.0, 3.2],
    target: [-2.4, -1.2, 1.9],
    title: 'The beautiful game',
    body: 'Team sport rewired how I work: read the field, trust the system, set others up to score.',
  },
  {
    id: 'shoes',
    pos: [3.6, 0.5, 2.6],
    target: [3.0, -1.3, -0.2],
    title: 'Keep moving',
    body: 'Discipline off the screen. Early runs clear the head before the hard problems.',
  },
  {
    id: 'yoga',
    pos: [3.2, 1.1, 3.4],
    target: [1.7, -1.4, 1.1],
    title: 'Balance',
    body: 'Focus and calm under pressure. The tense, confusing situations are exactly where I do my best thinking.',
  },
]

const _pos = new THREE.Vector3()
const _tgt = new THREE.Vector3()

function CameraRig({ station }) {
  const { camera } = useThree()
  const tgt = useRef(
    new THREE.Vector3(
      STATIONS[0].target[0],
      STATIONS[0].target[1],
      STATIONS[0].target[2]
    )
  )
  useFrame((_, delta) => {
    const s = STATIONS[Math.max(0, Math.min(STATIONS.length - 1, station))]
    const k = Math.min(1, delta * 2.4) // frame-rate independent easing
    _pos.set(s.pos[0], s.pos[1], s.pos[2])
    _tgt.set(s.target[0], s.target[1], s.target[2])
    camera.position.lerp(_pos, k)
    tgt.current.lerp(_tgt, k)
    camera.lookAt(tgt.current)
  })
  return null
}
import {
  posterEight,
  posterMarathon,
  posterAI,
  screenCode,
} from './posters.js'

/* palette */
const C = {
  wall: '#191d24',
  wallSide: '#141820',
  floor: '#2a2119',
  floorRug: '#ff7a45',
  wood: '#3a2f24',
  woodDark: '#2c231a',
  metal: '#454b54',
  dark: '#0f1216',
  cream: '#e9e4da',
  leather: '#6b4a34',
  plant: '#4e7a52',
  amber: '#ff7a45',
}

function Box({ args, position, rotation, color, metalness = 0.1, roughness = 0.8, ...rest }) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow {...rest}>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
    </mesh>
  )
}

function Poster({ texture, position, rotation, size = [1.5, 1.95] }) {
  const tex = useMemo(texture, [texture])
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  )
}

function Desk() {
  return (
    <group position={[-1.1, 0, -3.05]}>
      {/* top */}
      <RoundedBox args={[3.4, 0.14, 1.3]} radius={0.04} position={[0, 1.35, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={C.wood} roughness={0.7} />
      </RoundedBox>
      {/* legs */}
      {[[-1.6, -0.55], [1.6, -0.55], [-1.6, 0.55], [1.6, 0.55]].map(([x, z], i) => (
        <Box key={i} args={[0.12, 1.35, 0.12]} position={[x, 0.68, z]} color={C.woodDark} />
      ))}
    </group>
  )
}

function Monitor() {
  const screen = useMemo(screenCode, [])
  return (
    <group position={[-1.9, 1.42, -3.2]}>
      {/* stand */}
      <Box args={[0.5, 0.06, 0.3]} position={[0, 0, 0]} color={C.metal} metalness={0.6} roughness={0.4} />
      <Box args={[0.1, 0.4, 0.1]} position={[0, 0.22, 0]} color={C.metal} metalness={0.6} roughness={0.4} />
      {/* body */}
      <RoundedBox args={[1.7, 1.0, 0.07]} radius={0.03} position={[0, 0.95, 0]} castShadow>
        <meshStandardMaterial color={C.dark} roughness={0.5} />
      </RoundedBox>
      {/* screen */}
      <mesh position={[0, 0.95, 0.041]}>
        <planeGeometry args={[1.56, 0.88]} />
        <meshBasicMaterial map={screen} toneMapped={false} />
      </mesh>
      {/* screen glow */}
      <pointLight position={[0, 0.95, 0.5]} intensity={2.2} distance={3} color="#3a6ea5" />
    </group>
  )
}

function Laptop() {
  const screen = useMemo(screenCode, [])
  return (
    <group position={[0.35, 1.42, -2.85]} rotation={[0, -0.5, 0]}>
      {/* base */}
      <RoundedBox args={[1.0, 0.05, 0.7]} radius={0.02} position={[0, 0, 0]} castShadow>
        <meshStandardMaterial color={C.metal} metalness={0.7} roughness={0.35} />
      </RoundedBox>
      {/* lid */}
      <group position={[0, 0, -0.34]} rotation={[-1.15, 0, 0]}>
        <RoundedBox args={[1.0, 0.7, 0.04]} radius={0.02} position={[0, 0.35, 0]} castShadow>
          <meshStandardMaterial color={C.metal} metalness={0.7} roughness={0.35} />
        </RoundedBox>
        <mesh position={[0, 0.35, 0.023]}>
          <planeGeometry args={[0.92, 0.62]} />
          <meshBasicMaterial map={screen} toneMapped={false} />
        </mesh>
      </group>
    </group>
  )
}

function Chair() {
  return (
    <group position={[-1.0, 0, -1.7]} rotation={[0, 0.2, 0]}>
      <RoundedBox args={[0.9, 0.12, 0.9]} radius={0.05} position={[0, 0.95, 0]} castShadow>
        <meshStandardMaterial color={C.leather} roughness={0.6} />
      </RoundedBox>
      <RoundedBox args={[0.9, 1.0, 0.12]} radius={0.05} position={[0, 1.5, -0.4]} castShadow>
        <meshStandardMaterial color={C.leather} roughness={0.6} />
      </RoundedBox>
      {/* central pole + base */}
      <Box args={[0.1, 0.9, 0.1]} position={[0, 0.45, 0]} color={C.metal} metalness={0.6} roughness={0.4} />
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2
        return (
          <Box
            key={i}
            args={[0.5, 0.08, 0.08]}
            position={[Math.cos(a) * 0.28, 0.06, Math.sin(a) * 0.28]}
            rotation={[0, -a, 0]}
            color={C.metal}
            metalness={0.6}
            roughness={0.4}
          />
        )
      })}
    </group>
  )
}

function Shelf() {
  return (
    <group position={[-3.82, 0, -1.4]}>
      {[2.2, 1.5].map((y, r) => (
        <RoundedBox key={r} args={[0.5, 0.08, 2.2]} radius={0.02} position={[0, y, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={C.wood} roughness={0.7} />
        </RoundedBox>
      ))}
      {/* books on top shelf */}
      {[-0.8, -0.55, -0.3, -0.05, 0.5, 0.75].map((z, i) => (
        <Box
          key={i}
          args={[0.32, 0.5 + (i % 3) * 0.08, 0.12]}
          position={[0, 2.5 + ((0.5 + (i % 3) * 0.08) - 0.5) / 2, z]}
          color={[C.amber, C.cream, C.plant, C.leather, C.metal, C.amber][i]}
          roughness={0.85}
        />
      ))}
    </group>
  )
}

function Football({ position }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <sphereGeometry args={[0.32, 24, 24]} />
        <meshStandardMaterial color={C.cream} roughness={0.55} />
      </mesh>
      {/* a couple of pentagon-ish patches */}
      {[
        [0, 0.32, 0],
        [0.28, 0.1, 0.1],
        [-0.2, -0.05, 0.24],
        [0.05, -0.28, -0.14],
      ].map((p, i) => (
        <mesh key={i} position={p} scale={0.12} castShadow>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={C.dark} roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

function Shoe({ position, rotation }) {
  return (
    <group position={position} rotation={rotation}>
      <RoundedBox args={[0.7, 0.22, 0.32]} radius={0.1} position={[0, 0.13, 0]} castShadow>
        <meshStandardMaterial color={C.amber} roughness={0.6} />
      </RoundedBox>
      <RoundedBox args={[0.4, 0.22, 0.3]} radius={0.09} position={[0.16, 0.28, 0]} castShadow>
        <meshStandardMaterial color={C.cream} roughness={0.6} />
      </RoundedBox>
    </group>
  )
}

function YogaMat({ position }) {
  return (
    <group position={position}>
      <RoundedBox args={[2.2, 0.05, 0.9]} radius={0.03} position={[0, 0.03, 0]} receiveShadow castShadow>
        <meshStandardMaterial color={C.floorRug} roughness={0.9} />
      </RoundedBox>
      {/* rolled end */}
      <mesh position={[1.0, 0.13, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.13, 0.13, 0.9, 20]} />
        <meshStandardMaterial color={'#e0673a'} roughness={0.9} />
      </mesh>
    </group>
  )
}

function Plant({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.22, 0.7, 16]} />
        <meshStandardMaterial color={C.woodDark} roughness={0.8} />
      </mesh>
      {[
        [0, 1.1, 0, 1],
        [0.18, 1.0, 0.1, 0.8],
        [-0.15, 1.05, -0.08, 0.85],
        [0.05, 1.25, -0.12, 0.7],
      ].map(([x, y, z, s], i) => (
        <mesh key={i} position={[x, y, z]} scale={s} castShadow>
          <coneGeometry args={[0.28, 0.9, 8]} />
          <meshStandardMaterial color={C.plant} roughness={0.85} />
        </mesh>
      ))}
    </group>
  )
}

function Lamp() {
  return (
    <group position={[-2.55, 1.42, -3.25]}>
      <Box args={[0.28, 0.05, 0.28]} position={[0, 0.02, 0]} color={C.metal} metalness={0.6} roughness={0.4} />
      <Box args={[0.05, 0.9, 0.05]} position={[0, 0.45, 0]} color={C.metal} metalness={0.6} roughness={0.4} />
      <Box args={[0.06, 0.5, 0.06]} position={[0.2, 0.85, 0]} rotation={[0, 0, -0.9]} color={C.metal} metalness={0.6} roughness={0.4} />
      <mesh position={[0.42, 1.0, 0]} rotation={[0, 0, -0.6]} castShadow>
        <coneGeometry args={[0.18, 0.25, 16, 1, true]} />
        <meshStandardMaterial color={C.amber} roughness={0.5} side={THREE.DoubleSide} emissive={C.amber} emissiveIntensity={0.4} />
      </mesh>
      <pointLight position={[0.5, 0.9, 0]} intensity={6} distance={5} decay={2} color="#ff9a5c" castShadow />
    </group>
  )
}

function RoomContent() {
  return (
    <group position={[0, -1.6, 0]}>
      {/* ---- shell ---- */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[9, 9]} />
        <meshStandardMaterial color={C.floor} roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.5, -4]} receiveShadow>
        <planeGeometry args={[9, 5]} />
        <meshStandardMaterial color={C.wall} roughness={1} />
      </mesh>
      <mesh position={[-4, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[9, 5]} />
        <meshStandardMaterial color={C.wallSide} roughness={1} />
      </mesh>

      {/* ---- posters ---- */}
      <Poster texture={posterEight} position={[-1.9, 3.1, -3.94]} rotation={[0, 0, 0]} size={[1.35, 1.75]} />
      <Poster texture={posterMarathon} position={[0.6, 3.1, -3.94]} rotation={[0, 0, 0]} size={[1.35, 1.75]} />
      <Poster texture={posterAI} position={[-3.93, 3.0, -1.6]} rotation={[0, Math.PI / 2, 0]} size={[1.3, 1.7]} />

      {/* ---- furniture ---- */}
      <Desk />
      <Monitor />
      <Laptop />
      <Lamp />
      <Chair />
      <Shelf />
      <Plant position={[3.1, 0, -3.0]} />

      {/* ---- personality props ---- */}
      <YogaMat position={[1.7, 0, 1.1]} />
      <Football position={[-2.4, 0.32, 1.9]} />
      <Shoe position={[2.9, 0, -0.4]} rotation={[0, -0.4, 0]} />
      <Shoe position={[3.15, 0, 0.05]} rotation={[0, -0.7, 0]} />

      {/* grounding shadow */}
      <ContactShadows position={[0, 0.01, 0]} opacity={0.5} scale={12} blur={2.4} far={5} />
    </group>
  )
}

export default function Room({ station = 0, mode = 'tour' }) {
  const reduced = prefersReducedMotion()
  const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 1.8)

  return (
    <Canvas
      shadows
      dpr={[1, dpr]}
      camera={{ position: [7.5, 5.5, 7.5], fov: 34 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ width: '100%', height: '100%' }}
    >
      <color attach="background" args={['#0b0d10']} />
      <fog attach="fog" args={['#0b0d10', 14, 26]} />

      {/* lighting */}
      <ambientLight intensity={0.55} color="#cdd6ff" />
      <directionalLight
        position={[6, 9, 5]}
        intensity={1.1}
        color="#fff2e6"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0004}
      />
      <pointLight position={[3, 4, 4]} intensity={0.5} color="#ff9a5c" />

      <Suspense fallback={null}>
        <Float speed={reduced ? 0 : 1} rotationIntensity={0} floatIntensity={reduced ? 0 : 0.3} floatingRange={[-0.04, 0.04]}>
          <RoomContent />
        </Float>
      </Suspense>

      {mode === 'explore' ? (
        <OrbitControls
          makeDefault
          enablePan={false}
          enableZoom
          minDistance={5}
          maxDistance={16}
          minPolarAngle={0.35}
          maxPolarAngle={Math.PI / 2.15}
          minAzimuthAngle={-0.2}
          maxAzimuthAngle={Math.PI / 2 + 0.2}
          enableDamping
          dampingFactor={0.08}
          autoRotate={!reduced}
          autoRotateSpeed={0.4}
          target={[0, 0.2, 0]}
        />
      ) : (
        <CameraRig station={station} />
      )}
      <AdaptiveDpr pixelated />
    </Canvas>
  )
}
