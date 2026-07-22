/**
 * The Library — research, empathy, how he thinks. Calm intellect, hushed.
 * See src/data/world.js for the shape every room module exports.
 */
export const library = {
  room: {
    id: 'library',
    name: 'The Library',
    tagline: 'Where ideas connect.',
    origin: [-24, 0, 0],
    accent: '#a78bfa',
    fill: '#2c2640',
    fogColor: '#141026',
    keyColor: '#e8e0ff',
    keyIntensity: 1.35,
    register: 'cool', // audio.js playBack/playWhoosh register
    camera: { look: [-24, 1.2, 0], zoom: 70 },
    objectIds: ['library-neonate', 'library-constellation'],
    // proud of its own west wall (inner face local x=-4.6) — the same
    // convention the Lab's door already uses
    doors: [{ to: 'studio', position: [-28.4, 0.9, -1.5], rotation: [0, Math.PI / 2, 0], label: 'The Studio' }],
  },

  objects: {
    'library-neonate': {
      id: 'library-neonate',
      room: 'library',
      position: [-25.2, 1.0, -1.6],
      kind: 'neonate',
      label: 'NeoNate Mom',
      inspect: { dy: 0.1, dz: 0.3, zoom: 122, k: 3.4, swayAmp: 0.04, holdBeat: 0.15, bokeh: 2.3 },
      story: {
        eyebrow: 'HCI · ACM CHI (under review)',
        title: 'A platform for 1,000+ mothers',
        body: 'NeoNate Mom exists because software can hold people, not just data. I co-built a platform that supported over a thousand mothers of preterm infants through one of the hardest chapters of their lives — the empathy came first, the engineering followed it.',
        tags: ['HCI', 'Empathy-driven design', 'ACM CHI'],
      },
    },
    'library-constellation': {
      id: 'library-constellation',
      room: 'library',
      position: [-22.6, 2.1, -1.2],
      kind: 'constellation',
      label: 'A constellation of ideas',
      // a slow orbit-reveal — the ceiling piece gets looked around, not just at
      inspect: { dy: -0.15, dz: 0.35, zoom: 108, k: 2.6, swayAmp: 0.05, orbitDeg: 22, bokeh: 2.6 },
      story: {
        eyebrow: 'How I think',
        title: 'Everything connects to everything',
        body: "I care as much about how people think as how software works. AI, product, cognitive science, HCI — I'd rather draw the lines between fields than stay inside one of them.",
        tags: ['Systems thinking', 'Cognitive science', 'Cross-disciplinary'],
      },
    },
  },
}
