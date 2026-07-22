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
    // floor widened ([14, 10.5]) now that this hub has five exits — plain
    // furniture positions below are unchanged, the extra room is all at the edges
    floorSize: [14, 10.5],
    doors: [
      // travel to the lab is along +x, so the archway faces +x
      { to: 'lab', position: [5.2, 0.9, -1.5], rotation: [0, Math.PI / 2, 0], label: 'The Lab' },
      // travel to the threshold is along +z, on the open front edge
      { to: 'threshold', position: [0, 0.9, 3.9], rotation: [0, 0, 0], label: 'The Threshold' },
      // a ladder rather than an archway — climbs straight up to the rooftop.
      // proud of the (now-widened) west wall, same 0.2 offset convention as
      // every other wall-mounted door in the world
      { to: 'rooftop', position: [-5.9, 0.9, 3.0], rotation: [0, Math.PI / 2, 0], label: 'The Rooftop', kind: 'ladder' },
      // also proud of the west wall, spaced well clear of the ladder
      { to: 'library', position: [-5.9, 0.9, 0.5], rotation: [0, Math.PI / 2, 0], label: 'The Library' },
      // also proud of the west wall (a back-wall placement here projects
      // right behind the monitor's hitbox from this iso angle and steals its
      // clicks — verified via screen-space projection, not just eyeballing)
      { to: 'greenhouse', position: [-5.9, 0.9, -2.0], rotation: [0, Math.PI / 2, 0], label: 'The Greenhouse' },
      // on the open east edge, well clear of the Lab's own door on that
      // same edge
      { to: 'guildhall', position: [6.3, 0.9, 2.5], rotation: [0, Math.PI / 2, 0], label: 'The Guild Hall' },
    ],
    // non-Door travel triggers — same `to` contract as doors (goToRoom), a
    // different skin. The football sits in the open floor, clear of the
    // desk cluster and every door's projected screen position. The vault
    // trigger is `kind: 'secret'` — the No.8 poster already on the back
    // wall, made clickable with no idle-pulse affordance, so it doesn't
    // stand out from every other (openly discoverable) glowing object.
    triggers: [
      { to: 'pitch', position: [2.2, -0.75, 1.6], label: 'The Pitch', kind: 'football' },
      { to: 'vault', position: [2.9, 2.35, -3.26], label: 'The Vault', kind: 'secret' },
    ],
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
