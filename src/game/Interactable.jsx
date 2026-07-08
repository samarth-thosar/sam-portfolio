import { useRef, useState, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, useCursor } from '@react-three/drei'
import { useGame } from './store.js'
import { playHover, playSelect } from './audio.js'
import './interactable.css'

const NOOP = () => {}

/**
 * Wraps any prop so it becomes inspectable. Adds:
 *  - a generous invisible hitbox (easy to click)
 *  - an idle "point of interest" marker that pulses (so it's obvious it's clickable)
 *  - a ground halo + floating label + scale/lift on hover
 *  - a tactile tick + click → inspect
 * Positioned in absolute world space; children are authored in local coordinates.
 */
export default function Interactable({
  id,
  label,
  position,
  radius = 0.9,
  groundY = -0.9,
  labelY = 1.15,
  hitbox, // [w,h,d] override for the click area
  children,
}) {
  const inner = useRef()
  const contents = useRef()
  const halo = useRef()
  const dot = useRef()

  // The invisible hitbox is the ONLY raycast target. If the children also
  // raycast, moving the pointer between sibling meshes fires out/over pairs
  // that bubble to the group — hover flickers and the hover tick replays.
  useEffect(() => {
    contents.current?.traverse((o) => {
      o.raycast = NOOP
    })
  }, [])
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)
  const phase = useMemo(() => Math.random() * Math.PI * 2, [])

  const inspect = useGame((s) => s.inspect)
  const setHover = useGame((s) => s.setHover)
  const calm = useGame((s) => s.calm)
  const discovered = useGame((s) => s.discovered.includes(id))
  const isActive = useGame((s) => s.inspectId === id)

  const haloY = groundY - position[1] + 0.02
  const hb = hitbox || [radius * 1.7, Math.max(1, radius * 2), radius * 1.7]

  useFrame((state, dt) => {
    const k = 1 - Math.exp(-10 * dt)
    const t = state.clock.elapsedTime
    const pulse = calm ? 0.5 : Math.sin(t * 2.2 + phase) * 0.5 + 0.5

    if (inner.current) {
      const targetScale = hovered ? 1.06 : 1
      const sc = inner.current.scale.x + (targetScale - inner.current.scale.x) * k
      inner.current.scale.setScalar(sc)
      const targetY = hovered ? 0.07 : 0
      inner.current.position.y += (targetY - inner.current.position.y) * k
    }
    if (halo.current) {
      const idle = discovered ? 0.14 : 0.12 + pulse * 0.16
      const to = hovered ? 0.9 : idle
      halo.current.material.opacity += (to - halo.current.material.opacity) * k
      halo.current.rotation.z += dt * 0.25
    }
    if (dot.current) {
      const show = !hovered && !isActive && !discovered
      const target = show ? 0.6 + pulse * 0.4 : 0
      const s = dot.current.scale.x + (target - dot.current.scale.x) * k
      dot.current.scale.setScalar(Math.max(0.0001, s))
      dot.current.position.y = labelY + (calm ? 0 : Math.sin(t * 1.6 + phase) * 0.05)
    }
  })

  const onOver = (e) => {
    e.stopPropagation()
    setHovered(true)
    setHover(id)
    playHover()
  }
  const onOut = (e) => {
    e.stopPropagation()
    setHovered(false)
    setHover(null)
  }
  const onClick = (e) => {
    e.stopPropagation()
    if (isActive) return
    inspect(id)
    playSelect()
  }

  return (
    <group position={position}>
      <group ref={inner} onPointerOver={onOver} onPointerOut={onOut} onClick={onClick}>
        {/* generous invisible hitbox */}
        <mesh position={[0, hb[1] / 2 - radius * 0.6, 0]}>
          <boxGeometry args={hb} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        <group ref={contents}>{children}</group>
      </group>

      {/* ground halo */}
      <mesh ref={halo} rotation={[-Math.PI / 2, 0, 0]} position={[0, haloY, 0]}>
        <ringGeometry args={[radius * 0.82, radius, 48]} />
        <meshBasicMaterial color="#ff7a45" transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* idle point-of-interest marker */}
      <mesh ref={dot} position={[0, labelY, 0]} scale={0.0001}>
        <sphereGeometry args={[0.05, 14, 14]} />
        <meshBasicMaterial color="#ff7a45" toneMapped={false} />
      </mesh>

      {/* floating label — the wrapper div drei creates must NOT catch pointer
          events, or it swallows the click meant for the object beneath it */}
      {(hovered || (discovered && !isActive)) && (
        <Html
          position={[0, labelY + 0.05, 0]}
          center
          zIndexRange={[20, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div className={`iobj ${hovered ? 'is-hover' : 'is-seen'}`}>
            {hovered ? (
              <>
                <span className="iobj__dot" />
                {label}
              </>
            ) : (
              <span className="iobj__check">✓</span>
            )}
          </div>
        </Html>
      )}
    </group>
  )
}
