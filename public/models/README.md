# public/models/

Baked hero-room GLBs. Each room is one GLB (modeled + UV-unwrapped + GI-baked in
Blender — see [docs/baked-pipeline.md](../../docs/baked-pipeline.md)) rendered
flat by [`BakedRoom`](../../src/game/BakedRoom.jsx). No lights/materials needed in
the GLB; the app assigns the baked material.

Expected files (swap the placeholder for your real bake, same name):
- `studio.glb` — **placeholder** (a 3-plane iso corner) proving the wiring. Replace
  with the real baked Studio.

Preview any room in the running app at `/?bakedroom` (add `&night=1` for the night
mood). Export **uncompressed** GLB for the simplest path; if you use Draco, enable
it in `BakedRoom`'s `useGLTF(url, true)`.
