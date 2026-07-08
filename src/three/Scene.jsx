import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import SignalObject from './SignalObject.jsx'
import { prefersReducedMotion } from '../lib/lenis.js'

/**
 * Fixed, full-viewport WebGL layer that sits behind the scrolling HTML content.
 * Pointer events pass through so the DOM stays fully interactive.
 */
export default function Scene() {
  const reduced = prefersReducedMotion()
  const dpr = Math.min(window.devicePixelRatio, 2)
  // Lighter particle budget on small / touch screens.
  const isSmall = window.matchMedia('(max-width: 768px)').matches
  const count = isSmall ? 1600 : 2600
  // On desktop, offset the constellation to the right so the hero copy on the
  // left stays crisp and legible. On small screens keep it centered behind.
  const offsetX = isSmall ? 0 : 2.0
  const scale = isSmall ? 0.62 : 0.82

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-canvas)',
        pointerEvents: 'none',
      }}
    >
      <Canvas
        dpr={[1, dpr]}
        camera={{ position: [0, 0, 6.2], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        frameloop={reduced ? 'demand' : 'always'}
      >
        <Suspense fallback={null}>
          <SignalObject
            count={count}
            reducedMotion={reduced}
            offsetX={offsetX}
            scale={scale}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
