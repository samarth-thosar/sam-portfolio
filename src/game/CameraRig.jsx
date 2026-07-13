import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGame } from './store.js'
import { WORLD } from '../data/world.js'

// A fixed isometric viewing direction shared by the whole world for coherence.
export const ISO_DIR = new THREE.Vector3(1, 0.82, 1).normalize()
const DIST = 42

const _look = new THREE.Vector3()
const _final = new THREE.Vector3()
const _pos = new THREE.Vector3()
const _dir = new THREE.Vector3()

/**
 * Drives the orthographic camera entirely from game state. Every object can
 * define its own `inspect` block in data/world.js — a distinct camera *move*,
 * not just a distinct number plugged into one shared formula:
 *  - dx/dy/dz/zoom : where to look and how close
 *  - k             : how fast the push-in settles (snappy glance vs slow reveal)
 *  - swayAmp       : how much of the idle cinematic sway survives while inspecting
 *  - holdBeat      : a brief pause on the ROOM framing before the push-in begins,
 *                    like a director holding the wide shot before cutting in
 *  - orbitDeg      : an extra yaw eased onto the fixed iso direction while inspecting —
 *                    the one way we let the camera look AROUND something, not just AT it
 *  - pan           : { axis, amp, speed } — a slow directed sweep layered onto the
 *                    settled look point (e.g. reading left-to-right across a wide object)
 * All easing stays frame-rate independent (exponential decay against dt), so it
 * feels identical at 30 or 144fps — only the RATE differs per object now.
 */
export default function CameraRig() {
  const { camera, pointer } = useThree()
  const start = WORLD.rooms[WORLD.start]
  const look = useRef(new THREE.Vector3(...start.camera.look))
  const zoom = useRef(start.camera.zoom)
  const orbit = useRef(0)
  const holdUntil = useRef(0)
  const lastInspectId = useRef(null)
  const lastRoom = useRef(WORLD.start)
  const craneUntil = useRef(0)
  const craneFrom = useRef(new THREE.Vector3(...start.camera.look))
  const wasFraming = useRef(false)

  useFrame((state, dt) => {
    const s = useGame.getState()
    const room = WORLD.rooms[s.currentRoom]
    const obj = s.inspectId ? WORLD.objects[s.inspectId] : null
    const f = obj?.inspect || {}
    const t = state.clock.elapsedTime

    // start the hold-beat timer the instant a NEW object becomes inspected
    if (s.inspectId !== lastInspectId.current) {
      lastInspectId.current = s.inspectId
      holdUntil.current = obj && f.holdBeat ? t + f.holdBeat : 0
    }
    const holding = !!obj && t < holdUntil.current
    const framing = !!obj && !holding
    // the UI (inspect card, focus vignette) waits for this instead of opening
    // the instant inspectId changes — otherwise the card narrates an object
    // the camera is still holding off on, especially during a holdBeat pause
    if (framing !== wasFraming.current) {
      wasFraming.current = framing
      useGame.setState({ cameraFraming: framing })
    }

    // a brief "crane" beat right as a door is used — the camera holds on the
    // OLD room's own wide-shot point (never wherever it happened to be, e.g.
    // still mid-inspect-push-in if a door is clicked without closing first)
    // for a moment before the glide to the new room begins, so travel reads
    // as a directed cut, not a snap
    if (s.currentRoom !== lastRoom.current) {
      craneFrom.current.set(...WORLD.rooms[lastRoom.current].camera.look)
      lastRoom.current = s.currentRoom
      craneUntil.current = t + 0.22
    }
    const craning = !framing && t < craneUntil.current

    if (framing) {
      _look.set(
        obj.position[0] + (f.dx || 0),
        obj.position[1] + (f.dy ?? 0.25),
        obj.position[2] + (f.dz || 0)
      )
      if (f.pan && !s.calm) {
        _look[f.pan.axis] += Math.sin(t * f.pan.speed) * f.pan.amp
      }
    } else if (craning) {
      _look.copy(craneFrom.current)
    } else {
      _look.set(room.camera.look[0], room.camera.look[1], room.camera.look[2])
    }
    // moderate push-in — frames the object *in context*, never fills the screen
    const targetZoom =
      framing ? f.zoom ?? 104 : craning && !s.calm ? room.camera.zoom * 0.92 : room.camera.zoom
    const targetOrbit = framing && f.orbitDeg && !s.calm ? (f.orbitDeg * Math.PI) / 180 : 0

    const rate = framing ? f.k ?? 3.6 : 3.6
    const k = 1 - Math.exp(-rate * dt)
    look.current.lerp(_look, k)
    zoom.current += (targetZoom - zoom.current) * k
    orbit.current += (targetOrbit - orbit.current) * k

    // cinematic sway + parallax (calmer while inspecting; per-object override)
    let sx = 0
    let sy = 0
    if (!s.calm) {
      const amp = obj ? f.swayAmp ?? 0.12 : 1
      sx = (Math.sin(t * 0.24) * 0.3 + pointer.x * 0.7) * amp
      sy = (Math.cos(t * 0.19) * 0.18 + pointer.y * 0.4) * amp
    }

    _final.copy(look.current)
    _final.x += sx
    _final.y += sy

    // the fixed iso direction, temporarily yawed for the rare object that wants
    // to be looked AROUND (a rotating sculpture) rather than just looked AT
    if (Math.abs(orbit.current) > 0.0005) {
      const c = Math.cos(orbit.current)
      const sn = Math.sin(orbit.current)
      _dir.set(ISO_DIR.x * c + ISO_DIR.z * sn, ISO_DIR.y, -ISO_DIR.x * sn + ISO_DIR.z * c)
    } else {
      _dir.copy(ISO_DIR)
    }

    _pos.copy(_final).addScaledVector(_dir, DIST)

    camera.position.copy(_pos)
    if (Math.abs(camera.zoom - zoom.current) > 0.01) {
      camera.zoom = zoom.current
      camera.updateProjectionMatrix()
    }
    camera.lookAt(_final)
  })

  return null
}
