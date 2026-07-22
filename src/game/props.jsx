import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Instances, Instance } from '@react-three/drei'
import * as THREE from 'three'
import { useGame } from './store.js'
import { drawIDE, drawGradCam, drawStackIQ } from '../three/posters.js'

/* Reusable greybox props. Simple forms, but each one is *alive* — screens
   flicker, cores rotate, lamps breathe — so the world never feels static. */

const CHARCOAL = '#14171c'
const CHARCOAL_D = '#0f1216'

export function Slab({ args, position, rotation, color = CHARCOAL, radius = 0.04, ...rest }) {
  return (
    <RoundedBox
      args={args}
      radius={radius}
      smoothness={3}
      position={position}
      rotation={rotation}
      castShadow
      receiveShadow
      {...rest}
    >
      <meshStandardMaterial color={color} roughness={0.85} metalness={0.05} />
    </RoundedBox>
  )
}

// A glowing display that gently flickers, like a monitor left on.
export function GlowScreen({ position, rotation, size = [1.5, 0.9], color = '#5ad1ff' }) {
  const mat = useRef()
  const calm = useGame((s) => s.calm)
  useFrame((s) => {
    if (!mat.current) return
    const base = 0.85
    mat.current.emissiveIntensity = calm ? base : base + Math.sin(s.clock.elapsedTime * 3.1) * 0.07
  })
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshStandardMaterial
        ref={mat}
        color="#0d1016"
        emissive={color}
        emissiveIntensity={0.85}
        toneMapped={false}
      />
    </mesh>
  )
}

// The Lab's neural sculpture: a slowly rotating wireframe with orbiting nodes
// and a warm/cool core light.
// `active` (isActive from the store, passed in by the room) triggers a "waking
// up" flare on the rising edge — rotation snaps faster and the core brightens,
// then eases back to its idle speed, rather than looking identical whether or
// not it's the thing currently being examined.
export function NeuralCore({ position = [0, 0, 0], color = '#5ad1ff', active = false }) {
  const group = useRef()
  const core = useRef()
  const light = useRef()
  const calm = useGame((s) => s.calm)
  const wasActive = useRef(false)
  const flare = useRef(0)
  const nodes = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * Math.PI * 2
        const r = 0.75
        return [Math.cos(a) * r, Math.sin(a * 1.7) * 0.4, Math.sin(a) * r]
      }),
    []
  )
  useFrame((s, dt) => {
    if (active && !wasActive.current) flare.current = 1
    wasActive.current = active
    flare.current = Math.max(0, flare.current - dt * 0.6)
    if (group.current && !calm) {
      group.current.rotation.y += dt * 0.3 * (1 + flare.current * 3)
      group.current.rotation.x = Math.sin(s.clock.elapsedTime * 0.4) * 0.12
    }
    if (light.current) light.current.intensity = 3 + flare.current * 5
    if (core.current) core.current.material.emissiveIntensity = 2 + flare.current * 2.5
  })
  return (
    <group position={position} ref={group}>
      <mesh>
        <icosahedronGeometry args={[0.8, 1]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.5} />
      </mesh>
      <mesh ref={core} scale={0.35}>
        <icosahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} toneMapped={false} />
      </mesh>
      {nodes.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.6} toneMapped={false} />
        </mesh>
      ))}
      <pointLight ref={light} color={color} intensity={3} distance={6} decay={2} />
    </group>
  )
}

// studio-monitor's screen: real IDE chrome that "types in" a fresh log line
// the instant it becomes the inspected object — a genuine wake beat, not just
// the ambient flicker every screen in the world previously shared.
export function IDEScreen({ position, rotation, size = [1.4, 0.82], active = false }) {
  const canvas = useMemo(() => Object.assign(document.createElement('canvas'), { width: 640, height: 400 }), [])
  const ctx2d = useMemo(() => canvas.getContext('2d'), [canvas])
  const tex = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [canvas])
  const mat = useRef()
  const calm = useGame((s) => s.calm)
  const wasActive = useRef(false)
  const typeStart = useRef(null)
  const FULL_LEN = 52

  useEffect(() => {
    drawIDE(ctx2d, canvas.width, canvas.height, { typedChars: 999 })
    tex.needsUpdate = true
  }, [ctx2d, canvas, tex])

  useFrame((s) => {
    if (active && !wasActive.current) typeStart.current = s.clock.elapsedTime
    wasActive.current = active
    if (typeStart.current !== null) {
      const chars = Math.floor(((s.clock.elapsedTime - typeStart.current) / 0.9) * FULL_LEN)
      drawIDE(ctx2d, canvas.width, canvas.height, { typedChars: chars })
      tex.needsUpdate = true
      if (chars >= FULL_LEN + 4) typeStart.current = null
    }
    if (mat.current) mat.current.emissiveIntensity = calm ? 1 : 1 + Math.sin(s.clock.elapsedTime * 3) * 0.06
  })

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshStandardMaterial ref={mat} map={tex} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={1} toneMapped={false} />
    </mesh>
  )
}

// lab-visionguard's screen: a live Grad-CAM detection readout — a moving
// scanline, a pulsing heatmap, and a ticking confidence percentage. Redraws
// are throttled to ~24fps; the canvas content is genuinely different from
// IDEScreen, not a recolour of the same texture.
export function GradCamScreen({ position, rotation, size = [1.4, 0.82], active = false }) {
  const canvas = useMemo(() => Object.assign(document.createElement('canvas'), { width: 512, height: 320 }), [])
  const ctx2d = useMemo(() => canvas.getContext('2d'), [canvas])
  const tex = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [canvas])
  const mat = useRef()
  const calm = useGame((s) => s.calm)
  const wasActive = useRef(false)
  const lockT = useRef(null)
  const acc = useRef(0)

  useFrame((s, dt) => {
    if (active && !wasActive.current) lockT.current = s.clock.elapsedTime
    wasActive.current = active
    if (mat.current) mat.current.emissiveIntensity = calm ? 1 : 1 + Math.sin(s.clock.elapsedTime * 3.2) * 0.05

    acc.current += dt
    if (acc.current < 1 / 24) return
    acc.current = 0

    const t = s.clock.elapsedTime
    const h = canvas.height
    let scanY
    let pct
    if (calm) {
      // frozen readout — no sweep, no ticking percentage
      scanY = h / 2
      pct = 91.6
    } else {
      const sinceLock = lockT.current !== null ? t - lockT.current : Infinity
      const idleY = (Math.sin(t * 0.6) * 0.5 + 0.5) * h
      const BLEND = 0.15 // eases from the lock sweep's endpoint into the idle
      // formula's CURRENT value, instead of jump-cutting to wherever the sine
      // happens to be the instant the 1s lock window ends
      if (sinceLock < 1) {
        scanY = (sinceLock / 1) * h
      } else if (sinceLock < 1 + BLEND) {
        const b = (sinceLock - 1) / BLEND
        scanY = h * (1 - b) + idleY * b
      } else {
        scanY = idleY
      }
      pct = 91.6 + Math.sin(t * 1.7) * 0.35 + (active ? 0.15 : 0)
    }
    drawGradCam(ctx2d, canvas.width, h, { scanY, pct, t })
    tex.needsUpdate = true
  })

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshStandardMaterial ref={mat} map={tex} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={1} toneMapped={false} />
    </mesh>
  )
}

// StackIQ's readout: a 5-stage pipeline (4 read-only, 1 human-gated) cycling
// through what the audit actually finds. On wake the tick cycles faster for
// a beat — "reviewing everything" — before settling to its idle pace.
export function StackIQScreen({ position, rotation, size = [1.4, 0.82], active = false }) {
  const canvas = useMemo(() => Object.assign(document.createElement('canvas'), { width: 512, height: 360 }), [])
  const ctx2d = useMemo(() => canvas.getContext('2d'), [canvas])
  const tex = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [canvas])
  const mat = useRef()
  const calm = useGame((s) => s.calm)
  const wasActive = useRef(false)
  const wakeT = useRef(null)
  const acc = useRef(0)
  const tickAcc = useRef(0)
  const tick = useRef(0)

  useFrame((s, dt) => {
    if (active && !wasActive.current) {
      wakeT.current = s.clock.elapsedTime
      tick.current = 0
      tickAcc.current = 0
    }
    wasActive.current = active
    if (mat.current) mat.current.emissiveIntensity = calm ? 1 : 1 + Math.sin(s.clock.elapsedTime * 3) * 0.05

    if (!calm) {
      const t = s.clock.elapsedTime
      const reviewing = wakeT.current !== null && t - wakeT.current < 1.5
      tickAcc.current += dt
      const tickRate = reviewing ? 0.22 : 0.75
      if (tickAcc.current > tickRate) {
        tickAcc.current = 0
        tick.current++
      }
    }

    acc.current += dt
    if (acc.current < 1 / 24) return
    acc.current = 0
    drawStackIQ(ctx2d, canvas.width, canvas.height, { tick: tick.current, t: s.clock.elapsedTime })
    tex.needsUpdate = true
  })

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshStandardMaterial ref={mat} map={tex} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={1} toneMapped={false} />
    </mesh>
  )
}

// Data motes: small emissive packets that shuttle in straight lines between
// two points (e.g. server rack -> neural core), used in place of Sparkles'
// random dust drift for the Lab — a genuinely different particle *behaviour*,
// not just a recoloured copy of the Studio's dust.
export function DataMotes({ count = 14, from = [-3.2, 0.5, -2.2], to = [0, 0.7, -1.6], color = '#5ad1ff', spread = 0.7 }) {
  const calm = useGame((s) => s.calm)
  const refs = useRef([])
  const phases = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        p: Math.random(),
        speed: 0.12 + Math.random() * 0.16,
        lane: (Math.random() - 0.5) * spread,
      })),
    [count, spread]
  )
  useFrame((_, dt) => {
    if (calm) return
    const dx = to[0] - from[0]
    const dz = to[2] - from[2]
    phases.forEach((ph, i) => {
      ph.p += dt * ph.speed
      if (ph.p > 1) ph.p -= 1
      const inst = refs.current[i]
      if (!inst) return
      inst.position.set(from[0] + dx * ph.p + ph.lane, from[1] + Math.sin(ph.p * Math.PI) * 0.15, from[2] + dz * ph.p)
      const s = 0.5 + Math.sin(ph.p * Math.PI) * 0.6
      inst.scale.setScalar(s)
    })
  })
  return (
    <Instances limit={count} range={count}>
      <boxGeometry args={[0.045, 0.045, 0.045]} />
      <meshBasicMaterial color={color} toneMapped={false} transparent opacity={0.85} />
      {phases.map((_, i) => (
        <Instance key={i} ref={(el) => (refs.current[i] = el)} />
      ))}
    </Instances>
  )
}

// A practical desk lamp that casts a warm pool of light and quietly breathes.
export function Lamp({ position = [0, 0, 0], color = '#ff9a5c' }) {
  const light = useRef()
  const calm = useGame((s) => s.calm)
  useFrame((s) => {
    if (light.current)
      light.current.intensity = calm ? 6 : 6 + Math.sin(s.clock.elapsedTime * 2.3) * 0.5
  })
  return (
    <group position={position}>
      <Slab args={[0.28, 0.05, 0.28]} position={[0, 0.02, 0]} color="#3a3f47" radius={0.02} />
      <Slab args={[0.05, 0.9, 0.05]} position={[0, 0.45, 0]} color="#3a3f47" radius={0.02} />
      <Slab args={[0.06, 0.5, 0.06]} position={[0.2, 0.85, 0]} rotation={[0, 0, -0.9]} color="#3a3f47" radius={0.02} />
      <mesh position={[0.42, 1.0, 0]} rotation={[0, 0, -0.6]}>
        <coneGeometry args={[0.16, 0.24, 18, 1, true]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} side={THREE.DoubleSide} />
      </mesh>
      <pointLight ref={light} position={[0.5, 0.85, 0]} intensity={6} distance={6} decay={2} color={color} castShadow />
    </group>
  )
}

// Simple potted plant with a soft idle sway.
export function Plant({ position = [0, 0, 0] }) {
  const g = useRef()
  const calm = useGame((s) => s.calm)
  useFrame((s) => {
    if (g.current && !calm) g.current.rotation.z = Math.sin(s.clock.elapsedTime * 0.8) * 0.04
  })
  return (
    <group position={position}>
      <mesh position={[0, 0.28, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.16, 0.55, 14]} />
        <meshStandardMaterial color="#2c231a" roughness={0.8} />
      </mesh>
      <group ref={g} position={[0, 0.5, 0]}>
        {[
          [0, 0.5, 0, 1],
          [0.14, 0.42, 0.08, 0.8],
          [-0.12, 0.46, -0.06, 0.85],
        ].map(([x, y, z, sc], i) => (
          <mesh key={i} position={[x, y, z]} scale={sc} castShadow>
            <coneGeometry args={[0.22, 0.7, 8]} />
            <meshStandardMaterial color="#4e7a52" roughness={0.85} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
