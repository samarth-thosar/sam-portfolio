# public/textures/

Baked lighting textures for the hero rooms, produced by the Blender bake
(see [docs/baked-pipeline.md](../../docs/baked-pipeline.md)). Four per room:

| file                    | what it is                                    | colour space |
|-------------------------|-----------------------------------------------|--------------|
| `studio-day.png`        | full-room GI bake, day mood                    | sRGB         |
| `studio-night.png`      | full-room GI bake, night mood                  | sRGB         |
| `studio-neutral.png`    | flat/even bake for the clean readable mode     | sRGB         |
| `studio-lightmap.png`   | **R/G/B = three tinted glow zones** (data)     | linear       |

The lightMap is not a picture — each channel is a mask for one runtime-tintable
light: **R** = zone A, **G** = zone B, **B** = zone C (mapped to the `lights`
colours in [`World.jsx`](../../src/game/World.jsx)'s `BakedStudio`). Paint each
light's falloff into its own channel.

The current files are **lightweight placeholders** (matching the placeholder
`studio.glb`). Replace them with your real bakes (2K+ recommended), same names.
