/**
 * Procedural audio — everything is synthesized with the Web Audio API so we ship
 * warm, tasteful sound with zero asset files and no autoplay problems (the context
 * is created on the visitor's first gesture: pressing "Enter").
 *
 * - a soft evolving ambient pad + air (the room "breathes")
 * - tactile one-shots: hover tick, select, back, and a whoosh for room glides
 */

let ctx = null
let master = null
let ambientGain = null
let started = false
let muted = false

function now() {
  return ctx.currentTime
}

// pink-ish noise buffer for "air" + whooshes
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

  // warm low pad — a soft, wide A minor-ish drone
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
}

export function setMuted(v) {
  muted = v
  if (!ctx || !master) return
  master.gain.cancelScheduledValues(now())
  master.gain.linearRampToValueAtTime(v ? 0 : 0.9, now() + 0.25)
}

// ---- one-shots ----
function blip(freqStart, freqEnd, dur, type = 'sine', vol = 0.12) {
  if (!ctx || muted) return
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = type
  o.frequency.setValueAtTime(freqStart, now())
  o.frequency.exponentialRampToValueAtTime(freqEnd, now() + dur)
  g.gain.setValueAtTime(0.0001, now())
  g.gain.exponentialRampToValueAtTime(vol, now() + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, now() + dur)
  o.connect(g)
  g.connect(master)
  o.start()
  o.stop(now() + dur + 0.02)
}

export function playHover() {
  blip(1300, 1600, 0.06, 'sine', 0.04)
}
export function playSelect() {
  blip(560, 900, 0.13, 'sine', 0.12)
}
export function playBack() {
  blip(720, 480, 0.14, 'sine', 0.09)
}

export function playWhoosh() {
  if (!ctx || muted) return
  const src = ctx.createBufferSource()
  src.buffer = noise
  const f = ctx.createBiquadFilter()
  f.type = 'bandpass'
  f.Q.value = 0.7
  f.frequency.setValueAtTime(300, now())
  f.frequency.exponentialRampToValueAtTime(2200, now() + 0.28)
  f.frequency.exponentialRampToValueAtTime(500, now() + 0.6)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, now())
  g.gain.exponentialRampToValueAtTime(0.12, now() + 0.12)
  g.gain.exponentialRampToValueAtTime(0.0001, now() + 0.6)
  src.connect(f)
  f.connect(g)
  g.connect(master)
  src.start()
  src.stop(now() + 0.65)
}
