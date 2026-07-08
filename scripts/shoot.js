// Screenshot pass: title -> studio -> lab -> two inspects.
// Usage: node scripts/shoot.js <outPrefix>   (see scripts/README.md)
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
  await shot(page, '1-studio')

  await page.evaluate(() => window.__game.getState().goToRoom('lab'))
  await sleep(5000)
  await shot(page, '2-lab')

  await page.evaluate(() => window.__game.getState().inspect('lab-neural'))
  await sleep(3000)
  await shot(page, '3-lab-inspect')

  await page.evaluate(() => {
    const s = window.__game.getState()
    s.clearInspect()
    s.goToRoom('studio')
  })
  await sleep(4500)
  await page.evaluate(() => window.__game.getState().inspect('studio-monitor'))
  await sleep(3000)
  await shot(page, '4-studio-inspect')

  console.log(errors.length ? errors.join('\n') : 'no console errors')
  console.log('screenshots in', OUT)
  await browser.close()
})().catch((e) => {
  console.error('DRIVER FAIL:', e.message)
  process.exit(1)
})
