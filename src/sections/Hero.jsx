import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { profile, socials, links } from '../data/links.js'
import { prefersReducedMotion } from '../lib/lenis.js'
import Room, { STATIONS } from '../three/Room.jsx'
import './Hero.css'

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const pad = (n) => String(n).padStart(2, '0')

export default function Hero() {
  const [station, setStation] = useState(0)
  const [mode, setMode] = useState('tour') // 'tour' | 'explore'
  const total = STATIONS.length
  const capRef = useRef(null)

  const go = (d) => setStation((s) => clamp(s + d, 0, total - 1))

  // keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (mode !== 'tour') {
        if (e.key === 'Escape') setMode('tour')
        return
      }
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mode])

  // animate the caption on each station change
  useEffect(() => {
    if (prefersReducedMotion() || !capRef.current) return
    const els = capRef.current.querySelectorAll('[data-cap]')
    gsap.fromTo(
      els,
      { y: 22, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: 'expo.out' }
    )
  }, [station, mode])

  const s = STATIONS[station]
  const isIntro = station === 0 && mode === 'tour'

  return (
    <section className="hero" id="top">
      <div className={`hero__room ${mode === 'explore' ? 'is-explore' : ''}`}>
        <Room station={station} mode={mode} />
      </div>

      {/* left scrim keeps overlay text readable over the scene */}
      <div className="hero__scrim" aria-hidden="true" />

      {mode === 'explore' ? (
        <div className="hero__overlay">
          <button className="tour__resume" onClick={() => setMode('tour')} data-magnetic>
            ← Back to the tour
          </button>
        </div>
      ) : (
        <div className="hero__overlay">
          <div className="hero__caption" ref={capRef}>
            {isIntro ? (
              <>
                <span className="hero__badge" data-cap>
                  <span className="hero__badge-dot" />
                  Available for freelance
                </span>
                <p className="hero__eyebrow eyebrow" data-cap>
                  <span className="num">08</span> — {profile.role} · {profile.location}
                </p>
                <h1 className="hero__line display" data-cap>
                  Samarth<br />
                  Thosar<span className="accent">.</span>
                </h1>
                <p className="hero__lead" data-cap>
                  I connect ideas across <em>AI</em>, <em>product</em>, and{' '}
                  <em>cognitive science</em> to build systems that are{' '}
                  <span className="accent">technically robust</span>, aesthetically
                  refined, and genuinely useful.
                </p>
                <div className="hero__meta" data-cap>
                  <button className="btn btn--primary" onClick={() => go(1)} data-magnetic>
                    Start the tour →
                  </button>
                  <a
                    className="btn btn--ghost"
                    href={links.cv}
                    target="_blank"
                    rel="noreferrer"
                    data-magnetic
                  >
                    Download CV
                  </a>
                  <nav className="hero__socials" aria-label="Social links">
                    {socials.map((x) => (
                      <a key={x.label} href={x.href} target="_blank" rel="noreferrer" className="mono">
                        {x.label}
                      </a>
                    ))}
                  </nav>
                </div>
              </>
            ) : (
              <>
                <span className="hero__station-no mono" data-cap>
                  <span className="accent">{pad(station)}</span> / {pad(total - 1)}
                </span>
                <h2 className="hero__cap-title display" data-cap>
                  {s.title}
                </h2>
                <p className="hero__cap-body" data-cap>
                  {s.body}
                </p>
              </>
            )}
          </div>

          {/* tour controls */}
          <div className="tour">
            <button
              className="tour__btn"
              onClick={() => go(-1)}
              disabled={station === 0}
              aria-label="Previous"
              data-magnetic
            >
              ←
            </button>
            <div className="tour__dots" role="tablist">
              {STATIONS.map((st, i) => (
                <button
                  key={st.id}
                  className={`tour__dot ${i === station ? 'is-active' : ''}`}
                  onClick={() => setStation(i)}
                  aria-label={st.title}
                  aria-selected={i === station}
                />
              ))}
            </div>
            <button
              className="tour__btn"
              onClick={() => go(1)}
              disabled={station === total - 1}
              aria-label="Next"
              data-magnetic
            >
              →
            </button>
            <button className="tour__explore mono" onClick={() => setMode('explore')} data-magnetic>
              Explore freely
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
