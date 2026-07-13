import { useGame, inspectData } from '../store.js'
import { playBack } from '../audio.js'
import { WORLD } from '../../data/world.js'

export default function InspectCard() {
  const entered = useGame((s) => s.entered)
  const data = useGame(inspectData)
  const clearInspect = useGame((s) => s.clearInspect)

  const close = () => {
    playBack(data?.room)
    clearInspect()
  }

  // wait for CameraRig to actually settle onto the object (past any holdBeat
  // pause) so the card never narrates an object the camera hasn't reached yet
  const cameraFraming = useGame((s) => s.cameraFraming)
  const open = entered && !!data && cameraFraming
  const s = data?.story
  // the card borrows the ROOM's accent (cyan in the Lab, orange in the Studio)
  // instead of one fixed colour everywhere — a small, safe way for the reading
  // panel to agree with the scene it's describing.
  const accent = data ? WORLD.rooms[data.room]?.accent : undefined

  return (
    <div className={`inspect ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      {s && (
        <div className="inspect__card" key={data.id} style={accent ? { '--accent': accent } : undefined}>
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
