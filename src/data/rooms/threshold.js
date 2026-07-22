import { links } from '../links.js'

/**
 * The Threshold — arrival. Warm, welcoming, the first thing a visitor sees.
 * `WORLD.start` points here. See src/data/world.js for the shape every room
 * module exports.
 */
export const threshold = {
  room: {
    id: 'threshold',
    name: 'The Threshold',
    tagline: 'Where it begins.',
    origin: [0, 0, 24],
    accent: '#ff7a45',
    fill: '#332a22',
    fogColor: '#181310',
    keyColor: '#ffe4c4',
    keyIntensity: 1.4,
    register: 'warm',
    camera: { look: [0, 1.2, 24], zoom: 68 },
    objectIds: ['threshold-letter', 'threshold-mailbox'],
    // proud of the back wall (world z ~20.7) so the arch reads as a portal
    // built into the wall — the same convention lab-studio's door already uses
    doors: [{ to: 'studio', position: [0, 0.9, 20.9], rotation: [0, 0, 0], label: 'The Studio' }],
  },

  objects: {
    'threshold-letter': {
      id: 'threshold-letter',
      room: 'threshold',
      position: [-1.5, 1.0, 23],
      kind: 'letter',
      label: 'A letter',
      inspect: { dy: 0.1, dz: 0.3, zoom: 122, k: 3.5, swayAmp: 0.05, bokeh: 2.2 },
      story: {
        eyebrow: 'Welcome',
        title: 'Bring me your toughest problem',
        body: "I'm driven by curiosity and systems thinking — I'd rather connect ideas across AI, product, cognitive science, and HCI than stay in one lane. If you've got a hard, confusing problem, I want to hear about it.",
        tags: ['Freelance', 'Systems thinking', 'Curiosity'],
      },
    },
    'threshold-mailbox': {
      id: 'threshold-mailbox',
      room: 'threshold',
      position: [1.3, 0.9, 23.2],
      kind: 'mailbox',
      label: 'The mailbox',
      inspect: { dy: 0.05, dz: 0.3, zoom: 120, k: 4, swayAmp: 0.05, bokeh: 2.2 },
      story: {
        eyebrow: 'Get in touch',
        title: 'Say hello',
        body: "However you'd rather reach me — it's all here.",
        links: [
          { label: 'GitHub', href: links.github },
          { label: 'LinkedIn', href: links.linkedin },
          { label: 'Scholar', href: links.scholar },
          { label: 'Email', href: links.email },
          { label: 'CV', href: links.cv },
        ],
      },
    },
  },
}
