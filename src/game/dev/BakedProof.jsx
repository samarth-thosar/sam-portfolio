import { useMemo } from 'react'
import * as THREE from 'three'
import '../shaders/BakedMaterial.js'

/**
 * DEV-ONLY proof for the baked-lighting pipeline. Renders a placeholder iso
 * corner whose day/night/neutral/lightMap textures are generated at runtime
 * (CanvasTexture, no asset files) so we can verify the ported shader — the
 * day↔night cross-fade and the RGB-channel colored glow — works in our
 * three 0.169 / drei v9 stack before real Blender bakes exist.
 *
 * Gated behind ?bakedproof in World.jsx. Not shipped in the real world.
 */

function canvasTex(draw, size = 512) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  draw(c.getContext('2d'), size)
  const t = new THREE.CanvasTexture(c)
  t.needsUpdate = true
  return t
}

// a warm, "lit-in-Blender" looking day bake
const drawDay = (ctx, s) => {
  const g = ctx.createRadialGradient(s * 0.42, s * 0.35, s * 0.05, s * 0.5, s * 0.5, s * 0.85)
  g.addColorStop(0, '#c79a72')
  g.addColorStop(0.5, '#8a6650')
  g.addColorStop(1, '#402c22')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, s, s)
  // faint panel seams so the flat texture reads as a surface
  ctx.strokeStyle = 'rgba(0,0,0,0.22)'
  ctx.lineWidth = 2
  for (let i = 1; i < 6; i++) {
    ctx.beginPath()
    ctx.moveTo((s / 6) * i, 0)
    ctx.lineTo((s / 6) * i, s)
    ctx.stroke()
  }
}

// cooler, darker night bake
const drawNight = (ctx, s) => {
  const g = ctx.createRadialGradient(s * 0.42, s * 0.35, s * 0.05, s * 0.5, s * 0.5, s * 0.85)
  g.addColorStop(0, '#4a6088')
  g.addColorStop(0.6, '#28374f')
  g.addColorStop(1, '#111823')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, s, s)
  ctx.strokeStyle = 'rgba(0,0,0,0.28)'
  ctx.lineWidth = 2
  for (let i = 1; i < 6; i++) {
    ctx.beginPath()
    ctx.moveTo((s / 6) * i, 0)
    ctx.lineTo((s / 6) * i, s)
    ctx.stroke()
  }
}

const drawNeutral = (ctx, s) => {
  ctx.fillStyle = '#3a3a3a'
  ctx.fillRect(0, 0, s, s)
}

// RGB light zones: R = warm lamp (top-left), G = desk/amber (bottom-centre),
// B = cool screen (right). A soft radial blob per channel.
const blob = (ctx, x, y, r, channel) => {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r)
  const col = { r: '255,0,0', g: '0,255,0', b: '0,0,255' }[channel]
  g.addColorStop(0, `rgba(${col},1)`)
  g.addColorStop(1, `rgba(${col},0)`)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
}
const drawLightMap = (ctx, s) => {
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, s, s)
  ctx.globalCompositeOperation = 'lighter'
  blob(ctx, s * 0.22, s * 0.24, s * 0.28, 'r')
  blob(ctx, s * 0.52, s * 0.78, s * 0.26, 'g')
  blob(ctx, s * 0.82, s * 0.48, s * 0.28, 'b')
  ctx.globalCompositeOperation = 'source-over'
}

function BakedSurface({ textures, nightMix, ...props }) {
  return (
    <mesh {...props}>
      <planeGeometry args={[6, 6]} />
      <bakedMaterial
        key={nightMix} // simplest way to push the uniform in the proof
        uBakedDay={textures.day}
        uBakedNight={textures.night}
        uBakedNeutral={textures.neutral}
        uLightMap={textures.lightMap}
        uNightMix={nightMix}
        uNeutralMix={0}
        uLightAColor={new THREE.Color('#ff9a5c')}
        uLightAStrength={0.9}
        uLightBColor={new THREE.Color('#ff7a45')}
        uLightBStrength={1.0}
        uLightCColor={new THREE.Color('#5ad1ff')}
        uLightCStrength={0.85}
      />
    </mesh>
  )
}

export default function BakedProof({ nightMix = 0 }) {
  const textures = useMemo(
    () => ({
      day: canvasTex(drawDay),
      night: canvasTex(drawNight),
      neutral: canvasTex(drawNeutral),
      lightMap: canvasTex(drawLightMap),
    }),
    []
  )

  return (
    <group>
      {/* floor */}
      <BakedSurface textures={textures} nightMix={nightMix} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.9, 0]} />
      {/* back wall */}
      <BakedSurface textures={textures} nightMix={nightMix} position={[0, 2, -3]} />
      {/* side wall */}
      <BakedSurface textures={textures} nightMix={nightMix} rotation={[0, Math.PI / 2, 0]} position={[-3, 2, 0]} />
    </group>
  )
}
