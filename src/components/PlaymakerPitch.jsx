import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../lib/lenis.js'
import './PlaymakerPitch.css'

/**
 * The Playmaker's Pitch — a living top-down football formation where each
 * "player" is one of Samarth's disciplines and the passing lanes are the
 * connections a systems thinker draws between them. He is the No.8 at the
 * heart of midfield. The cursor is the ball: the nearest player looks to it
 * and passes fire around the network.
 *
 * Rendered on a DPR-aware 2D canvas for crisp lines, glow, and real labels.
 */

// Formation in normalized pitch space (x: 0=left,1=right · y: 0=attack,1=defense)
const NODES = [
  { id: 'data', label: 'Data', x: 0.2, y: 0.86 },
  { id: 'arch', label: 'Architecture', x: 0.52, y: 0.9 },
  { id: 'devops', label: 'DevOps · Cloud', x: 0.82, y: 0.85 },
  { id: 'fullstack', label: 'Full-Stack', x: 0.24, y: 0.58 },
  { id: 'core', label: 'Samarth', x: 0.53, y: 0.6, hub: true }, // the No.8
  { id: 'aiml', label: 'AI · ML', x: 0.8, y: 0.55 },
  { id: 'genai', label: 'GenAI · RAG', x: 0.36, y: 0.26 },
  { id: 'hci', label: 'Product · HCI', x: 0.69, y: 0.28 },
]
const IDX = Object.fromEntries(NODES.map((n, i) => [n.id, i]))

// Passing lanes — the No.8 is the hub that links the most.
const EDGES = [
  ['data', 'fullstack'],
  ['data', 'core'],
  ['arch', 'core'],
  ['devops', 'aiml'],
  ['devops', 'core'],
  ['fullstack', 'core'],
  ['aiml', 'core'],
  ['core', 'genai'],
  ['core', 'hci'],
  ['fullstack', 'genai'],
  ['aiml', 'hci'],
  ['genai', 'hci'],
].map(([a, b]) => [IDX[a], IDX[b]])

const COL = {
  line: 'rgba(242,239,233,0.12)',
  pitch: 'rgba(242,239,233,0.16)',
  amber: '#ff7a45',
  white: '#f2efe9',
  dim: 'rgba(183,188,196,0.8)',
}

export default function PlaymakerPitch() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const reduced = prefersReducedMotion()

    let w = 0
    let h = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    const mouse = { x: -9999, y: -9999, active: false }
    const passes = [] // { a, b, t, speed }
    let box = { x: 0, y: 0, w: 0, h: 0, on: true }
    let raf
    let lastSpawn = 0

    const resize = () => {
      const r = canvas.getBoundingClientRect()
      w = r.width
      h = r.height
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Pitch box: right half on desktop, centered lower on small screens.
      const small = w < 820
      if (small) {
        const bw = Math.min(w * 0.86, 460)
        const bh = Math.min(h * 0.5, 440)
        box = { x: (w - bw) / 2, y: h * 0.42, w: bw, h: bh, on: true }
      } else {
        const bw = Math.min(w * 0.42, 560)
        const bh = Math.min(h * 0.78, 640)
        box = {
          x: w * 0.54 + (w * 0.44 - bw) / 2,
          y: (h - bh) / 2,
          w: bw,
          h: bh,
          on: true,
        }
      }
    }

    const nodePos = (n) => ({
      x: box.x + n.x * box.w,
      y: box.y + n.y * box.h,
    })

    const drawPitch = (intro) => {
      const { x, y, w: bw, h: bh } = box
      const cx = x + bw / 2
      const cy = y + bh / 2
      ctx.save()
      ctx.globalAlpha = intro
      // darkened pitch panel so the field & players read clearly
      const panel = ctx.createLinearGradient(x, y, x, y + bh)
      panel.addColorStop(0, 'rgba(0,0,0,0.42)')
      panel.addColorStop(0.5, 'rgba(0,0,0,0.3)')
      panel.addColorStop(1, 'rgba(0,0,0,0.42)')
      ctx.fillStyle = panel
      roundRect(ctx, x, y, bw, bh, 10)
      ctx.fill()
      ctx.strokeStyle = COL.pitch
      ctx.lineWidth = 1
      // outline
      roundRect(ctx, x, y, bw, bh, 10)
      ctx.stroke()
      // halfway line
      ctx.beginPath()
      ctx.moveTo(x, cy)
      ctx.lineTo(x + bw, cy)
      ctx.stroke()
      // center circle + spot
      const cr = Math.min(bw, bh) * 0.14
      ctx.beginPath()
      ctx.arc(cx, cy, cr, 0, Math.PI * 2)
      ctx.stroke()
      ctx.fillStyle = COL.pitch
      ctx.beginPath()
      ctx.arc(cx, cy, 1.6, 0, Math.PI * 2)
      ctx.fill()
      // penalty boxes
      const pbw = bw * 0.44
      const pbh = bh * 0.15
      roundRect(ctx, x + (bw - pbw) / 2, y, pbw, pbh, 4)
      ctx.stroke()
      roundRect(ctx, x + (bw - pbw) / 2, y + bh - pbh, pbw, pbh, 4)
      ctx.stroke()
      // corner arcs
      const ca = 10
      arc(ctx, x, y, ca, 0, Math.PI / 2)
      arc(ctx, x + bw, y, ca, Math.PI / 2, Math.PI)
      arc(ctx, x + bw, y + bh, ca, Math.PI, Math.PI * 1.5)
      arc(ctx, x, y + bh, ca, Math.PI * 1.5, Math.PI * 2)
      ctx.restore()
    }

    let startTime = null

    const render = (time) => {
      if (startTime === null) startTime = time
      const elapsed = time - startTime
      ctx.clearRect(0, 0, w, h)
      const t = time * 0.001

      // global intro factor for pitch + lanes
      const introGlobal = reduced ? 1 : clamp((elapsed - 200) / 1200, 0, 1)
      drawPitch(introGlobal)

      // resolve node positions: converge from the center huddle into formation
      const cx = box.x + box.w / 2
      const cy = box.y + box.h / 2
      // whole formation drifts slowly, like players constantly repositioning
      const swayX = reduced ? 0 : Math.sin(t * 0.28) * 12
      const swayY = reduced ? 0 : Math.cos(t * 0.21) * 8
      const alphas = []
      const pts = NODES.map((n, i) => {
        const p = nodePos(n)
        if (!reduced) {
          p.x += swayX + Math.sin(t * 0.7 + i * 1.7) * 7
          p.y += swayY + Math.cos(t * 0.6 + i * 2.3) * 7
        }
        let a = 1
        if (!reduced) {
          const e = easeOutCubic(clamp((elapsed - i * 80) / 1000, 0, 1))
          p.x = cx + (p.x - cx) * e
          p.y = cy + (p.y - cy) * e
          a = e
        }
        alphas.push(a)
        return p
      })

      // find nearest node to the cursor (the ball)
      let nearest = -1
      let nd = Infinity
      if (mouse.active) {
        for (let i = 0; i < pts.length; i++) {
          const dx = pts[i].x - mouse.x
          const dy = pts[i].y - mouse.y
          const d = dx * dx + dy * dy
          if (d < nd) {
            nd = d
            nearest = i
          }
        }
      }

      // ---- passing lanes ----
      ctx.save()
      ctx.globalAlpha = introGlobal
      ctx.lineWidth = 1
      for (const [a, b] of EDGES) {
        ctx.strokeStyle = COL.line
        ctx.beginPath()
        ctx.moveTo(pts[a].x, pts[a].y)
        ctx.lineTo(pts[b].x, pts[b].y)
        ctx.stroke()
      }
      ctx.restore()

      // ---- travelling passes (the ball moving between players) ----
      if (!reduced && introGlobal >= 1) {
        if (time - lastSpawn > 850 && passes.length < 4) {
          lastSpawn = time
          const e = EDGES[(Math.random() * EDGES.length) | 0]
          passes.push({ a: e[0], b: e[1], t: 0, speed: 0.6 + Math.random() * 0.5 })
        }
        for (let i = passes.length - 1; i >= 0; i--) {
          const p = passes[i]
          p.t += (p.speed * 16.6) / 1000
          if (p.t >= 1) {
            passes.splice(i, 1)
            continue
          }
          const A = pts[p.a]
          const B = pts[p.b]
          // light the active lane
          const grad = ctx.createLinearGradient(A.x, A.y, B.x, B.y)
          grad.addColorStop(Math.max(0, p.t - 0.25), 'rgba(255,122,69,0)')
          grad.addColorStop(p.t, 'rgba(255,122,69,0.55)')
          grad.addColorStop(Math.min(1, p.t + 0.02), 'rgba(255,122,69,0)')
          ctx.strokeStyle = grad
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.moveTo(A.x, A.y)
          ctx.lineTo(B.x, B.y)
          ctx.stroke()
          // the ball + comet trail
          const bx = A.x + (B.x - A.x) * p.t
          const by = A.y + (B.y - A.y) * p.t
          const tb = Math.max(0, p.t - 0.09)
          const tx = A.x + (B.x - A.x) * tb
          const ty = A.y + (B.y - A.y) * tb
          const tg = ctx.createLinearGradient(tx, ty, bx, by)
          tg.addColorStop(0, 'rgba(255,122,69,0)')
          tg.addColorStop(1, 'rgba(255,143,96,0.8)')
          ctx.strokeStyle = tg
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(tx, ty)
          ctx.lineTo(bx, by)
          ctx.stroke()
          glowDot(ctx, bx, by, 3, COL.amber, 10)
        }
      }

      // ---- cursor "looking for a pass" line to nearest player ----
      if (mouse.active && nearest >= 0) {
        const N = pts[nearest]
        const dist = Math.sqrt(nd)
        const a = Math.max(0, 1 - dist / 320)
        if (a > 0) {
          ctx.strokeStyle = `rgba(255,122,69,${0.5 * a})`
          ctx.lineWidth = 1.2
          ctx.setLineDash([2, 5])
          ctx.beginPath()
          ctx.moveTo(mouse.x, mouse.y)
          ctx.lineTo(N.x, N.y)
          ctx.stroke()
          ctx.setLineDash([])
        }
        // the ball at the cursor
        glowDot(ctx, mouse.x, mouse.y, 4, COL.amber, 14)
      }

      // ---- players (nodes) ----
      NODES.forEach((n, i) => {
        const p = pts[i]
        const isNear = i === nearest && mouse.active
        const pulse = reduced ? 0 : (Math.sin(t * 2 + i) + 1) * 0.5
        ctx.save()
        ctx.globalAlpha = alphas[i]
        if (n.hub) {
          // the No.8 — filled amber with a soft ring
          glowDot(ctx, p.x, p.y, 8, COL.amber, 18)
          ctx.fillStyle = COL.amber
          ctx.beginPath()
          ctx.arc(p.x, p.y, 8, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = '#0b0d10'
          ctx.font = '700 11px "JetBrains Mono", monospace'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('8', p.x, p.y + 0.5)
          ctx.strokeStyle = `rgba(255,122,69,${0.25 + pulse * 0.2})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(p.x, p.y, 14 + pulse * 3, 0, Math.PI * 2)
          ctx.stroke()
        } else {
          ctx.fillStyle = '#0b0d10'
          ctx.beginPath()
          ctx.arc(p.x, p.y, 5, 0, Math.PI * 2)
          ctx.fill()
          ctx.strokeStyle = isNear ? COL.amber : 'rgba(242,239,233,0.55)'
          ctx.lineWidth = isNear ? 2 : 1.2
          if (isNear) {
            ctx.shadowColor = COL.amber
            ctx.shadowBlur = 12
          }
          ctx.beginPath()
          ctx.arc(p.x, p.y, 5, 0, Math.PI * 2)
          ctx.stroke()
          ctx.shadowBlur = 0
        }

        // label
        ctx.fillStyle = isNear ? COL.white : COL.dim
        ctx.font = '500 11px "JetBrains Mono", monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillText(n.label.toUpperCase(), p.x, p.y + (n.hub ? 20 : 12))
        ctx.restore()
      })

      raf = requestAnimationFrame(render)
    }

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect()
      mouse.x = e.clientX - r.left
      mouse.y = e.clientY - r.top
      mouse.active = true
    }
    const onLeave = () => (mouse.active = false)

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerout', onLeave)
    raf = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerout', onLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className="pitch-canvas" aria-hidden="true" />
}

/* ---- small canvas helpers ---- */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)
function arc(ctx, x, y, r, a0, a1) {
  ctx.beginPath()
  ctx.arc(x, y, r, a0, a1)
  ctx.stroke()
}
function glowDot(ctx, x, y, r, color, blur) {
  ctx.save()
  ctx.shadowColor = color
  ctx.shadowBlur = blur
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}
