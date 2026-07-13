import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useGLTF, useTexture } from '@react-three/drei'
import { BakedMaterialImpl, prepBakedTexture } from './shaders/BakedMaterial.js'

/**
 * A baked-lighting room: a single GLB (modeled + UV-unwrapped + GI-baked in
 * Blender) rendered flat through the baked shader. No runtime lights or shadows.
 *
 * Expects, alongside the GLB, a set of baked textures produced by the same bake:
 *   day / night / neutral  — full-room bakes for each mood (sRGB)
 *   lightMap               — R/G/B = three tinted glow zones (linear data)
 * See docs/baked-pipeline.md for the Blender recipe that produces them.
 *
 * Usage (once assets exist under public/models/ + public/textures/):
 *   <BakedRoom
 *     url="/models/studio.glb"
 *     day="/textures/studio-day.jpg"
 *     night="/textures/studio-night.jpg"
 *     neutral="/textures/studio-neutral.jpg"
 *     lightMap="/textures/studio-lightmap.jpg"
 *     nightMix={0}
 *     lights={{ a:{color:'#ff9a5c',strength:1.4}, b:{...}, c:{...} }}
 *   />
 */
export default function BakedRoom({
  url,
  day,
  night,
  neutral,
  lightMap,
  nightMix = 0,
  neutralMix = 0,
  lights = {},
  ...props
}) {
  const { scene } = useGLTF(url)
  const [dayTex, nightTex, neutralTex, lmTex] = useTexture([day, night, neutral, lightMap])

  const material = useMemo(() => {
    prepBakedTexture(dayTex)
    prepBakedTexture(nightTex)
    prepBakedTexture(neutralTex)
    prepBakedTexture(lmTex, { srgb: false }) // lightMap is data, not colour

    const m = new BakedMaterialImpl()
    m.uBakedDay = dayTex
    m.uBakedNight = nightTex
    m.uBakedNeutral = neutralTex
    m.uLightMap = lmTex
    return m
  }, [dayTex, nightTex, neutralTex, lmTex])

  // push the live mood + light-zone tuning without rebuilding the material
  useEffect(() => {
    material.uNightMix = nightMix
    material.uNeutralMix = neutralMix
    const set = (key, cfg) => {
      if (!cfg) return
      if (cfg.color) material[`uLight${key}Color`] = new THREE.Color(cfg.color)
      if (cfg.strength != null) material[`uLight${key}Strength`] = cfg.strength
    }
    set('A', lights.a)
    set('B', lights.b)
    set('C', lights.c)
  }, [material, nightMix, neutralMix, lights])

  // clone so multiple rooms don't share/mutate one loaded graph, then rematerial
  const model = useMemo(() => {
    const root = scene.clone(true)
    root.traverse((o) => {
      if (o.isMesh) o.material = material
    })
    return root
  }, [scene, material])

  return <primitive object={model} {...props} />
}
