import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../lib/lenis.js'
import './Stats.css'

// Numbers pulled/estimated from the CV. Tweak freely — these are your headline metrics.
const STATS = [
  { value: 12, suffix: '+', label: 'Projects shipped', note: 'web · mobile · AI' },
  { value: 3, suffix: 'M+', label: 'Users reached', note: 'Cropwise Grower' },
  { value: 2, suffix: '', label: 'IEEE publications', note: 'Scopus-indexed' },
  { value: 35, suffix: '+', label: 'Engineers mentored', note: 'IEEE App Team' },
]

function useCountUp(target, active, duration = 1600) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!active) return
    if (prefersReducedMotion()) {
      setN(target)
      return
    }
    let raf
    let start
    const tick = (t) => {
      if (start === undefined) start = t
      const p = Math.min(1, (t - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3) // easeOutCubic
      setN(target * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, active, duration])
  return n
}

function Stat({ value, suffix, label, note, active }) {
  const n = useCountUp(value, active)
  const display = Number.isInteger(value) ? Math.round(n) : n.toFixed(1)
  return (
    <div className="stat">
      <div className="stat__num display">
        {display}
        <span className="accent">{suffix}</span>
      </div>
      <div className="stat__label">{label}</div>
      <div className="stat__note mono">{note}</div>
    </div>
  )
}

export default function Stats() {
  const ref = useRef(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setActive(true)
          io.disconnect()
        }
      },
      { threshold: 0.4 }
    )
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [])

  return (
    <section className="stats" ref={ref} aria-label="Key metrics">
      <div className="container stats__grid">
        {STATS.map((s) => (
          <Stat key={s.label} {...s} active={active} />
        ))}
      </div>
    </section>
  )
}
