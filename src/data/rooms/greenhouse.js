/**
 * The Greenhouse — startups, ambitions, growth. Hopeful, playful, warm light.
 * See src/data/world.js for the shape every room module exports.
 */
export const greenhouse = {
  room: {
    id: 'greenhouse',
    name: 'The Greenhouse',
    tagline: 'Where things grow.',
    origin: [0, 0, -24],
    accent: '#7ed957',
    fill: '#33402a',
    fogColor: '#141a10',
    keyColor: '#e8f5d0',
    keyIntensity: 1.4,
    register: 'warm', // audio.js playBack/playWhoosh register
    camera: { look: [0, 1.2, -24], zoom: 70 },
    objectIds: ['greenhouse-revogreen', 'greenhouse-seeds'],
    // on its own open south edge — the same convention Studio's own door to
    // the Threshold already uses
    doors: [{ to: 'studio', position: [0, 0.9, -20.1], rotation: [0, 0, 0], label: 'The Studio' }],
  },

  objects: {
    'greenhouse-revogreen': {
      id: 'greenhouse-revogreen',
      room: 'greenhouse',
      position: [-1.6, -0.9, -25.5],
      kind: 'revogreen',
      label: 'Where it started',
      inspect: { dy: 0.35, dz: 0.35, zoom: 116, k: 3.2, swayAmp: 0.05, bokeh: 2.2 },
      story: {
        eyebrow: 'First internship · Revogreen',
        title: 'The first thing I shipped',
        body: 'My first real build: a Smart Shunt monitoring app over Bluetooth, from Figma mockups to a working Flutter deployment. Everything since has grown from the habit I built there — take a problem all the way to something real.',
        tags: ['Flutter', 'Bluetooth/IoT', 'Figma-to-deploy'],
      },
    },
    'greenhouse-seeds': {
      id: 'greenhouse-seeds',
      room: 'greenhouse',
      position: [1.6, 0.95, -25.3],
      kind: 'seeds',
      label: "What's next",
      inspect: { dy: 0.1, dz: 0.3, zoom: 120, k: 3.6, swayAmp: 0.04, bokeh: 2.1 },
      story: {
        eyebrow: 'Areas of interest',
        title: 'Still growing',
        body: "AI/ML, mobile, and research — three seeds I'm still watering. I don't know yet which one grows tallest, and I like it that way.",
        tags: ['AI/ML', 'Mobile', 'Research'],
      },
    },
  },
}
