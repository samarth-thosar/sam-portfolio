import { useEffect } from 'react'
import { useGame } from '../store.js'
import { WORLD } from '../../data/world.js'
import { playWhoosh } from '../audio.js'
import TitleScreen from './TitleScreen.jsx'
import HUD from './HUD.jsx'
import InspectCard from './InspectCard.jsx'
import './game.css'

export default function GameUI() {
  const clearInspect = useGame((s) => s.clearInspect)

  useEffect(() => {
    const onKey = (e) => {
      const s = useGame.getState()
      if (!s.entered || e.repeat) return
      if (e.key === 'Escape') {
        clearInspect()
        return
      }
      // arrow keys travel through the current room's doorway
      if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && !s.inspectId) {
        const door = WORLD.rooms[s.currentRoom].doors[0]
        if (door) {
          playWhoosh(door.to)
          s.goToRoom(door.to)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [clearInspect])

  // wait for the camera to actually be framing the object (past any holdBeat
  // pause) before dimming the room — otherwise the vignette/card would open
  // over a wide shot the camera hasn't started moving toward yet
  const inspecting = useGame((s) => !!s.inspectId && s.cameraFraming)

  return (
    <>
      <div className={`inspect-focus ${inspecting ? 'is-on' : ''}`} aria-hidden="true" />
      <HUD />
      <InspectCard />
      <TitleScreen />
    </>
  )
}
