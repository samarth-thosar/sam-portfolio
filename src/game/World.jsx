import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { SoftShadows, AdaptiveDpr } from '@react-three/drei'
import * as THREE from 'three'
import CameraRig, { ISO_DIR } from './CameraRig.jsx'
import Studio from './rooms/Studio.jsx'
import Lab from './rooms/Lab.jsx'
import { useGame } from './store.js'
import { WORLD } from '../data/world.js'

const start = WORLD.rooms[WORLD.start]
const CAM0 = [
  start.camera.look[0] + ISO_DIR.x * 42,
  start.camera.look[1] + ISO_DIR.y * 42,
  start.camera.look[2] + ISO_DIR.z * 42,
]

// A key light that follows the active room so shadows stay crisp instead of
// smearing across the whole (wide) world.
function KeyLight() {
  const light = useRef()
  const target = useMemo(() => new THREE.Object3D(), [])
  const cur = useRef(new THREE.Vector3(...start.camera.look))
  useEffect(() => {
    if (light.current) light.current.target = target
  }, [target])
  useFrame((_, dt) => {
    const s = useGame.getState()
    const look = WORLD.rooms[s.currentRoom].camera.look
    const k = 1 - Math.exp(-3 * dt)
    cur.current.x += (look[0] - cur.current.x) * k
    cur.current.z += (look[2] - cur.current.z) * k
    if (light.current) {
      light.current.position.set(cur.current.x + 6, 11, cur.current.z + 5)
      target.position.set(cur.current.x, 0, cur.current.z)
      target.updateMatrixWorld()
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
      <SoftShadows size={24} samples={9} focus={0.7} />

      <Suspense fallback={null}>
        <Studio />
        <Lab />
      </Suspense>

      <CameraRig />

      <EffectComposer disableNormalPass>
        <Bloom mipmapBlur luminanceThreshold={0.75} intensity={0.7} radius={0.62} />
        <Vignette eskil={false} offset={0.28} darkness={0.72} />
      </EffectComposer>
      <AdaptiveDpr pixelated />
    </Canvas>
  )
}
