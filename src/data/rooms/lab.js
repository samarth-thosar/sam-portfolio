/**
 * The Lab — AI/GenAI/ML systems he's shipped. Cold, clinical, machine.
 * See src/data/world.js for the shape every room module exports.
 */
export const lab = {
  room: {
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
    register: 'cool', // audio.js playBack/playWhoosh register
    camera: { look: [24, 1.2, 0], zoom: 70 },
    objectIds: ['lab-neural', 'lab-visionguard', 'lab-drone'],
    // just proud of the side wall (inner face x=19.4) so the arch reads as a
    // portal on the wall instead of poking through it
    doors: [{ to: 'studio', position: [19.6, 0.9, -1.5], rotation: [0, Math.PI / 2, 0], label: 'The Studio' }],
  },

  objects: {
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
