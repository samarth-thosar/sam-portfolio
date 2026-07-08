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
      story: {
        eyebrow: 'Full-Stack · CloudMotiv',
        title: 'The workbench',
        body: 'I architect both ends and make them ship. At CloudMotiv I built an AI document-intelligence platform — ingestion pipelines, AWS auth, and LLM workflows tuned to cut cost — plus a drone health-monitoring system with predictive maintenance.',
        tags: ['React', 'Node', 'AWS', 'LLM pipelines'],
      },
    },
    'studio-papers': {
      id: 'studio-papers',
      room: 'studio',
      position: [0.2, 1.02, -1.5],
      kind: 'papers',
      label: 'On the desk',
      story: {
        eyebrow: 'Research · Peer-reviewed',
        title: 'Two papers, one submission',
        body: 'Two IEEE publications (Scopus-indexed) on deepfake detection and privacy-preserving health surveillance — and a co-authored paper under review at ACM CHI for NeoNate Mom, a platform that supported 1000+ mothers of preterm infants.',
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
      story: {
        eyebrow: 'AI · GenAI · RAG',
        title: 'The playground',
        body: 'LLM workflows, retrieval systems, and prompt-driven tools. SceneIt lets you edit video with natural language — trims, transitions and effects from plain text — cutting manual editing time by over 70%.',
        tags: ['GenAI', 'RAG', 'Prompt design'],
      },
    },
    'lab-visionguard': {
      id: 'lab-visionguard',
      room: 'lab',
      position: [25.6, 1.15, -1.5],
      kind: 'screen',
      label: 'VisionGuard',
      story: {
        eyebrow: 'Deep learning · CV',
        title: 'VisionGuard',
        body: 'A CNN–LSTM model that detects AI-generated video manipulation in real time, with Grad-CAM to localise the forged regions. 92% accuracy on FaceForensics++ using PyTorch and OpenCV.',
        tags: ['PyTorch', 'CNN-LSTM', 'Grad-CAM', '92%'],
      },
    },
    'lab-drone': {
      id: 'lab-drone',
      room: 'lab',
      position: [22.5, 1.0, -1.4],
      kind: 'drone',
      label: 'Prototype drone',
      story: {
        eyebrow: 'ML · Predictive maintenance',
        title: 'Diagnosis & prognosis',
        body: 'Machine-learning models for drone fleet health — diagnosis, prognosis and automated alerts — surfaced through interactive dashboards for real-time monitoring.',
        tags: ['Time-series', 'Alerting', 'Dashboards'],
      },
    },
  },
}

export const DISCOVERABLE_IDS = Object.keys(WORLD.objects)
