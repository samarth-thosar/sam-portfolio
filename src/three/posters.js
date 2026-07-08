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

// Poster 2 — marathon
export const posterMarathon = () =>
  texture(512, 660, (x, w, h) => {
    x.fillStyle = INK
    x.fillRect(0, 0, w, h)
    // route line
    x.strokeStyle = AMBER
    x.lineWidth = 5
    x.beginPath()
    let px = 40
    let py = h * 0.62
    x.moveTo(px, py)
    for (let i = 0; i < 22; i++) {
      px += (w - 80) / 22
      py += (Math.sin(i * 1.3) * 18 - (i > 15 ? 12 : 0))
      x.lineTo(px, py)
    }
    x.stroke()
    x.fillStyle = CREAM
    x.font = '800 120px "Clash Display","JetBrains Mono",sans-serif'
    x.textAlign = 'left'
    x.textBaseline = 'top'
    x.fillText('42.195', 44, 70)
    x.fillStyle = AMBER
    x.font = '600 30px "JetBrains Mono", monospace'
    x.fillText('KILOMETERS · KEEP THE PACE', 46, 210)
  })

// Poster 3 — AI / systems
export const posterAI = () =>
  texture(512, 660, (x, w, h) => {
    x.fillStyle = PAPER
    x.fillRect(0, 0, w, h)
    // node graph motif
    const nodes = [
      [130, 180],
      [360, 140],
      [250, 320],
      [120, 470],
      [400, 430],
      [270, 560],
    ]
    x.strokeStyle = 'rgba(255,122,69,0.5)'
    x.lineWidth = 2
    for (let i = 0; i < nodes.length; i++)
      for (let j = i + 1; j < nodes.length; j++) {
        if ((i + j) % 2 === 0) continue
        x.beginPath()
        x.moveTo(nodes[i][0], nodes[i][1])
        x.lineTo(nodes[j][0], nodes[j][1])
        x.stroke()
      }
    nodes.forEach(([nx, ny], i) => {
      x.fillStyle = i === 2 ? AMBER : CREAM
      x.beginPath()
      x.arc(nx, ny, i === 2 ? 12 : 7, 0, Math.PI * 2)
      x.fill()
    })
    x.fillStyle = CREAM
    x.font = '700 40px "JetBrains Mono", monospace'
    x.textAlign = 'center'
    x.fillText('AI · GENAI · RAG', w / 2, h - 54)
  })

// Monitor screen — a snippet of code
export const screenCode = () =>
  texture(640, 400, (x, w, h) => {
    x.fillStyle = '#0d1016'
    x.fillRect(0, 0, w, h)
    // top bar
    x.fillStyle = '#161a22'
    x.fillRect(0, 0, w, 34)
    ;['#ff5f56', '#ffbd2e', '#27c93f'].forEach((c, i) => {
      x.fillStyle = c
      x.beginPath()
      x.arc(22 + i * 22, 17, 6, 0, Math.PI * 2)
      x.fill()
    })
    const lines = [
      [['const ', '#7aa2f7'], ['playmaker', '#e0af68'], [' = (idea) => {', '#c0caf5']],
      [['  return ', '#7aa2f7'], ['connect', '#7dcfff'], ['(idea, system);', '#c0caf5']],
      [['};', '#c0caf5']],
      [['', '#c0caf5']],
      [['ship', '#9ece6a'], ['(', '#c0caf5'], ['"robust · refined · useful"', '#ff7a45'], [')', '#c0caf5']],
    ]
    x.font = '20px "JetBrains Mono", monospace'
    x.textBaseline = 'top'
    let y = 60
    for (const line of lines) {
      let cx = 24
      for (const [txt, col] of line) {
        x.fillStyle = col
        x.fillText(txt, cx, y)
        cx += x.measureText(txt).width
      }
      y += 34
    }
    // cursor block
    x.fillStyle = AMBER
    x.fillRect(24 + 190, y, 11, 22)
  })
