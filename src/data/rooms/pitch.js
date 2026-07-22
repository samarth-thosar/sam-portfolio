/**
 * The Pitch — football, camaraderie, drive. Reached by kicking the ball
 * sitting on Studio's floor rather than walking through an archway; see
 * `studio.js`'s `triggers` array and `game/rooms/Studio.jsx`'s Football
 * component. Returns through a normal door like every other room.
 * See src/data/world.js for the shape every room module exports.
 */
export const pitch = {
  room: {
    id: 'pitch',
    name: 'The Pitch',
    tagline: 'The number on my back.',
    origin: [-24, 0, -24],
    accent: '#3ddc73',
    fill: '#203020',
    fogColor: '#0c1a10',
    keyColor: '#e8ffe0',
    keyIntensity: 1.45,
    register: 'warm', // audio.js playBack/playWhoosh register
    camera: { look: [-24, 1.2, -24], zoom: 70 },
    objectIds: ['pitch-locker', 'pitch-tactics'],
    // on its own open south edge — the same convention Studio's own door to
    // the Threshold already uses
    doors: [{ to: 'studio', position: [-24, 0.9, -20.1], rotation: [0, 0, 0], label: 'The Studio' }],
  },

  objects: {
    'pitch-locker': {
      id: 'pitch-locker',
      room: 'pitch',
      position: [-26.2, 1.15, -22.6],
      kind: 'jersey',
      label: 'No.8',
      inspect: { dy: 0.15, dz: 0.3, zoom: 118, k: 3.2, swayAmp: 0.04, bokeh: 2.3 },
      story: {
        eyebrow: 'Football · Midfield',
        title: 'Playmaker',
        body: "No.8 is the number I actually play, not just a poster on a wall. It's the seat between defense and attack — you see the whole pitch from there, and you decide what happens next. That's the same seat I look for on any team.",
        tags: ['No.8', 'Midfield', 'Playmaker'],
      },
    },
    'pitch-tactics': {
      id: 'pitch-tactics',
      room: 'pitch',
      position: [-21.7, 1.4, -25.3],
      kind: 'tactics',
      label: 'The tactics board',
      inspect: {
        dy: -0.05,
        dz: 0.35,
        zoom: 112,
        k: 3,
        swayAmp: 0.04,
        pan: { axis: 'x', amp: 0.4, speed: 0.3 },
        bokeh: 2.5,
      },
      story: {
        eyebrow: 'How I actually play',
        title: 'The formation is the skillset',
        body: "Every position on this board is a skill I actually bring: vision to read the whole system, the discipline to track back and fix what's broken, the timing to know when to make the run. Football taught me how a team wins before software ever did.",
        tags: ['Systems view', 'Discipline', 'Timing'],
      },
    },
  },
}
