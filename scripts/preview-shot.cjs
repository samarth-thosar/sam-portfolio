// One-off: capture preview screenshots of the live site for the is-a.dev PR.
// Usage: MINDSCAPE_URL=https://... node scripts/preview-shot.cjs
const path = require('path')
const fs = require('fs')
const puppeteer = require('puppeteer-core')

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const URL = process.env.MINDSCAPE_URL || 'http://localhost:5173'
const OUT = path.join(__dirname, 'shots')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const shot = (page, name) => page.screenshot({ path: path.join(OUT, `${name}.png`) })

;(async () => {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: 'new',
    args: ['--no-sandbox', '--use-gl=angle', '--enable-webgl', '--ignore-gpu-blocklist', '--window-size=1600,900'],
    defaultViewport: { width: 1600, height: 900 },
  })
  const page = await browser.newPage()
  const errors = []
  page.on('console', (m) => m.type() === 'error' && errors.push('[console] ' + m.text()))
  page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message))

  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 })
  await sleep(3500)
  await shot(page, 'title')

  const clicked = await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => /step inside/i.test(b.textContent))
    if (btn) { btn.click(); return true }
    return false
  })
  if (!clicked) await page.evaluate(() => window.__game && window.__game.getState().enterWorld && window.__game.getState().enterWorld())
  await sleep(7000)
  await shot(page, 'studio')

  try {
    await page.evaluate(() => window.__game.getState().goToRoom('lab'))
    await sleep(6000)
    await shot(page, 'lab')
    await page.evaluate(() => window.__game.getState().goToRoom('studio'))
  } catch (e) { errors.push('[nav] ' + e.message) }

  console.log(errors.length ? errors.join('\n') : 'no console errors')
  await browser.close()
})().catch((e) => { console.error('DRIVER FAIL:', e.message); process.exit(1) })
