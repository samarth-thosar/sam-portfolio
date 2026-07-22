/**
 * The Guild Hall — leadership, mentorship, community. Warm, generous, gold-lit.
 * See src/data/world.js for the shape every room module exports.
 */
export const guildhall = {
  room: {
    id: 'guildhall',
    name: 'The Guild Hall',
    tagline: 'What I give back.',
    origin: [24, 0, 24],
    accent: '#ffc857',
    fill: '#3a3020',
    fogColor: '#1a1409',
    keyColor: '#ffe9b8',
    keyIntensity: 1.5,
    register: 'warm', // audio.js playBack/playWhoosh register
    camera: { look: [24, 1.2, 24], zoom: 70 },
    objectIds: ['guildhall-mentees', 'guildhall-opensource', 'guildhall-app'],
    // on its own open south edge — the same convention Studio's own door to
    // the Threshold already uses
    doors: [{ to: 'studio', position: [24, 0.9, 20.1], rotation: [0, 0, 0], label: 'The Studio' }],
  },

  objects: {
    'guildhall-mentees': {
      id: 'guildhall-mentees',
      room: 'guildhall',
      position: [21.5, 1.7, 22.4],
      kind: 'mentees',
      label: 'The mentee wall',
      inspect: { dy: 0, dz: 0.35, zoom: 112, k: 3, swayAmp: 0.03, holdBeat: 0.2, bokeh: 2.4 },
      story: {
        eyebrow: 'IEEE · Exec Committee → Project Head',
        title: '35 people I got to help',
        body: "I climbed from Exec Committee to Project Head, then spent that position mentoring 35 students and teaching a DevOps workshop to 60+ more. I care as much about who I helped get somewhere as where I got myself.",
        tags: ['Mentorship', 'DevOps workshop', 'Leadership'],
      },
    },
    'guildhall-opensource': {
      id: 'guildhall-opensource',
      room: 'guildhall',
      position: [25.4, 0.0, 21.6],
      kind: 'opensource',
      label: 'The open-source tree',
      inspect: { dy: 0.3, dz: 0.35, zoom: 110, k: 2.8, swayAmp: 0.04, orbitDeg: 14, bokeh: 2.5 },
      story: {
        eyebrow: 'Hacktoberfest · Level 4 ×2',
        title: "Somebody else's first pull request",
        body: "I've hit Hacktoberfest's top tier twice, but the part I'd repeat is walking someone else through their first-ever pull request. Open source only keeps growing if people keep bringing others in.",
        tags: ['Open source', 'Hacktoberfest ×2', 'Community'],
      },
    },
    'guildhall-app': {
      id: 'guildhall-app',
      room: 'guildhall',
      position: [26.6, 1.0, 25.2],
      kind: 'ieeeapp',
      label: 'The IEEE app',
      inspect: { dy: 0.1, dz: 0.3, zoom: 122, k: 3.4, swayAmp: 0.03, bokeh: 2.2 },
      story: {
        eyebrow: 'Flutter · 5-person team',
        title: 'Leading it, not just building it',
        body: "I led a 5-person team to design and ship the IEEE chapter's official app end to end. It's the clearest artifact I have of leadership actually producing something real, not just a title.",
        tags: ['Flutter', 'Team lead', 'Shipped'],
      },
    },
  },
}
