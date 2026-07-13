# Baked hero-room pipeline

MINDSCAPE's hero rooms (Studio, Lab, …) use **baked lighting**, the technique
behind Bruno Simon's *my-room-in-3d*: model a room once, bake its global
illumination into textures in Blender, then render it flat — **no runtime
lights, no shadow maps, near-zero GPU cost**. All the warmth lives in the bake.

There are two halves. The **code half is done and verified**; the **asset half**
is a Blender step you (or a 3D artist) run per room.

---

## 1. The code half — done

- [`src/game/shaders/BakedMaterial.js`](../src/game/shaders/BakedMaterial.js) —
  Bruno's baked shader ported to R3F / three 0.169. Cross-fades three baked
  textures (day / night / neutral) and adds up to three tinted glow zones packed
  into one lightMap's R/G/B channels.
- [`src/game/BakedRoom.jsx`](../src/game/BakedRoom.jsx) — drop-in component:
  loads a GLB + its baked textures and applies the material to every mesh.
- [`src/game/dev/BakedProof.jsx`](../src/game/dev/BakedProof.jsx) — dev proof
  (runtime-generated placeholder bakes). Visit **`/?bakedproof`** (add
  **`&night=1`**) to see the shader running with no assets.

Once a room's assets exist, wiring it up is:

```jsx
<BakedRoom
  url="/models/studio.glb"
  day="/textures/studio-day.jpg"
  night="/textures/studio-night.jpg"
  neutral="/textures/studio-neutral.jpg"
  lightMap="/textures/studio-lightmap.jpg"
  nightMix={0}                                  // 0 day … 1 night (drive from store)
  lights={{
    a: { color: '#ff9a5c', strength: 1.4 },     // lightMap RED  zone (e.g. lamp)
    b: { color: '#ff7a45', strength: 1.6 },     // lightMap GREEN zone (e.g. desk)
    c: { color: '#5ad1ff', strength: 1.3 },     // lightMap BLUE  zone (e.g. monitor)
  }}
/>
```

---

## 2. The asset half — the Blender bake recipe (per room)

Do this once per hero room. Target a cohesive low-poly-but-lit look.

1. **Model** the room in Blender (or import a CC0 low-poly kit and dress it).
   Keep it to a few thousand tris; this is a hero prop, not a game level.
2. **UV-unwrap** every surface into **one shared UV set with no overlaps**
   (Smart UV Project is fine to start; pack tightly). The bake writes into this
   layout — overlaps = light bleeding.
3. **Light it** for the **day** mood: an HDRI or area lights, warm key + cool
   fill. Add emissive materials for screens/lamps.
4. **Bake → day texture.** Add one Image Texture node (e.g. 2048², name
   `studio-day`) to every material, select it, then
   *Render Properties → Bake → Bake Type: **Combined**, 128+ samples, denoise on*.
   Bake. Save the image as `studio-day.jpg`.
5. **Night bake.** Dim/kill the daylight, keep the practical lamps/screens
   emissive, bake Combined again → `studio-night.jpg`.
6. **Neutral bake.** Flat, even lighting (or Bake Type *Diffuse → Color only*)
   → `studio-neutral.jpg`. Used for a "clean" readable mode.
7. **LightMap (the glow zones).** New black image. For each dynamic light you
   want to tint at runtime, paint a soft white blob where it hits, but **only in
   one channel**: lamp → **R**, desk → **G**, monitor → **B**. (Bake each light
   alone to a temp image, then combine into R/G/B in any image editor, or paint
   by hand.) Save `studio-lightmap.jpg`. The shader multiplies each channel by
   its `lights.{a,b,c}` colour/strength.
8. **Export** the room as **`studio.glb`** (apply transforms; you do *not* need
   to export materials — the app assigns the baked material). Draco compression
   recommended.
9. Drop the `.glb` in `public/models/` and the four `.jpg`s in
   `public/textures/`, then render with `<BakedRoom>` and swap it in for the
   procedural `<Studio>` in [`World.jsx`](../src/game/World.jsx).

**Every CC0/borrowed asset gets credited** in `public/models/CREDITS.md`
(per the plan's locked art rule), even public-domain ones.

---

## 3. Alternative: a code-only in-browser auto-baker (optional)

If we'd rather keep MINDSCAPE fully self-contained (no Blender in the loop), we
can bake our **existing procedural rooms** to textures at build/runtime: render
the room with a rich offline-quality light rig into a UV-space render target
(the standard three.js lightmap-bake trick), then display it flat with the same
`BakedMaterial`. More engineering, zero external tools, stays procedural. This
is a fork worth deciding before producing the real Studio/Lab assets.
