/**
 * The world graph. Phase 0 ships two greybox rooms (Studio hub + Lab) placed
 * side-by-side in world space; the camera glides between them. Geometry is
 * intentionally simple here — the value is in the structure, camera, interaction
 * and *real* content, which later phases dress with finished art.
 *
 * Coordinate convention: each room has an `origin`; object/door positions are in
 * world space. The iso camera frames `camera.look` (a world point) at `camera.zoom`.
 */

export const WORLD = {
  start: 'studio',

  rooms: {
    studio: {
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
      camera: { look: [0, 1.2, 0], zoom: 70 },
      objectIds: ['studio-monitor', 'studio-papers', 'studio-whiteboard'],
      // travel to the lab is along +x, so the archway faces +x
      doors: [{ to: 'lab', position: [5.2, 0.9, -1.5], rotation: [0, Math.PI / 2, 0], label: 'The Lab' }],
    },
    lab: {
      id: 'lab',
      name: 'The Lab',
      tagline: 'Teaching machines to be useful.',
      origin: [24, 0, 0],
      accent: '#5ad1ff',
      fill: '#3a2f50',
      // cold, clinical, machine: a harder cyan key, sealed-cleanroom air, no warm leak
      fogColor: '#0a121c',
      keyColor: '#cfe8ff',
      keyIntensity: 1.75,
      rim: '#5ad1ff',
      floorRoughness: 0.75,
      floorMetalness: 0.07,
      particles: 'data',
      camera: { look: [24, 1.2, 0], zoom: 70 },
      objectIds: ['lab-neural', 'lab-visionguard', 'lab-drone'],
      // just proud of the side wall (inner face x=19.4) so the arch reads as a
      // portal on the wall instead of poking through it
      doors: [{ to: 'studio', position: [19.6, 0.9, -1.5], rotation: [0, Math.PI / 2, 0], label: 'The Studio' }],
    },
  },

  objects: {
    // ---------------- Studio ----------------
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

    // ---------------- Lab ----------------
    'lab-neural': {
      id: 'lab-neural',
      room: 'lab',
      position: [24, 1.5, -1.6],
      kind: 'neural',
      label: 'Neural core',
      // the one object the camera looks AROUND — a slow orbit-reveal after a breath
      inspect: { dy: 0.1, dz: 0.1, zoom: 122, k: 2.6, swayAmp: 0.05, orbitDeg: 16, holdBeat: 0.15, bokeh: 2.8 },
      story: {
        eyebrow: 'AI · GenAI · RAG',
        title: 'The playground',
        body: 'I like giving people plain language as the interface. SceneIt lets you edit video with natural language — trims, transitions and effects from plain text — cutting manual editing time by over 70%.',
        tags: ['GenAI', 'RAG', 'Prompt design'],
      },
    },
    'lab-visionguard': {
      id: 'lab-visionguard',
      room: 'lab',
      position: [25.6, 1.15, -1.5],
      kind: 'screen',
      label: 'VisionGuard',
      // documentary-steady, evidence being presented — a real hold before the push
      inspect: { dy: 0.05, dz: 0.3, zoom: 132, k: 3, swayAmp: 0.02, holdBeat: 0.35, bokeh: 2.6 },
      story: {
        eyebrow: 'Deep learning · CV',
        title: 'VisionGuard',
        body: 'Deepfakes needed a referee, so I built one. A CNN–LSTM model that detects AI-generated video manipulation in real time, with Grad-CAM to localise the forged regions — 92% accuracy on FaceForensics++ using PyTorch and OpenCV.',
        tags: ['PyTorch', 'CNN-LSTM', 'Grad-CAM', '92%'],
      },
    },
    'lab-drone': {
      id: 'lab-drone',
      room: 'lab',
      position: [22.5, 1.0, -1.4],
      kind: 'drone',
      label: 'Prototype drone',
      // a quick product-reveal turntable — machine under monitoring, subtly unsteady
      inspect: { dy: 0.15, dz: 0.25, zoom: 126, k: 4, swayAmp: 0.08, orbitDeg: 9, bokeh: 2.4 },
      story: {
        eyebrow: 'ML · Predictive maintenance',
        title: 'Diagnosis & prognosis',
        body: "I'd rather catch a failure than explain one after the fact. This drone fleet gets its own early-warning system — ML models for diagnosis, prognosis and automated alerts, surfaced live on a dashboard for real-time monitoring.",
        tags: ['Time-series', 'Alerting', 'Dashboards'],
      },
    },
  },
}

export const DISCOVERABLE_IDS = Object.keys(WORLD.objects)
