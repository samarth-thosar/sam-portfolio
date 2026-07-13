import { create } from 'zustand'
import { WORLD, DISCOVERABLE_IDS } from '../data/world.js'
import { prefersReducedMotion } from '../lib/lenis.js'
import { setRoom } from './audio.js'

/**
 * Central game state. Camera, rooms, inspection, discoveries, and audio all
 * read from here so the 3D world and the DOM HUD stay perfectly in sync.
 */
export const useGame = create((set, get) => ({
  // ---- lifecycle ----
  entered: false, // has the visitor left the title screen
  enterWorld: () => set({ entered: true }),

  // ---- navigation ----
  currentRoom: WORLD.start,
  goToRoom: (id) => {
    if (!WORLD.rooms[id]) return
    setRoom(id)
    set({ currentRoom: id, inspectId: null, hoverId: null, cameraFraming: false })
  },

  // ---- inspection ----
  inspectId: null,
  // true once CameraRig has actually settled onto the object (past any
  // holdBeat pause) — the UI (card, vignette) waits for this rather than
  // opening the instant inspectId changes. Written by CameraRig only.
  cameraFraming: false,
  inspect: (id) => {
    const { discovered } = get()
    const next = discovered.includes(id) ? discovered : [...discovered, id]
    set({ inspectId: id, discovered: next })
  },
  clearInspect: () => set({ inspectId: null, cameraFraming: false }),

  // ---- discoveries ----
  discovered: [],
  totalDiscoverable: DISCOVERABLE_IDS.length,

  // ---- hover (drives cursor + subtle audio) ----
  hoverId: null,
  setHover: (id) => set({ hoverId: id }),

  // ---- options ----
  muted: false,
  toggleMute: () => set((s) => ({ muted: !s.muted })),
  calm: prefersReducedMotion(),
  toggleCalm: () => set((s) => ({ calm: !s.calm })),
}))

// Dev-only hook so verification scripts can drive the game (enter, goToRoom,
// inspect) without simulating canvas clicks. Stripped from production builds.
if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.__game = useGame
}

// Convenience selectors
export const currentRoomData = (s) => WORLD.rooms[s.currentRoom]
export const inspectData = (s) =>
  s.inspectId ? WORLD.objects[s.inspectId] : null
