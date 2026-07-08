import { useEffect } from 'react'
import { prefersReducedMotion } from './lenis.js'

/**
 * Magnetic hover for any element tagged `[data-magnetic]`.
 * The element gently follows the cursor, then springs back on leave.
 */
export function useMagnetic() {
  useEffect(() => {
    if (prefersReducedMotion()) return
    const strength = 0.35
    const els = Array.from(document.querySelectorAll('[data-magnetic]'))
    const cleanups = els.map((el) => {
      const onMove = (e) => {
        const r = el.getBoundingClientRect()
        const x = e.clientX - (r.left + r.width / 2)
        const y = e.clientY - (r.top + r.height / 2)
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`
      }
      const onLeave = () => {
        el.style.transform = 'translate(0, 0)'
      }
      el.addEventListener('mousemove', onMove)
      el.addEventListener('mouseleave', onLeave)
      return () => {
        el.removeEventListener('mousemove', onMove)
        el.removeEventListener('mouseleave', onLeave)
      }
    })
    return () => cleanups.forEach((fn) => fn())
  }, [])
}

/**
 * Toggles `.is-in` on every `.reveal` element as it scrolls into view.
 * Uses IntersectionObserver so it works with or without smooth scroll.
 */
export function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.reveal'))
    if (prefersReducedMotion()) {
      els.forEach((el) => el.classList.add('is-in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}
