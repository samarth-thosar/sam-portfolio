// Screenshot pass: title -> every room in the world -> one inspect per room.
// Usage: node scripts/shoot.cjs <outPrefix>   (see scripts/README.md)
// Room/object list is derived from src/data/world.js, so a new room is
// automatically included with no changes needed here.
const path = require('path')
const fs = require('fs')
const puppeteer = require('puppeteer-core')

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const URL = process.env.MINDSCAPE_URL || 'http://localhost:5173'
const OUT = path.join(__dirname, 'shots')
const prefix = process.argv[2] || 'shot'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const shot = (page, name) => page.screenshot({ path: path.join(OUT, `${prefix}-${name}.png`) })

;(async () => {
  const { WORLD } = await import('../src/data/world.js')

  fs.mkdirSync(OUT, { recursive: true })
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: 'new',
    args: ['--no-sandbox', '--window-size=1600,900'],
    defaultViewport: { width: 1600, height: 900 },
  })
  const page = await browser.newPage()
  const errors = []
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push('[console] ' + m.text())
  })
  page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message))

  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 })
  await sleep(2500)
  await shot(page, '0-title')

  const clicked = await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => /step inside/i.test(b.textContent))
    if (btn) {
      btn.click()
      return true
    }
    return false
  })
  if (!clicked) await page.evaluate(() => window.__game?.getState().enterWorld())
  await sleep(5000)

  let i = 1
  for (const roomId of Object.keys(WORLD.rooms)) {
    await page.evaluate((id) => window.__game.getState().goToRoom(id), roomId)
    await sleep(5000)
    await shot(page, `${i}-${roomId}`)

    const firstObjectId = WORLD.rooms[roomId].objectIds?.[0]
    if (firstObjectId) {
      await page.evaluate((id) => window.__game.getState().inspect(id), firstObjectId)
      await sleep(3000)
      await shot(page, `${i}-${roomId}-inspect`)
      await page.evaluate(() => window.__game.getState().clearInspect())
      await sleep(600)
    }
    i++
  }

  console.log(errors.length ? errors.join('\n') : 'no console errors')
  console.log('screenshots in', OUT)
  await browser.close()
})().catch((e) => {
  console.error('DRIVER FAIL:', e.message)
  process.exit(1)
})
