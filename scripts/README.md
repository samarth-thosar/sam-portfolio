# Verification harness

Headless-browser smoke tests for MINDSCAPE. They drive the *real* game — real
pointer events on the canvas — and produce screenshots plus a pass/fail matrix
for every interactable and door.

## Setup (one-time)

```
npm i --no-save puppeteer-core
```

(`--no-save` keeps it out of package.json; it uses the system Edge browser, no
browser download.)

## Run

```
npm run dev            # in one terminal
node scripts/shoot.js after            # screenshots: title, both rooms, two inspects
node scripts/verify-interactions.js    # hover/click/Esc matrix for all objects + doors
```

Screenshots land in `scripts/shots/`. If the dev server isn't on 5173, set
`MINDSCAPE_URL`, e.g. `MINDSCAPE_URL=http://localhost:5174 node scripts/shoot.js x`.

## How it works

- `src/game/store.js` exposes `window.__game` (the zustand store) and
  `src/game/World.jsx` exposes `window.__three` (R3F state: scene, camera,
  raycaster) — **dev builds only**, stripped from production.
- `verify-interactions.js` projects each object's world position through the
  live camera to screen pixels, moves the mouse there, and asserts
  hover → click-inspect → Esc via store state. Doors are click-tested the same
  way and must actually change the room. Calm mode is enabled during the run so
  the camera holds still and projections stay exact.
- Screenshot sizes are a quick health check: a black/broken canvas compresses
  to ~35 kB; a rendered room is ~300 kB.

Both scripts assume Microsoft Edge at the standard Windows path; edit `EDGE` at
the top if needed.
