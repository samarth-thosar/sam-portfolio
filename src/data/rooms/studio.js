/**
 * The Studio — hub room. Warm, human, analog: where things get built.
 * See src/data/world.js for the shape every room module exports.
 */
export const studio = {
  room: {
    id: 'studio',
    name: 'The Studio',
    tagline: 'Where things get built.',
    origin: [0, 0, 0],
    accent: '#ff7a45',
    fill: '#2a3550', // subtle cool bounce
    // warm, human, analog: a practical-lamp key and dusty attic-workshop air
    fogColor: '#140f0b',
    keyColor: '#ffe9d2',
    keyIntensity: 1.55,
    register: 'warm', // audio.js playBack/playWhoosh register
    camera: { look: [0, 1.2, 0], zoom: 70 },
    objectIds: ['studio-monitor', 'studio-papers', 'studio-whiteboard'],
    // travel to the lab is along +x, so the archway faces +x
    doors: [{ to: 'lab', position: [5.2, 0.9, -1.5], rotation: [0, Math.PI / 2, 0], label: 'The Lab' }],
  },

  objects: {
    'studio-monitor': {
      id: 'studio-monitor',
      room: 'studio',
      position: [-1.4, 1.15, -1.6],
      kind: 'monitor',
      label: 'Workstation',
      // steady documentary walk-up — confident, no drama needed for the workbench
      inspect: { dy: 0.05, dz: 0.35, zoom: 118, k: 4.2, swayAmp: 0.06, bokeh: 2.2 },
      story: {
        eyebrow: 'Full-Stack · CloudMotiv',
        title: 'The workbench',
        body: 'I architect both ends and make them ship. At CloudMotiv I built an AI document-intelligence platform — ingestion pipelines, AWS auth, and LLM workflows tuned to cut cost.',
        tags: ['React', 'Node', 'AWS', 'LLM pipelines'],
      },
    },
    'studio-papers': {
      id: 'studio-papers',
      room: 'studio',
      position: [0.2, 1.02, -1.5],
      kind: 'papers',
      label: 'On the desk',
      // a fast, held-still "glance down" — quick snap, almost no sway
      inspect: { dy: 0.15, dz: 0.15, zoom: 130, k: 6.5, swayAmp: 0.02, bokeh: 2.0 },
      story: {
        eyebrow: 'Research · Peer-reviewed',
        title: 'Two papers, one submission',
        body: 'I write when I find something worth proving. Two IEEE publications (Scopus-indexed) on deepfake detection and privacy-preserving health surveillance, plus a co-authored submission under review at ACM CHI for NeoNate Mom, a platform that supported 1000+ mothers of preterm infants.',
        tags: ['IEEE ×2', 'ACM CHI', 'HCI'],
        link: { label: 'View publications', href: 'https://doi.org/10.1109/ICAICCIT60255.2023.10465762' },
      },
    },
    'studio-whiteboard': {
      id: 'studio-whiteboard',
      room: 'studio',
      position: [1.9, 1.7, -2.2],
      kind: 'whiteboard',
      label: 'Whiteboard',
      // a slow lateral dolly across the sketch, like reading a diagram left-to-right
      inspect: {
        dy: -0.1,
        dz: 0.3,
        zoom: 118,
        k: 3,
        swayAmp: 0.05,
        pan: { axis: 'x', amp: 0.55, speed: 0.35 },
        bokeh: 2.6,
      },
      story: {
        eyebrow: 'Systems thinking',
        title: 'Order out of confusion',
        body: 'I like the tense, confusing problems — the ones that need a clean architecture drawn out of the noise. I turned the Syngenta Plantix feature into a reusable React Native package deployed across global apps, including Cropwise Grower (3M+ users).',
        tags: ['Architecture', 'React Native', '3M+ users'],
      },
    },
  },
}
