import { Suspense, lazy, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette, DepthOfField } from '@react-three/postprocessing'
import { SoftShadows, AdaptiveDpr } from '@react-three/drei'
import * as THREE from 'three'
import CameraRig, { ISO_DIR } from './CameraRig.jsx'
import BakedProof from './dev/BakedProof.jsx'
import BakedRoom from './BakedRoom.jsx'
import { useGame } from './store.js'
import { WORLD } from '../data/world.js'

// Every room, lazy-loaded — adding a room to the world is adding one entry
// here (plus its data/rooms/*.js module). All rooms stay permanently mounted
// once resolved (proven fine at this scene complexity — a handful of meshes/
// lights/particles per room); lazy-loading only chunks the import so first
// paint doesn't wait on every room's code, not a runtime mount/unmount scheme.
const ROOM_COMPONENTS = {
  threshold: lazy(() => import('./rooms/Threshold.jsx')),
  studio: lazy(() => import('./rooms/Studio.jsx')),
  lab: lazy(() => import('./rooms/Lab.jsx')),
  rooftop: lazy(() => import('./rooms/Rooftop.jsx')),
  library: lazy(() => import('./rooms/Library.jsx')),
  greenhouse: lazy(() => import('./rooms/Greenhouse.jsx')),
  guildhall: lazy(() => import('./rooms/GuildHall.jsx')),
  pitch: lazy(() => import('./rooms/Pitch.jsx')),
}

// dev-only baked-pipeline flags:
//   /?bakedproof          shader proof (runtime placeholder bakes; add &night=1)
//   /?bakedroom           real integration path (loads /models + /textures files)
const DEV_PROOF =
  import.meta.env.DEV && typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : null
const SHOW_BAKED_PROOF = !!DEV_PROOF?.has('bakedproof')
const SHOW_BAKED_ROOM = !!DEV_PROOF?.has('bakedroom')
const PROOF_NIGHT = DEV_PROOF ? Number(DEV_PROOF.get('night') || 0) : 0

// The Studio, once baked: drop studio.glb + its 4 textures in public/ and this
// renders them. Swap this in for <Studio/> in the world when the bake is final.
function BakedStudio() {
  return (
    <BakedRoom
      url="/models/studio.glb"
      day="/textures/studio-day.png"
      night="/textures/studio-night.png"
      neutral="/textures/studio-neutral.png"
      lightMap="/textures/studio-lightmap.png"
      nightMix={PROOF_NIGHT}
      lights={{
        a: { color: '#ff9a5c', strength: 1.3 },
        b: { color: '#ff7a45', strength: 1.5 },
        c: { color: '#5ad1ff', strength: 1.2 },
      }}
    />
  )
}

const start = WORLD.rooms[WORLD.start]
const CAM0 = [
  start.camera.look[0] + ISO_DIR.x * 42,
  start.camera.look[1] + ISO_DIR.y * 42,
  start.camera.look[2] + ISO_DIR.z * 42,
]

// A key light that follows the active room so shadows stay crisp instead of
// smearing across the whole (wide) world. Its colour/intensity also lerp per
// room — Studio keeps a warm practical-lamp key, Lab shifts cooler and harder —
// so the two spaces are lit differently, not just recoloured by one accent light.
function KeyLight() {
  const light = useRef()
  const target = useMemo(() => new THREE.Object3D(), [])
  const cur = useRef(new THREE.Vector3(...start.camera.look))
  const curIntensity = useRef(start.keyIntensity ?? 1.55)
  const roomColors = useMemo(() => {
    const map = {}
    Object.values(WORLD.rooms).forEach((r) => {
      map[r.id] = new THREE.Color(r.keyColor || '#ffe9d2')
    })
    return map
  }, [])
  useEffect(() => {
    if (light.current) light.current.target = target
  }, [target])
  useFrame((_, dt) => {
    const s = useGame.getState()
    const room = WORLD.rooms[s.currentRoom]
    const look = room.camera.look
    const k = 1 - Math.exp(-3 * dt)
    cur.current.x += (look[0] - cur.current.x) * k
    cur.current.y += (look[1] - cur.current.y) * k
    cur.current.z += (look[2] - cur.current.z) * k
    curIntensity.current += ((room.keyIntensity ?? 1.55) - curIntensity.current) * k
    if (light.current) {
      // offsets relative to the room's own look height, not an absolute world
      // Y — a room sitting far above/below origin (e.g. a rooftop reached by
      // a vertical transition) still gets a correctly-placed key light instead
      // of one anchored to Studio/Lab's ground-level Y.
      light.current.position.set(cur.current.x + 6, cur.current.y + 9.8, cur.current.z + 5)
      target.position.set(cur.current.x, cur.current.y - 1.2, cur.current.z)
      target.updateMatrixWorld()
      light.current.color.lerp(roomColors[room.id], k)
      light.current.intensity = curIntensity.current
    }
  })
  return (
    <>
      <primitive object={target} />
      <directionalLight
        ref={light}
        intensity={1.55}
        color="#ffe9d2"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-bias={-0.0004}
      />
    </>
  )
}

// Fog tints toward the active room's own colour (warm dusty air in the Studio,
// cool sealed-room air in the Lab) instead of one fixed global fog constant.
function FogRig() {
  const { scene } = useThree()
  const roomColors = useMemo(() => {
    const map = {}
    Object.values(WORLD.rooms).forEach((r) => {
      map[r.id] = new THREE.Color(r.fogColor || '#0b0d10')
    })
    return map
  }, [])
  useFrame((_, dt) => {
    const s = useGame.getState()
    if (!scene.fog) return
    const k = 1 - Math.exp(-2.4 * dt)
    scene.fog.color.lerp(roomColors[WORLD.rooms[s.currentRoom].id], k)
  })
  return null
}

// Racks focus onto whatever's being inspected and lets the rest of the scene
// fall softly out of focus — turns a click into an actual camera-operator
// focus-pull instead of just a pan+zoom. Neutral (bokehScale -> 0) when idle.
function DepthOfFieldRig() {
  const ref = useRef()
  useFrame((_, dt) => {
    const eff = ref.current
    if (!eff) return
    const s = useGame.getState()
    const room = WORLD.rooms[s.currentRoom]
    const obj = s.inspectId ? WORLD.objects[s.inspectId] : null
    const targetScale = obj ? obj.inspect?.bokeh ?? 2.4 : 0
    const k = 1 - Math.exp(-4 * dt)
    eff.bokehScale += (targetScale - eff.bokehScale) * k
    const p = obj ? obj.position : room.camera.look
    eff.target.x += (p[0] - eff.target.x) * k
    eff.target.y += (p[1] - eff.target.y) * k
    eff.target.z += (p[2] - eff.target.z) * k
  })
  return <DepthOfField ref={ref} target={[0, 1.2, 0]} focusRange={2.6} bokehScale={0} resolutionScale={0.75} />
}

export default function World() {
  const clearInspect = useGame((s) => s.clearInspect)
  const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2)

  return (
    <Canvas
      shadows
      orthographic
      dpr={[1, dpr]}
      camera={{ position: CAM0, zoom: start.camera.zoom, near: 0.1, far: 200 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onCreated={(state) => {
        state.gl.toneMappingExposure = 1.18
        // Dev-only hook for verification scripts (raycast probing, screenshots).
        if (import.meta.env.DEV) window.__three = state
      }}
      onPointerMissed={() => clearInspect()}
    >
      <color attach="background" args={['#0b0d10']} />
      <fog attach="fog" args={['#0b0d10', 52, 100]} />

      <hemisphereLight intensity={0.5} color="#dfe4ff" groundColor="#0b0906" />
      {/* cool fill from the opposite side to shape silhouettes */}
      <directionalLight position={[-8, 6, -4]} intensity={0.35} color="#8aa0ff" />
      <KeyLight />
      <FogRig />
      <SoftShadows size={24} samples={9} focus={0.7} />

      <Suspense fallback={null}>
        {SHOW_BAKED_PROOF ? (
          <BakedProof nightMix={PROOF_NIGHT} />
        ) : SHOW_BAKED_ROOM ? (
          <BakedStudio />
        ) : (
          Object.entries(ROOM_COMPONENTS).map(([id, Room]) => <Room key={id} />)
        )}
      </Suspense>

      <CameraRig />

      <EffectComposer disableNormalPass>
        <Bloom mipmapBlur luminanceThreshold={0.75} intensity={0.7} radius={0.62} />
        <DepthOfFieldRig />
        <Vignette eskil={false} offset={0.28} darkness={0.72} />
      </EffectComposer>
      <AdaptiveDpr pixelated />
    </Canvas>
  )
}
