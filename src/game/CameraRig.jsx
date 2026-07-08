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

/**
 * Drives the orthographic camera entirely from game state:
 *  - no inspection → frame the current room (look + zoom)
 *  - inspecting     → push in and centre the object
 * Adds gentle cinematic sway + pointer parallax (off in calm mode). All easing is
 * frame-rate independent so it feels identical at 30 or 144fps.
 */
export default function CameraRig() {
  const { camera, pointer } = useThree()
  const start = WORLD.rooms[WORLD.start]
  const look = useRef(new THREE.Vector3(...start.camera.look))
  const zoom = useRef(start.camera.zoom)

  useFrame((state, dt) => {
    const s = useGame.getState()
    const room = WORLD.rooms[s.currentRoom]
    const obj = s.inspectId ? WORLD.objects[s.inspectId] : null

    if (obj) {
      const f = obj.inspect || {}
      _look.set(
        obj.position[0] + (f.dx || 0),
        obj.position[1] + (f.dy ?? 0.25),
        obj.position[2] + (f.dz || 0)
      )
    } else {
      _look.set(room.camera.look[0], room.camera.look[1], room.camera.look[2])
    }
    // moderate push-in — frames the object *in context*, never fills the screen
    const targetZoom = obj ? obj.inspect?.zoom ?? 104 : room.camera.zoom

    const k = 1 - Math.exp(-3.6 * dt)
    look.current.lerp(_look, k)
    zoom.current += (targetZoom - zoom.current) * k

    // cinematic sway + parallax (calmer while inspecting)
    let sx = 0
    let sy = 0
    if (!s.calm) {
      const t = state.clock.elapsedTime
      const amp = obj ? 0.12 : 1
      sx = (Math.sin(t * 0.24) * 0.3 + pointer.x * 0.7) * amp
      sy = (Math.cos(t * 0.19) * 0.18 + pointer.y * 0.4) * amp
    }

    _final.copy(look.current)
    _final.x += sx
    _final.y += sy
    _pos.copy(_final).addScaledVector(ISO_DIR, DIST)

    camera.position.copy(_pos)
    if (Math.abs(camera.zoom - zoom.current) > 0.01) {
      camera.zoom = zoom.current
      camera.updateProjectionMatrix()
    }
    camera.lookAt(_final)
  })

  return null
}
