// Interaction suite with REAL pointer events: for every interactable, project
// its world position to screen pixels, hover (expect hoverId), click (expect
// inspectId + discovery), Esc (expect clear). Then click each door and expect
// the room to change. See scripts/README.md.
const path = require('path')
const fs = require('fs')
const puppeteer = require('puppeteer-core')

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const URL = process.env.MINDSCAPE_URL || 'http://localhost:5173'
const OUT = path.join(__dirname, 'shots')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Kept in sync with src/data/world.js by hand — if a hover fails with
// hover=null everywhere, re-check these against the data file first.
const OBJECTS = {
  studio: [
    ['studio-monitor', [-1.4, 1.15, -1.6]],
    ['studio-papers', [0.2, 1.02, -1.5]],
    ['studio-whiteboard', [1.9, 1.7, -2.2]],
  ],
  lab: [
    ['lab-neural', [24, 1.5, -1.6]],
    ['lab-visionguard', [25.6, 1.15, -1.5]],
    ['lab-drone', [22.5, 1.0, -1.4]],
  ],
}
const DOORS = { studio: [5.2, 1.2, -1.5], lab: [19.6, 1.2, -1.5] }

;(async () => {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: 'new',
    args: ['--no-sandbox', '--window-size=1600,900'],
    defaultViewport: { width: 1600, height: 900 },
  })
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 })
  await sleep(2000)
  await page.evaluate(() => {
    const s = window.__game.getState()
    s.enterWorld()
    if (!s.calm) s.toggleCalm() // freeze sway/parallax so projections stay exact
  })
  await sleep(4000)

  const project = (pos) =>
    page.evaluate(([x, y, z]) => {
      const { camera } = window.__three
      camera.updateMatrixWorld()
      const e = camera.matrixWorldInverse.elements
      const p = camera.projectionMatrix.elements
      const vx = e[0] * x + e[4] * y + e[8] * z + e[12]
      const vy = e[1] * x + e[5] * y + e[9] * z + e[13]
      const vz = e[2] * x + e[6] * y + e[10] * z + e[14]
      const cx = p[0] * vx + p[4] * vy + p[8] * vz + p[12]
      const cy = p[1] * vx + p[5] * vy + p[9] * vz + p[13]
      return [((cx + 1) / 2) * 1600, ((1 - cy) / 2) * 900]
    }, pos)

  const state = () =>
    page.evaluate(() => {
      const s = window.__game.getState()
      return { room: s.currentRoom, hover: s.hoverId, inspect: s.inspectId, found: s.discovered.length }
    })

  const results = []
  let failures = 0
  const check = (ok) => {
    if (!ok) failures++
    return ok
  }

  for (const room of ['studio', 'lab']) {
    for (const [id, pos] of OBJECTS[room]) {
      const [px, py] = await project([pos[0], pos[1] + 0.15, pos[2]])
      await page.mouse.move(px, py, { steps: 4 })
      await sleep(400)
      const afterHover = await state()
      await page.mouse.click(px, py)
      await sleep(700)
      const afterClick = await state()
      await page.keyboard.press('Escape')
      await sleep(500)
      const afterEsc = await state()
      results.push({
        id,
        hover: check(afterHover.hover === id) ? 'OK' : `FAIL(${afterHover.hover})`,
        inspect: check(afterClick.inspect === id) ? 'OK' : `FAIL(${afterClick.inspect})`,
        esc: check(afterEsc.inspect === null) ? 'OK' : 'FAIL',
      })
      await sleep(400)
    }
    const expected = room === 'studio' ? 'lab' : 'studio'
    const [dx, dy] = await project(DOORS[room])
    await page.mouse.move(dx, dy, { steps: 4 })
    await sleep(400)
    await page.screenshot({ path: path.join(OUT, `hover-${room}-door.png`) })
    await page.mouse.click(dx, dy)
    await sleep(4200) // camera glide
    const s = await state()
    results.push({ id: `${room}-door`, glide: check(s.room === expected) ? `OK->${s.room}` : `FAIL(${s.room})` })
  }

  // clicking empty space must clear an active inspect (Canvas onPointerMissed)
  await page.evaluate(() => window.__game.getState().inspect('studio-monitor'))
  await sleep(800)
  await page.mouse.click(200, 150)
  await sleep(400)
  const cleared = (await state()).inspect === null
  results.push({ id: 'click-empty-clears-inspect', ok: check(cleared) ? 'OK' : 'FAIL' })

  const final = await state()
  console.log(JSON.stringify({ results, discovered: `${final.found}/6`, pageErrors: errors }, null, 1))
  await browser.close()
  process.exit(failures || errors.length ? 1 : 0)
})().catch((e) => {
  console.error('VERIFY FAIL:', e.message)
  process.exit(1)
})
