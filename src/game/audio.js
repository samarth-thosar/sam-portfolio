/**
 * Procedural audio — everything is synthesized with the Web Audio API so we ship
 * warm, tasteful sound with zero asset files and no autoplay problems (the context
 * is created on the visitor's first gesture: pressing "Enter").
 *
 * - a shared ambient pad + air, plus a per-room LAYER that crossfades on travel
 *   (Studio gets a slow tape-flutter warmth; Lab gets a server-hum/fan chatter)
 * - tactile one-shots timbred per artifact: hover/select vary by `kind` (data/
 *   world.js), so every one of the 6 objects has its own voice, not one shared blip
 * - room-to-room whoosh is directional (brighter into the Lab, warmer into the Studio)
 */

let ctx = null
let master = null
let ambientGain = null
let studioGain = null
let labGain = null
let started = false
let muted = false
let currentRoom = 'studio'

function now() {
  return ctx.currentTime
}

// pink-ish noise buffer for "air", whooshes, and paper/chalk one-shots
function noiseBuffer() {
  const len = ctx.sampleRate * 2
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const d = buf.getChannelData(0)
  let b0 = 0, b1 = 0, b2 = 0
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1
    b0 = 0.99765 * b0 + white * 0.099
    b1 = 0.963 * b1 + white * 0.2965
    b2 = 0.57 * b2 + white * 1.0526
    d[i] = (b0 + b1 + b2 + white * 0.1848) * 0.2
  }
  return buf
}

let noise = null

export function initAudio() {
  if (ctx) return
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return
  ctx = new AC()
  master = ctx.createGain()
  master.gain.value = muted ? 0 : 0.9
  master.connect(ctx.destination)
  noise = noiseBuffer()
  startAmbient()
}

function startAmbient() {
  if (started || !ctx) return
  started = true

  ambientGain = ctx.createGain()
  ambientGain.gain.value = 0.0
  ambientGain.connect(master)
  // fade the bed in gently
  ambientGain.gain.linearRampToValueAtTime(0.5, now() + 4)

  // warm low pad — a soft, wide A minor-ish drone (shared by both rooms)
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 520
  filter.Q.value = 0.6
  filter.connect(ambientGain)

  const padGain = ctx.createGain()
  padGain.gain.value = 0.06
  padGain.connect(filter)

  ;[55, 82.41, 110, 164.81].forEach((f, i) => {
    const o = ctx.createOscillator()
    o.type = i % 2 ? 'triangle' : 'sine'
    o.frequency.value = f
    o.detune.value = (i - 1.5) * 4
    o.connect(padGain)
    o.start()
  })

  // slow filter LFO — the pad "breathes"
  const lfo = ctx.createOscillator()
  lfo.frequency.value = 0.05
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = 220
  lfo.connect(lfoGain)
  lfoGain.connect(filter.frequency)
  lfo.start()

  // air — very quiet filtered noise
  const air = ctx.createBufferSource()
  air.buffer = noise
  air.loop = true
  const airFilter = ctx.createBiquadFilter()
  airFilter.type = 'bandpass'
  airFilter.frequency.value = 900
  airFilter.Q.value = 0.4
  const airGain = ctx.createGain()
  airGain.gain.value = 0.02
  air.connect(airFilter)
  airFilter.connect(airGain)
  airGain.connect(ambientGain)
  air.start()

  // ---- per-room layers, crossfaded by setRoom() ----
  studioGain = ctx.createGain()
  studioGain.gain.value = 1 // world starts in the Studio
  studioGain.connect(ambientGain)
  labGain = ctx.createGain()
  labGain.gain.value = 0
  labGain.connect(ambientGain)

  // Studio: a slow tape-flutter warmth — a quiet detuned pair wandering gently,
  // like an analog workspace that's always slightly, pleasantly imperfect.
  const flutterFilter = ctx.createBiquadFilter()
  flutterFilter.type = 'lowpass'
  flutterFilter.frequency.value = 1400
  flutterFilter.connect(studioGain)
  const flutterGain = ctx.createGain()
  flutterGain.gain.value = 0.03
  flutterGain.connect(flutterFilter)
  const flutterOsc = ctx.createOscillator()
  flutterOsc.type = 'sine'
  flutterOsc.frequency.value = 220
  flutterOsc.connect(flutterGain)
  flutterOsc.start()
  const wow = ctx.createOscillator()
  wow.frequency.value = 0.6
  const wowGain = ctx.createGain()
  wowGain.gain.value = 2.2
  wow.connect(wowGain)
  wowGain.connect(flutterOsc.detune)
  wow.start()

  // Lab: server-hum + fan chatter — a narrow electrical-hum harmonic pair,
  // amplitude-modulated so it reads as cooling fans/rack noise, not a pure tone.
  const humFilter = ctx.createBiquadFilter()
  humFilter.type = 'bandpass'
  humFilter.frequency.value = 180
  humFilter.Q.value = 8
  humFilter.connect(labGain)
  const humGain = ctx.createGain()
  humGain.gain.value = 0.05
  humGain.connect(humFilter)
  ;[120, 240].forEach((f) => {
    const o = ctx.createOscillator()
    o.type = 'sine'
    o.frequency.value = f
    o.connect(humGain)
    o.start()
  })
  const chatterLfo = ctx.createOscillator()
  chatterLfo.type = 'square'
  chatterLfo.frequency.value = 7
  const chatterLfoGain = ctx.createGain()
  chatterLfoGain.gain.value = 0.35
  chatterLfo.connect(chatterLfoGain)
  chatterLfoGain.connect(humGain.gain)
  chatterLfo.start()
}

// Crossfades the ambient room layer over ~1.3s. Call from goToRoom so the
// Lab's server-hum and the Studio's tape-flutter fade in/out as you travel.
export function setRoom(roomId) {
  currentRoom = roomId
  if (!ctx || !studioGain || !labGain) return
  const t = now() + 1.3
  studioGain.gain.cancelScheduledValues(now())
  studioGain.gain.linearRampToValueAtTime(roomId === 'studio' ? 1 : 0, t)
  labGain.gain.cancelScheduledValues(now())
  labGain.gain.linearRampToValueAtTime(roomId === 'lab' ? 1 : 0, t)
}

export function setMuted(v) {
  muted = v
  if (!ctx || !master) return
  master.gain.cancelScheduledValues(now())
  master.gain.linearRampToValueAtTime(v ? 0 : 0.9, now() + 0.25)
}

// ---- synthesis primitives ----
function blip(freqStart, freqEnd, dur, type = 'sine', vol = 0.12, startAt = 0) {
  if (!ctx || muted) return
  const t0 = now() + startAt
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = type
  o.frequency.setValueAtTime(freqStart, t0)
  o.frequency.exponentialRampToValueAtTime(freqEnd, t0 + dur)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  o.connect(g)
  g.connect(master)
  o.start(t0)
  o.stop(t0 + dur + 0.02)
}

// a short burst of highpassed noise — paper riffle / chalk taps, no tone at all
function noiseTick(dur, hpFreq, vol, startAt = 0) {
  if (!ctx || muted) return
  const t0 = now() + startAt
  const src = ctx.createBufferSource()
  src.buffer = noise
  const f = ctx.createBiquadFilter()
  f.type = 'highpass'
  f.frequency.value = hpFreq
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.006)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  src.connect(f)
  f.connect(g)
  g.connect(master)
  src.start(t0)
  src.stop(t0 + dur + 0.02)
}

// a bandpassed noise rap — chalk/marker taps
function noiseRap(dur, bpFreq, q, vol, startAt = 0) {
  if (!ctx || muted) return
  const t0 = now() + startAt
  const src = ctx.createBufferSource()
  src.buffer = noise
  const f = ctx.createBiquadFilter()
  f.type = 'bandpass'
  f.frequency.value = bpFreq
  f.Q.value = q
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.004)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  src.connect(f)
  f.connect(g)
  g.connect(master)
  src.start(t0)
  src.stop(t0 + dur + 0.02)
}

// ---- hover ticks — one distinct voice per artifact kind ----
const HOVER_VOICES = {
  monitor: () => blip(1800, 2200, 0.03, 'square', 0.025),
  screen: () => blip(2000, 2350, 0.03, 'square', 0.025),
  papers: () => noiseTick(0.02, 5200, 0.05),
  whiteboard: () => blip(820, 620, 0.045, 'sine', 0.05),
  neural: () => {
    blip(900, 1400, 0.07, 'sine', 0.03)
    blip(1350, 1400, 0.07, 'sine', 0.012, 0.005)
  },
  drone: () => {
    blip(300, 290, 0.015, 'square', 0.03)
    blip(300, 290, 0.015, 'square', 0.03, 0.05)
  },
}
export function playHover(kind) {
  const voice = HOVER_VOICES[kind]
  if (voice) voice()
  else blip(1300, 1600, 0.06, 'sine', 0.04)
}

// ---- select confirmations — one distinct voice per artifact kind ----
const SELECT_VOICES = {
  monitor: () => {
    blip(560, 560, 0.09, 'triangle', 0.1)
    blip(900, 900, 0.09, 'triangle', 0.1, 0.09)
    blip(1200, 1200, 0.12, 'triangle', 0.11, 0.18)
  },
  papers: () => {
    blip(200, 160, 0.1, 'square', 0.1)
    blip(3200, 3000, 0.05, 'sine', 0.05, 0.02)
  },
  whiteboard: () => {
    noiseRap(0.05, 520, 3, 0.14)
    noiseRap(0.05, 480, 3, 0.13, 0.09)
  },
  neural: () => {
    if (!ctx || muted) return
    const t0 = now()
    const dur = 0.32
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(400, t0)
    filter.frequency.exponentialRampToValueAtTime(2200, t0 + dur)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t0)
    g.gain.exponentialRampToValueAtTime(0.1, t0 + dur * 0.6)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur + 0.08)
    filter.connect(g)
    g.connect(master)
    ;[0, -6].forEach((detune) => {
      const o = ctx.createOscillator()
      o.type = 'sawtooth'
      o.frequency.setValueAtTime(200, t0)
      o.frequency.exponentialRampToValueAtTime(700, t0 + dur)
      o.detune.value = detune
      o.connect(filter)
      o.start(t0)
      o.stop(t0 + dur + 0.1)
    })
  },
  screen: () => {
    blip(900, 1400, 0.06, 'triangle', 0.09)
    blip(1400, 900, 0.09, 'triangle', 0.09, 0.06)
  },
  drone: () => {
    if (!ctx || muted) return
    const t0 = now()
    const dur = 0.12
    const o = ctx.createOscillator()
    o.type = 'square'
    o.frequency.setValueAtTime(60, t0)
    o.frequency.exponentialRampToValueAtTime(180, t0 + dur)
    const trem = ctx.createOscillator()
    trem.frequency.value = 28
    const tremGain = ctx.createGain()
    tremGain.gain.value = 0.05
    trem.connect(tremGain)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.09, t0)
    tremGain.connect(g.gain)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur + 0.03)
    o.connect(g)
    g.connect(master)
    trem.start(t0)
    trem.stop(t0 + dur + 0.03)
    o.start(t0)
    o.stop(t0 + dur + 0.03)
  },
}
export function playSelect(kind) {
  const voice = SELECT_VOICES[kind]
  if (voice) voice()
  else blip(560, 900, 0.13, 'sine', 0.12)
}

// leaving an inspected object — split by room so Lab feels colder than Studio
export function playBack(room) {
  if (room === 'lab') blip(680, 420, 0.1, 'sine', 0.08)
  else blip(720, 440, 0.16, 'sine', 0.09)
}

// room-to-room travel — direction-aware so entering the Lab sounds different
// from returning to the Studio, previewing the destination's register
export function playWhoosh(direction) {
  if (!ctx || muted) return
  const intoLab = direction === 'lab'
  const t0 = now()
  const src = ctx.createBufferSource()
  src.buffer = noise
  const f = ctx.createBiquadFilter()
  f.type = 'bandpass'
  f.Q.value = intoLab ? 1.1 : 0.7
  f.frequency.setValueAtTime(300, t0)
  f.frequency.exponentialRampToValueAtTime(intoLab ? 2600 : 1900, t0 + 0.28)
  f.frequency.exponentialRampToValueAtTime(intoLab ? 620 : 420, t0 + 0.6)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(0.12, t0 + 0.12)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.6)
  src.connect(f)
  f.connect(g)
  g.connect(master)
  src.start(t0)
  src.stop(t0 + 0.65)
}
