/**
 * The world graph — a thin aggregator over per-room data modules
 * (src/data/rooms/*.js). Each room module exports `{ room, objects }`;
 * this file merges them into the same WORLD.rooms / WORLD.objects /
 * DISCOVERABLE_IDS shape every consumer (CameraRig, store, HUD, room
 * components) already relies on. Adding a room means adding one module
 * here — nothing else in this file changes.
 *
 * Coordinate convention: each room has an `origin`; object/door positions are in
 * world space. The iso camera frames `camera.look` (a world point) at `camera.zoom`.
 */
import { studio } from './rooms/studio.js'
import { lab } from './rooms/lab.js'
import { threshold } from './rooms/threshold.js'
import { rooftop } from './rooms/rooftop.js'
import { library } from './rooms/library.js'
import { greenhouse } from './rooms/greenhouse.js'

const ALL_ROOMS = [threshold, studio, lab, rooftop, library, greenhouse]

export const WORLD = {
  start: 'threshold',
  rooms: Object.fromEntries(ALL_ROOMS.map((r) => [r.room.id, r.room])),
  objects: Object.assign({}, ...ALL_ROOMS.map((r) => r.objects)),
}

export const DISCOVERABLE_IDS = Object.keys(WORLD.objects)
