/**
 * The Vault — hidden achievements, quiet pride. Reached by clicking the No.8
 * poster in Studio (a secret, not an obvious glowing switch — see
 * `studio.js`'s `triggers` array, `kind: 'secret'`), not by walking through
 * an archway. Sits 30 world-Y units below Studio, the same proven-safe
 * vertical-separation trick the Rooftop already uses (just downward instead
 * of up). Returns through a normal door like every other room.
 * See src/data/world.js for the shape every room module exports.
 */
export const vault = {
  room: {
    id: 'vault',
    name: 'The Vault',
    tagline: 'Quiet pride.',
    origin: [0, -30, 0],
    accent: '#d4af37',
    fill: '#241d10',
    fogColor: '#0d0a05',
    keyColor: '#ffe9b8',
    keyIntensity: 1.2,
    register: 'cool', // audio.js playBack/playWhoosh register
    floorSize: [7, 6],
    camera: { look: [0, -28.8, 0], zoom: 78 },
    objectIds: ['vault-certs', 'vault-globe', 'vault-plaque'],
    // proud of its own west wall — the same convention Lab's door already uses
    doors: [{ to: 'studio', position: [-2.4, -29.1, 0], rotation: [0, Math.PI / 2, 0], label: 'The Studio' }],
  },

  objects: {
    'vault-certs': {
      id: 'vault-certs',
      room: 'vault',
      position: [1.2, -29.15, 0.4],
      kind: 'certs',
      label: 'Certifications',
      inspect: { dy: 0, dz: 0.3, zoom: 118, k: 3.2, swayAmp: 0.03, bokeh: 2.2 },
      story: {
        eyebrow: 'Certifications',
        title: 'Certified in the tools building this',
        body: 'Five Anthropic certifications — MCP, the Claude API, Agent Skills, Claude Code in Action, and AI Fluency — plus an IBM Full-Stack Specialization. A nice bit of symmetry: certified in the exact toolchain this world was built with.',
        tags: ['Anthropic ×5', 'IBM Full-Stack', 'Certified'],
      },
    },
    'vault-globe': {
      id: 'vault-globe',
      room: 'vault',
      position: [-1.0, -28.4, -0.6],
      kind: 'globe',
      label: 'The Cropwise globe',
      // a slow orbit-reveal — impact at global scale deserves a beat around it
      inspect: { dy: 0.15, dz: 0.35, zoom: 108, k: 2.8, swayAmp: 0.04, orbitDeg: 18, bokeh: 2.6 },
      story: {
        eyebrow: 'Cropwise Grower · Scale',
        title: '3,000,000+ people, one feature',
        body: "The whiteboard tells the architecture story; this is the other half — that one React Native feature reached 3M+ farmers through Cropwise Grower. It's easy to lose sight of scale like that from inside the code.",
        tags: ['3M+ users', 'React Native', 'Global scale'],
      },
    },
    'vault-plaque': {
      id: 'vault-plaque',
      room: 'vault',
      position: [1.0, -29.25, -1.3],
      kind: 'plaque',
      label: 'By the numbers',
      inspect: { dy: 0.05, dz: 0.3, zoom: 120, k: 3.5, swayAmp: 0.03, bokeh: 2.2 },
      story: {
        eyebrow: "The numbers I don't lead with",
        title: 'A quiet plaque, not a resume',
        body: "8.64 CGPA. 2 published papers. 35 mentees. 60+ workshop attendees. None of these are the point on their own — I just didn't want them to disappear entirely either.",
        tags: ['8.64 CGPA', '2 papers', '35 mentees', '60+ attendees'],
      },
    },
  },
}
