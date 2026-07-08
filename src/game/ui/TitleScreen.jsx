import { useGame } from '../store.js'
import { initAudio } from '../audio.js'
import { profile } from '../../data/links.js'

export default function TitleScreen() {
  const entered = useGame((s) => s.entered)
  const enterWorld = useGame((s) => s.enterWorld)

  const enter = () => {
    initAudio() // first user gesture — safe to start audio
    enterWorld()
  }

  return (
    <div className={`title ${entered ? 'is-gone' : ''}`} aria-hidden={entered}>
      <div className="title__inner">
        <p className="title__eyebrow mono">
          <span className="accent">08</span> — an explorable portfolio
        </p>
        <h1 className="title__name display">
          Samarth<span className="accent">.</span>
        </h1>
        <p className="title__lead">
          Not a résumé — a small world. Wander through the spaces where I think, build,
          and play, and you'll understand how I work before you read a single line.
        </p>
        <button className="title__enter" onClick={enter}>
          <span className="title__enter-dot" />
          Step inside
        </button>
        <p className="title__hint mono">
          Click glowing objects to inspect · click a doorway to move · sound on
        </p>
      </div>
    </div>
  )
}
