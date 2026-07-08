import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/* ------------------------------------------------------------------ */
/*  State generators — each returns a Float32Array(count*3) of targets  */
/*  Milestone 1 ships two states (sphere → lattice). More states drop   */
/*  in here later (ball, marathon route, breathing sphere, name).       */
/* ------------------------------------------------------------------ */

// "The mind" — an even neural-mesh sphere (Fibonacci distribution).
function sphereState(count, radius = 2.6) {
  const arr = new Float32Array(count * 3)
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const theta = golden * i
    arr[i * 3] = Math.cos(theta) * r * radius
    arr[i * 3 + 1] = y * radius
    arr[i * 3 + 2] = Math.sin(theta) * r * radius
  }
  return arr
}

// "Architecture" — a structured cubic lattice (order out of the cloud).
function latticeState(count, size = 3.2) {
  const arr = new Float32Array(count * 3)
  const g = Math.ceil(Math.cbrt(count))
  const step = size / (g - 1)
  const half = size / 2
  for (let i = 0; i < count; i++) {
    const x = i % g
    const y = Math.floor(i / g) % g
    const z = Math.floor(i / (g * g)) % g
    arr[i * 3] = x * step - half
    arr[i * 3 + 1] = y * step - half
    arr[i * 3 + 2] = z * step - half
  }
  return arr
}

const vertexShader = /* glsl */ `
  uniform float uMix;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform vec2 uMouse;         // cursor in NDC [-1..1]
  uniform float uMouseStrength;
  attribute vec3 aTarget;
  attribute float aRand;
  varying float vRand;
  varying float vT;
  varying float vGlow;

  void main() {
    vRand = aRand;
    // per-point staggered morph → organic, not mechanical
    float t = clamp((uMix - aRand * 0.28) / 0.72, 0.0, 1.0);
    t = t * t * (3.0 - 2.0 * t);
    vec3 pos = mix(position, aTarget, t);

    // gentle idle breathing wobble
    float w = 0.07 * (1.0 - t * 0.5);
    pos.x += sin(uTime * 0.6 + aRand * 30.0) * w;
    pos.y += cos(uTime * 0.5 + aRand * 24.0) * w;
    pos.z += sin(uTime * 0.4 + aRand * 18.0) * w;

    vT = t;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);

    // ---- cursor force-field: gentle swirl only (no clumping) ----
    vec4 clip = projectionMatrix * mv;
    vec2 ndc = clip.xy / clip.w;
    vec2 dir = ndc - uMouse;               // cursor → point
    float dm = length(dir);
    float infl = 1.0 - smoothstep(0.0, 0.28, dm);
    float force = infl * uMouseStrength;
    vGlow = infl;
    if (dm > 0.0001) {
      vec2 nd = dir / dm;
      vec2 tangent = vec2(-nd.y, nd.x);    // perpendicular → orbit, spreads not clumps
      mv.xy += tangent * force;
    }

    gl_PointSize = uSize * uPixelRatio * (0.5 + aRand * 1.0) * (18.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vRand;
  varying float vT;
  varying float vGlow;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    // crisp core + soft edge, kept dim so additive blending never blows out
    float alpha = smoothstep(0.5, 0.18, d) * 0.5;
    if (alpha < 0.01) discard;
    // mostly warm-white points; only a minority glow amber
    vec3 col = mix(uColorB, uColorA, pow(vRand, 1.6) * 0.9);
    // points in the swirl warm slightly toward amber — kept subtle, no blowout
    col = mix(col, uColorA, clamp(vGlow * 0.6, 0.0, 1.0));
    gl_FragColor = vec4(col, alpha + vGlow * 0.12);
  }
`

export default function SignalObject({
  count = 2600,
  reducedMotion = false,
  offsetX = 0,
  scale = 1,
}) {
  const pointsRef = useRef()
  const matRef = useRef()
  const progRef = useRef(0)
  // Cursor in NDC, tracked from the window (canvas is pointer-events:none).
  const mouse = useRef({ x: 0, y: 0, active: false })

  useEffect(() => {
    if (reducedMotion) return
    const onMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
      mouse.current.active = true
    }
    const onLeave = () => (mouse.current.active = false)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerout', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerout', onLeave)
    }
  }, [reducedMotion])

  // Build geometry attributes once.
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const from = sphereState(count)
    const target = latticeState(count)
    const rand = new Float32Array(count)
    for (let i = 0; i < count; i++) rand[i] = Math.random()
    geo.setAttribute('position', new THREE.BufferAttribute(from, 3))
    geo.setAttribute('aTarget', new THREE.BufferAttribute(target, 3))
    geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 1))
    return geo
  }, [count])

  const uniforms = useMemo(
    () => ({
      uMix: { value: 0 },
      uTime: { value: 0 },
      uSize: { value: 2.4 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uMouse: { value: new THREE.Vector2(2, 2) }, // offscreen by default
      uMouseStrength: { value: 0 },
      uColorA: { value: new THREE.Color('#ff7a45') }, // amber accent
      uColorB: { value: new THREE.Color('#f2efe9') }, // warm off-white
    }),
    []
  )

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = reducedMotion ? 0 : t
      // scroll progress (works with Lenis or native scroll)
      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      const raw = max > 0 ? window.scrollY / max : 0
      // stay a sphere at the top, morph into the lattice mid-scroll
      const target = THREE.MathUtils.smoothstep(raw, 0.15, 0.72)
      progRef.current += (target - progRef.current) * Math.min(1, delta * 4)
      matRef.current.uniforms.uMix.value = progRef.current
    }
    if (matRef.current && !reducedMotion) {
      // feed cursor position (NDC) to the shader for the repulsion effect
      const m = matRef.current.uniforms.uMouse.value
      m.x += (mouse.current.x - m.x) * Math.min(1, delta * 8)
      m.y += (mouse.current.y - m.y) * Math.min(1, delta * 8)
      const targetStrength = mouse.current.active ? 0.05 : 0
      const s = matRef.current.uniforms.uMouseStrength
      s.value += (targetStrength - s.value) * Math.min(1, delta * 4)
    }
    if (pointsRef.current && !reducedMotion) {
      // slow auto-rotation + subtle pointer parallax toward the cursor
      pointsRef.current.rotation.y += delta * 0.06
      const px = mouse.current.x * 0.25
      const py = mouse.current.y * 0.2
      pointsRef.current.rotation.x += (py - pointsRef.current.rotation.x) * delta * 1.5
      pointsRef.current.rotation.z += (-px * 0.4 - pointsRef.current.rotation.z) * delta * 1.5
    }
  })

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      frustumCulled={false}
      position={[offsetX, 0, 0]}
      scale={scale}
    >
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
