import { useGame, inspectData } from '../store.js'
import { playBack } from '../audio.js'

export default function InspectCard() {
  const entered = useGame((s) => s.entered)
  const data = useGame(inspectData)
  const clearInspect = useGame((s) => s.clearInspect)

  const close = () => {
    playBack()
    clearInspect()
  }

  const open = entered && !!data
  const s = data?.story

  return (
    <div className={`inspect ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      {s && (
        <div className="inspect__card" key={data.id}>
          <button className="inspect__close" onClick={close} aria-label="Close">
            ✕
          </button>
          <p className="inspect__eyebrow mono">{s.eyebrow}</p>
          <h2 className="inspect__title display">{s.title}</h2>
          <p className="inspect__body">{s.body}</p>
          {s.tags && (
            <ul className="inspect__tags">
              {s.tags.map((t) => (
                <li key={t} className="mono">
                  {t}
                </li>
              ))}
            </ul>
          )}
          {s.link && (
            <a className="inspect__link" href={s.link.href} target="_blank" rel="noreferrer">
              {s.link.label} ↗
            </a>
          )}
          <button className="inspect__back mono" onClick={close}>
            ← back to the room
          </button>
        </div>
      )}
    </div>
  )
}
