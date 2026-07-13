import { useGame, currentRoomData } from '../store.js'
import { setMuted } from '../audio.js'
import { links } from '../../data/links.js'

function SpeakerIcon({ muted }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5 6 9H2v6h4l5 4V5z" />
      {muted ? (
        <path d="M22 9l-6 6M16 9l6 6" />
      ) : (
        <>
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          <path d="M18.5 6a9 9 0 0 1 0 12" />
        </>
      )}
    </svg>
  )
}

export default function HUD() {
  const entered = useGame((s) => s.entered)
  const room = useGame(currentRoomData)
  const discovered = useGame((s) => s.discovered.length)
  const total = useGame((s) => s.totalDiscoverable)
  const muted = useGame((s) => s.muted)
  const toggleMute = useGame((s) => s.toggleMute)
  const calm = useGame((s) => s.calm)
  const toggleCalm = useGame((s) => s.toggleCalm)

  if (!entered) return null

  const onMute = () => {
    toggleMute()
    setMuted(!muted)
  }

  return (
    <div className="hud">
      <div className="hud__top">
        <div className="hud__room">
          <span className="hud__room-name display">{room.name}</span>
          <span className="hud__room-tag mono">{room.tagline}</span>
        </div>

        <div className="hud__right">
          <div className="hud__disc mono" title="Things discovered">
            <span className="accent">{String(discovered).padStart(2, '0')}</span>
            <span className="hud__disc-sep">/</span>
            {String(total).padStart(2, '0')} found
          </div>
          <button className={`hud__btn ${calm ? 'is-on' : ''}`} onClick={toggleCalm} title="Calm mode (less motion)">
            <span className="mono">calm</span>
          </button>
          <button className="hud__btn hud__btn--icon" onClick={onMute} aria-label={muted ? 'Unmute' : 'Mute'}>
            <SpeakerIcon muted={muted} />
          </button>
        </div>
      </div>

      {/* always-reachable, regardless of how much of the world you've explored —
          a good impression is wasted if there's no fast way to act on it */}
      <div className="hud__contact mono">
        <a href={links.github} target="_blank" rel="noreferrer">GitHub</a>
        <span className="hud__contact-sep">·</span>
        <a href={links.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
        <span className="hud__contact-sep">·</span>
        <a href={links.cv} target="_blank" rel="noreferrer">CV</a>
        <span className="hud__contact-sep">·</span>
        <a href={links.email}>Email</a>
      </div>

      <p className="hud__hint mono">
        Click <span className="accent">glowing objects</span> to inspect · click a <span className="accent">doorway</span> (or ← →) to travel · move your mouse to look
      </p>
    </div>
  )
}
