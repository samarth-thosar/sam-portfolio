# MINDSCAPE — Samarth Thosar's portfolio

Not a résumé — a small world. **MINDSCAPE** is a handcrafted, camera-led isometric
exploration game: two rooms, six real artifacts from Samarth's work, each with its own
cinematic camera move, sound, and story. No scrolling, no pages — you explore by
clicking.

## The world

- **The Studio** — warm, human, analog. A workbench (CloudMotiv's AI document-intelligence
  platform), two IEEE papers + an ACM CHI submission on the desk, and a whiteboard sketching
  out the systems-thinking behind the Cropwise Grower architecture (3M+ users).
- **The Lab** — cold, clinical, machine. A rotating neural-core sculpture (SceneIt's
  natural-language video editing), a live Grad-CAM detection readout (VisionGuard, a
  deepfake detector at 92% on FaceForensics++), and a prototype drone with a real-time
  predictive-maintenance dashboard.

Click a glowing object to inspect it — the camera pushes in with a move built for that
object specifically (a slow dolly across the whiteboard, an orbit around the neural core, a
deliberate hold before VisionGuard's reveal). Click a doorway (or use ← →) to travel between
rooms. Every room has its own lighting, fog, particle life, and ambient sound layer.

## Stack

- **React 18 + Vite**
- **three.js + @react-three/fiber + @react-three/drei + @react-three/postprocessing** — the
  3D world, camera rig, and DepthOfField/Bloom/Vignette post pipeline
- **zustand** — all game state (current room, inspected object, discoveries, calm/mute)
- **Procedural Web Audio** — every sound (ambient beds, hover ticks, select confirmations,
  room-travel whooshes) is synthesized at runtime; there are no audio asset files
- Fonts: **Clash Display** + **General Sans** (Fontshare) + **JetBrains Mono**

## Run

```bash
npm install
npm run dev      # local dev server
npm run build    # production build → dist/
npm run preview  # preview the build
```

## Structure

```
src/
  game/
    World.jsx           # canvas, lights, postprocessing, room router
    CameraRig.jsx        # drives the orthographic camera from game state
    Interactable.jsx     # hover/click wrapper for every inspectable object
    Door.jsx              # room-to-room travel archway
    store.js              # zustand game state
    audio.js               # procedural Web Audio (ambient beds + one-shots)
    props.jsx               # reusable animated 3D primitives + bespoke screens
    rooms/{RoomShell,Studio,Lab}.jsx
    ui/{TitleScreen,HUD,InspectCard,GameUI}.jsx
  data/
    world.js              # the room graph: positions, camera moves, story content
    links.js                # contact info (GitHub/LinkedIn/CV/email)
  three/posters.js          # canvas-texture art (wall posters, screen readouts)
```

## Verification

`scripts/` has a headless-browser test harness (Puppeteer + Edge) that drives the real
game with real pointer events — see `scripts/README.md`.

## Accessibility

A "calm" toggle (and `prefers-reduced-motion`) suppresses camera sway, orbit/pan moves,
and idle animation throughout the world.
