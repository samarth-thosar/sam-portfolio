import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// A tiny shared store so the 3D scene can read normalized scroll progress (0..1)
// without prop-drilling through the React tree.
export const scrollState = { progress: 0, velocity: 0 }

/**
 * Boots Lenis smooth scrolling and drives GSAP's ScrollTrigger from the same
 * ticker so scroll-linked animation and the WebGL scene stay in lockstep.
 * No-ops (native scroll) when the user prefers reduced motion.
 */
export function useSmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    })

    lenis.on('scroll', (e) => {
      ScrollTrigger.update()
      const max = e.limit || 1
      scrollState.progress = max ? e.scroll / max : 0
      scrollState.velocity = e.velocity || 0
    })

    const raf = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    document.documentElement.classList.add('lenis')

    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
      document.documentElement.classList.remove('lenis')
    }
  }, [])
}
