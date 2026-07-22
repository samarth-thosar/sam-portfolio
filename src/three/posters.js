import * as THREE from 'three'

// Draws to an offscreen canvas and returns a CanvasTexture — used for wall
// posters and the monitor screen so we get crisp custom art with zero assets.
function texture(w, h, draw) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const x = c.getContext('2d')
  draw(x, w, h)
  const t = new THREE.CanvasTexture(c)
  t.anisotropy = 8
  t.colorSpace = THREE.SRGBColorSpace
  t.needsUpdate = true
  return t
}

const INK = '#0b0d10'
const PAPER = '#14171c'
const AMBER = '#ff7a45'
const CREAM = '#f2efe9'
const CYAN = '#5ad1ff'

// Poster 1 — the No.8 jersey
export const posterEight = () =>
  texture(512, 660, (x, w, h) => {
    x.fillStyle = PAPER
    x.fillRect(0, 0, w, h)
    x.strokeStyle = 'rgba(242,239,233,0.12)'
    x.lineWidth = 6
    x.strokeRect(18, 18, w - 36, h - 36)
    x.fillStyle = AMBER
    x.font = '900 380px "JetBrains Mono", monospace'
    x.textAlign = 'center'
    x.textBaseline = 'middle'
    x.fillText('8', w / 2, h / 2 - 20)
    x.fillStyle = CREAM
    x.font = '600 34px "JetBrains Mono", monospace'
    x.fillText('THE PLAYMAKER', w / 2, h - 70)
  })

// Poster 3 — AI / systems
export const posterAI = () =>
  texture(512, 660, (x, w, h) => {
    x.fillStyle = PAPER
    x.fillRect(0, 0, w, h)
    // node graph motif — cyan to match the Lab's own accent, not a leftover
    // amber from before rooms had distinct identities; bolder line/node
    // weight so it actually reads at isometric viewing distance
    const nodes = [
      [130, 180],
      [360, 140],
      [250, 320],
      [120, 470],
      [400, 430],
      [270, 560],
    ]
    x.strokeStyle = 'rgba(90,209,255,0.9)'
    x.lineWidth = 3
    for (let i = 0; i < nodes.length; i++)
      for (let j = i + 1; j < nodes.length; j++) {
        if ((i + j) % 2 === 0) continue
        x.beginPath()
        x.moveTo(nodes[i][0], nodes[i][1])
        x.lineTo(nodes[j][0], nodes[j][1])
        x.stroke()
      }
    nodes.forEach(([nx, ny], i) => {
      x.fillStyle = i === 2 ? CYAN : CREAM
      x.beginPath()
      x.arc(nx, ny, i === 2 ? 16 : 10, 0, Math.PI * 2)
      x.fill()
    })
    x.fillStyle = CREAM
    x.font = '700 40px "JetBrains Mono", monospace'
    x.textAlign = 'center'
    x.fillText('AI · GENAI · RAG', w / 2, h - 54)
  })

// A small rubber-stamp texture for the ACM CHI paper "under review" — ties the
// idle papers prop to its own story text instead of sitting there mute.
export const posterDraftStamp = () =>
  texture(256, 160, (x, w, h) => {
    x.clearRect(0, 0, w, h)
    x.strokeStyle = 'rgba(198,60,50,0.85)'
    x.lineWidth = 5
    x.strokeRect(10, 10, w - 20, h - 20)
    x.fillStyle = 'rgba(198,60,50,0.85)'
    x.font = '900 34px "JetBrains Mono", monospace'
    x.textAlign = 'center'
    x.textBaseline = 'middle'
    x.save()
    x.translate(w / 2, h / 2 - 10)
    x.rotate(-0.08)
    x.fillText('UNDER REVIEW', 0, 0)
    x.restore()
    x.font = '700 18px "JetBrains Mono", monospace'
    x.fillText('ACM CHI', w / 2, h - 32)
  })

// ---- Animated screen content ----
// Unlike the one-shot posters above, these are plain draw functions (not
// texture-factories) — a stateful screen component owns the canvas/texture and
// redraws it repeatedly (a typing terminal line, a moving scanline), so the
// same pixels can change over time instead of being baked once.

const MONO = '"JetBrains Mono", monospace'

// studio-monitor's screen: real IDE chrome (tabs, a diff gutter, a terminal
// pane) — the CloudMotiv ingestion/LLM-pipeline workbench, not generic code.
// `typedChars` lets a caller "type in" the last log line for the wake beat.
export function drawIDE(x, w, h, { typedChars = 999 } = {}) {
  x.fillStyle = '#0d1016'
  x.fillRect(0, 0, w, h)
  // title bar + traffic lights + file tabs
  x.fillStyle = '#161a22'
  x.fillRect(0, 0, w, 30)
  ;['#ff5f56', '#ffbd2e', '#27c93f'].forEach((c, i) => {
    x.fillStyle = c
    x.beginPath()
    x.arc(18 + i * 20, 15, 5, 0, Math.PI * 2)
    x.fill()
  })
  const tabs = ['ingest.ts', 'pipeline.ts', 'drone-health.ts']
  x.font = `13px ${MONO}`
  let tx = 100
  tabs.forEach((t, i) => {
    const tw = x.measureText(t).width + 20
    x.fillStyle = i === 1 ? '#1c2129' : '#12151b'
    x.fillRect(tx, 0, tw, 30)
    x.fillStyle = i === 1 ? '#e0af68' : '#5a6270'
    x.fillText(t, tx + 10, 19)
    tx += tw + 2
  })
  // diff-style body
  const lines = [
    ['  const chunks = await ingest', '#c0caf5', null],
    ['+ ', '#4fae57', '  const embedded = await embed(chunks);', '#9ece6a'],
    ['+ ', '#4fae57', '  await index.upsert(embedded);', '#9ece6a'],
    ['- ', '#c0525a', '  await index.push(chunks);', '#7d4a4e'],
    ['  return summarize(embedded, { model });', '#c0caf5', null],
  ]
  x.font = `15px ${MONO}`
  let y = 54
  for (const line of lines) {
    if (line[2] === null) {
      x.fillStyle = line[1]
      x.fillText(line[0], 22, y)
    } else {
      x.fillStyle = line[1]
      x.fillText(line[0], 22, y)
      x.fillStyle = line[2]
      x.fillText(line[3], 40, y)
    }
    y += 26
  }
  // terminal pane
  y += 12
  x.strokeStyle = 'rgba(255,255,255,0.08)'
  x.beginPath()
  x.moveTo(0, y)
  x.lineTo(w, y)
  x.stroke()
  y += 24
  x.fillStyle = '#5ad1ff'
  x.font = `13px ${MONO}`
  x.fillText('$ pnpm run deploy:pipeline', 22, y)
  y += 22
  const full = 'building drone-health model... done. cost/req -38%'
  const shown = full.slice(0, Math.max(0, Math.min(full.length, typedChars)))
  x.fillStyle = '#9ece6a'
  x.fillText(shown, 22, y)
  if (typedChars < full.length) {
    const cw = x.measureText(shown).width
    x.fillStyle = '#ff7a45'
    x.fillRect(24 + cw, y - 12, 8, 15)
  }
}

// lab-visionguard's screen: a Grad-CAM style detection readout — a face-grid,
// a pulsing heatmap over the "forged" region, a moving scanline, and a live
// confidence percentage. Genuinely different content from the IDE screen.
export function drawGradCam(x, w, h, { scanY = 0, pct = 92.0, t = 0 } = {}) {
  x.fillStyle = '#080b10'
  x.fillRect(0, 0, w, h)
  // HUD frame corners
  x.strokeStyle = 'rgba(90,209,255,0.5)'
  x.lineWidth = 2
  const m = 14
  ;[
    [m, m, 1, 1],
    [w - m, m, -1, 1],
    [m, h - m, 1, -1],
    [w - m, h - m, -1, -1],
  ].forEach(([cx, cy, sx, sy]) => {
    x.beginPath()
    x.moveTo(cx, cy + sy * 22)
    x.lineTo(cx, cy)
    x.lineTo(cx + sx * 22, cy)
    x.stroke()
  })
  // a stylised face-grid (oval + landmark grid), centred
  const fx = w / 2
  const fy = h / 2 + 6
  x.strokeStyle = 'rgba(224,231,245,0.35)'
  x.lineWidth = 1.5
  x.beginPath()
  x.ellipse(fx, fy, w * 0.16, h * 0.27, 0, 0, Math.PI * 2)
  x.stroke()
  for (let i = -2; i <= 2; i++) {
    x.beginPath()
    x.moveTo(fx + i * (w * 0.06), fy - h * 0.24)
    x.lineTo(fx + i * (w * 0.06), fy + h * 0.24)
    x.stroke()
  }
  // heatmap blob over the "forged" region (upper-left of the face), pulsing
  const pulse = 0.6 + Math.sin(t * 3.4) * 0.15
  const hg = x.createRadialGradient(fx - 40, fy - 30, 2, fx - 40, fy - 30, 46)
  hg.addColorStop(0, `rgba(255,90,60,${0.55 * pulse})`)
  hg.addColorStop(0.6, `rgba(255,160,60,${0.28 * pulse})`)
  hg.addColorStop(1, 'rgba(255,160,60,0)')
  x.fillStyle = hg
  x.beginPath()
  x.arc(fx - 40, fy - 30, 46, 0, Math.PI * 2)
  x.fill()
  // bounding box locking onto the heatmap region
  x.strokeStyle = '#ff7a45'
  x.lineWidth = 1.5
  x.strokeRect(fx - 40 - 30, fy - 30 - 24, 60, 48)
  // moving scanline
  x.fillStyle = 'rgba(90,209,255,0.5)'
  x.fillRect(m, scanY, w - m * 2, 2)
  // confidence readout
  x.font = `700 22px ${MONO}`
  x.fillStyle = '#5ad1ff'
  x.textAlign = 'left'
  x.fillText(`${pct.toFixed(1)}%`, m, h - m - 6)
  x.font = `12px ${MONO}`
  x.fillStyle = 'rgba(224,231,245,0.6)'
  x.fillText('DEEPFAKE CONFIDENCE · FaceForensics++', m + 78, h - m - 6)
}

// StackIQ's readout: a 5-stage pipeline indicator (4 read-only stages lit
// cyan, the 5th action stage lit amber with a lock glyph — a human is in the
// loop) plus a ticking list of what the audit actually finds.
const STACKIQ_FINDINGS = [
  ['IDLE SEATS', 12],
  ['TIER MISMATCH', 4],
  ['DUPLICATE TOOLS', 7],
  ['ORPHANED ACCOUNTS', 2],
  ['SHADOW IT', 3],
]
export function drawStackIQ(x, w, h, { tick = 0, t = 0 } = {}) {
  x.fillStyle = '#080b10'
  x.fillRect(0, 0, w, h)
  const m = 16

  x.font = `700 14px ${MONO}`
  x.fillStyle = '#5ad1ff'
  x.textAlign = 'left'
  x.fillText('STACKIQ · CLAUDE USAGE AUDIT', m, m + 10)

  // 5-stage pipeline: stages 1-4 read-only (cyan), stage 5 gated (amber)
  const stageY = m + 30
  const stageW = (w - m * 2 - 4 * 6) / 5
  for (let i = 0; i < 5; i++) {
    const sx = m + i * (stageW + 6)
    const gated = i === 4
    const pulse = gated ? 0.65 + Math.sin(t * 2.4) * 0.35 : 1
    x.fillStyle = gated ? `rgba(255,122,69,${0.5 + 0.5 * pulse})` : 'rgba(90,209,255,0.85)'
    x.fillRect(sx, stageY, stageW, 8)
    if (gated) {
      // a small padlock glyph — the one stage that waits on a human
      x.strokeStyle = '#ff7a45'
      x.lineWidth = 1.5
      const lx = sx + stageW / 2
      const ly = stageY + 22
      x.strokeRect(lx - 5, ly, 10, 8)
      x.beginPath()
      x.arc(lx, ly, 5, Math.PI, 0)
      x.stroke()
    }
  }

  // findings list, one highlighted per `tick`
  x.font = `13px ${MONO}`
  let y = stageY + 46
  STACKIQ_FINDINGS.forEach(([label, count], i) => {
    const active = i === tick % STACKIQ_FINDINGS.length
    x.fillStyle = active ? '#f2efe9' : 'rgba(224,231,245,0.4)'
    x.fillText(label, m, y)
    x.textAlign = 'right'
    x.fillStyle = active ? '#5ad1ff' : 'rgba(90,209,255,0.4)'
    x.fillText(String(count), w - m, y)
    x.textAlign = 'left'
    y += 20
  })

  // footer — the human-gated stage, always visible
  x.font = `700 12px ${MONO}`
  x.fillStyle = `rgba(255,122,69,${0.7 + Math.sin(t * 2.4) * 0.3})`
  x.fillText('STAGE 5 · AWAITING APPROVAL', m, h - m)
}
