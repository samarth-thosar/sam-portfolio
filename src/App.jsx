import World from './game/World.jsx'
import GameUI from './game/ui/GameUI.jsx'

/**
 * The portfolio is a single explorable world — no pages, no scrolling.
 * <World/> is the 3D canvas; <GameUI/> is the DOM overlay (title, HUD, inspect).
 */
export default function App() {
  return (
    <div className="game-root">
      <World />
      <GameUI />
      <div className="grain" aria-hidden="true" />
    </div>
  )
}
