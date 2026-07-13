import * as THREE from 'three'
import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'

/**
 * Baked-lighting material, ported from Bruno Simon's my-room-in-3d to R3F +
 * three 0.169. A room is a single mesh whose global illumination is *painted in*
 * (baked in Blender) rather than lit at runtime — no lights, no shadow maps.
 *
 *  - three baked textures (day / night / neutral) cross-fade via uNightMix /
 *    uNeutralMix so the same room can shift mood without re-lighting.
 *  - one lightMap texture packs THREE independent tinted glow zones into its
 *    R / G / B channels (e.g. monitor, lamp, neural-core), each blended over the
 *    baked image with a "lighten" (max) blend. One texture, three colored lights.
 *
 * Colour management: baked textures are authored sRGB, so we decode to linear on
 * sample, do the blend in linear, then re-encode via three's output chunks so the
 * room sits in the same pipeline as our tonemapped procedural props.
 */
const BakedMaterialImpl = shaderMaterial(
  {
    uBakedDay: null,
    uBakedNight: null,
    uBakedNeutral: null,
    uLightMap: null,
    uNightMix: 0,
    uNeutralMix: 0,
    uLightAColor: new THREE.Color('#ff7a45'),
    uLightAStrength: 1.4,
    uLightBColor: new THREE.Color('#ff6a00'),
    uLightBStrength: 1.6,
    uLightCColor: new THREE.Color('#5ad1ff'),
    uLightCStrength: 1.3,
  },
  /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  /* glsl */ `
    uniform sampler2D uBakedDay;
    uniform sampler2D uBakedNight;
    uniform sampler2D uBakedNeutral;
    uniform sampler2D uLightMap;
    uniform float uNightMix;
    uniform float uNeutralMix;
    uniform vec3 uLightAColor;
    uniform float uLightAStrength;
    uniform vec3 uLightBColor;
    uniform float uLightBStrength;
    uniform vec3 uLightCColor;
    uniform float uLightCStrength;
    varying vec2 vUv;

    vec3 srgbToLinear(vec3 c) { return pow(c, vec3(2.2)); }

    // "lighten" blend at a given opacity — the glow only ever brightens the bake
    vec3 blendLighten(vec3 base, vec3 blend, float opacity) {
      return mix(base, max(base, blend), clamp(opacity, 0.0, 1.0));
    }

    void main() {
      vec3 day = srgbToLinear(texture2D(uBakedDay, vUv).rgb);
      vec3 night = srgbToLinear(texture2D(uBakedNight, vUv).rgb);
      vec3 neutral = srgbToLinear(texture2D(uBakedNeutral, vUv).rgb);
      vec3 baked = mix(mix(day, night, uNightMix), neutral, uNeutralMix);

      // lightMap is data (channel = zone), sampled raw, not colour-decoded
      vec3 lm = texture2D(uLightMap, vUv).rgb;
      baked = blendLighten(baked, srgbToLinear(uLightAColor), lm.r * uLightAStrength);
      baked = blendLighten(baked, srgbToLinear(uLightCColor), lm.b * uLightCStrength);
      baked = blendLighten(baked, srgbToLinear(uLightBColor), lm.g * uLightBStrength);

      gl_FragColor = vec4(baked, 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `
)

extend({ BakedMaterial: BakedMaterialImpl })

// Apply to baked textures loaded from a GLB bake so they read correctly.
export function prepBakedTexture(tex, { srgb = true } = {}) {
  if (!tex) return tex
  tex.flipY = false // GLTF UV convention
  tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace
  tex.needsUpdate = true
  return tex
}

export { BakedMaterialImpl }
