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
      if (!s.entered) return
      if (e.key === 'Escape') {
        clearInspect()
        return
      }
      // arrow keys travel through the current room's doorway
      if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && !s.inspectId) {
        const door = WORLD.rooms[s.currentRoom].doors[0]
        if (door) {
          playWhoosh()
          s.goToRoom(door.to)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [clearInspect])

  const inspecting = useGame((s) => !!s.inspectId)

  return (
    <>
      <div className={`inspect-focus ${inspecting ? 'is-on' : ''}`} aria-hidden="true" />
      <HUD />
      <InspectCard />
      <TitleScreen />
    </>
  )
}
