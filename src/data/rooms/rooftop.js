/**
 * The Rooftop — marathon + yoga, body/mind. Serene, expansive, open sky.
 * Reached via a vertical "ladder" transition rather than a horizontal door —
 * sits far above Studio in world Y; the orthographic camera's visible extent
 * at typical zoom is much smaller than that gap, so it never bleeds into a
 * ground-level room's frame despite every room staying permanently mounted.
 * See src/data/world.js for the shape every room module exports.
 */
export const rooftop = {
  room: {
    id: 'rooftop',
    name: 'The Rooftop',
    tagline: 'Where the noise stops.',
    origin: [0, 40, 0],
    accent: '#ff9ab0',
    fill: '#3a4a5a',
    fogColor: '#241f2c',
    keyColor: '#ffd4b8',
    keyIntensity: 1.3,
    register: 'warm',
    floorSize: [13, 10],
    wallsEnabled: false,
    particles: 'dust',
    camera: { look: [0, 41.2, 0], zoom: 62 },
    objectIds: ['rooftop-trail', 'rooftop-yoga'],
    doors: [{ to: 'studio', position: [-3, 40.9, -2], rotation: [0, Math.PI / 4, 0], label: 'The Studio', kind: 'ladder' }],
  },

  objects: {
    'rooftop-trail': {
      id: 'rooftop-trail',
      room: 'rooftop',
      position: [-1.5, 40.3, 1],
      kind: 'trail',
      label: 'The running trail',
      // a wide, slow reveal with a gentle pan along the route — expansive, not isolated
      inspect: {
        dy: 0.05,
        dz: 0.4,
        zoom: 100,
        k: 2.8,
        swayAmp: 0.06,
        pan: { axis: 'x', amp: 0.35, speed: 0.25 },
        bokeh: 1.8,
      },
      story: {
        eyebrow: 'Marathon · Pace',
        title: '42.195',
        body: 'Long runs taught me how to hold a pace I can sustain instead of burning out in the first mile — the same instinct I bring to shipping software.',
        tags: ['Endurance', 'Discipline', 'Pace'],
      },
    },
    'rooftop-yoga': {
      id: 'rooftop-yoga',
      room: 'rooftop',
      position: [1.3, 40.2, -0.8],
      kind: 'yogamat',
      label: 'The yoga mat',
      // a calm held beat before settling — the room's own quiet asking for a breath first
      inspect: { dy: 0.05, dz: 0.3, zoom: 116, k: 3.2, swayAmp: 0.03, holdBeat: 0.2, bokeh: 2.4 },
      story: {
        eyebrow: 'Yoga · Balance',
        title: 'Breathe first',
        body: "Some of my best thinking happens when I stop trying to force it — yoga is where I practice that on purpose.",
        tags: ['Calm', 'Balance', 'Focus'],
      },
    },
  },
}
