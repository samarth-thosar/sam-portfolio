import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../lib/lenis.js'
import './Cursor.css'

/**
 * A refined circular cursor that trails the mouse and grows over
 * interactive elements. Disabled on touch devices and reduced-motion.
 */
export default function Cursor() {
  const dot = useRef(null)
  const ring = useRef(null)

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    if (isTouch || prefersReducedMotion()) return

    document.body.classList.add('has-cursor')
    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const ringPos = { ...pos }
    let raf

    const onMove = (e) => {
      pos.x = e.clientX
      pos.y = e.clientY
      if (dot.current) {
        dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`
      }
    }

    const render = () => {
      // ring lags behind with easing for a premium trailing feel
      ringPos.x += (pos.x - ringPos.x) * 0.18
      ringPos.y += (pos.y - ringPos.y) * 0.18
      if (ring.current) {
        ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`
      }
      raf = requestAnimationFrame(render)
    }
    render()

    const interactive = 'a, button, [data-magnetic], input, textarea'
    const over = (e) => {
      if (e.target.closest(interactive)) document.body.classList.add('cursor-hover')
    }
    const out = (e) => {
      if (e.target.closest(interactive)) document.body.classList.remove('cursor-hover')
    }

    window.addEventListener('pointermove', onMove)
    document.addEventListener('pointerover', over)
    document.addEventListener('pointerout', out)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', over)
      document.removeEventListener('pointerout', out)
      document.body.classList.remove('has-cursor', 'cursor-hover')
    }
  }, [])

  return (
    <>
      <div ref={ring} className="cursor cursor--ring" aria-hidden="true" />
      <div ref={dot} className="cursor cursor--dot" aria-hidden="true" />
    </>
  )
}
