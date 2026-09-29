// Mobile (iPhone 390x844 @3x) captures of the real Sacha Market UI, served locally from the sacha-market repo.
//   node scripts/capture-mobile.mjs [base=http://127.0.0.1:5173]
// Google Fonts are fulfilled from assets/fonts (the sandbox blocks fonts.gstatic.com for Chromium).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(path.join(process.cwd(), 'package.json'));
const { chromium } = require('playwright');
const base = process.argv[2] || 'http://127.0.0.1:5173';
fs.mkdirSync('assets/cap/m', { recursive: true });
const css = `@font-face{font-family:'Anton';font-style:normal;font-weight:400;font-display:block;src:url(https://fonts.gstatic.com/local/anton.woff2) format('woff2')}
@font-face{font-family:'DM Sans';font-style:normal;font-weight:400 800;font-display:block;src:url(https://fonts.gstatic.com/local/dmsans.woff2) format('woff2')}`;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
await ctx.route(/fonts\.googleapis\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: css }));
await ctx.route(/fonts\.gstatic\.com/, (r) => {
  const u = r.request().url();
  const f = u.includes('anton') ? 'anton.woff2' : u.includes('dmsans') ? 'dmsans.woff2' : null;
  return f ? r.fulfill({ status: 200, contentType: 'font/woff2', body: fs.readFileSync('assets/fonts/' + f) }) : r.abort();
});
const page = await ctx.newPage();
const shots = process.env.SHOTS ? JSON.parse(process.env.SHOTS) : [
  ['home', '/'], ['explorar', '/explorar'], ['categorias', '/categorias'], ['busco', '/busco'], ['publicar', '/publicar'],
];
for (const [name, route, full = true] of shots) {
  await page.goto(base + route, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1200);
  const H = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < H; y += 500) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(120); }
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(700);
  await page.screenshot({ path: `assets/cap/m/${name}.png`, fullPage: full });
  const links = await page.evaluate(() => [...document.querySelectorAll('a[href*="producto/"]')].slice(0, 4).map((a) => a.getAttribute('href')));
  console.log(name, H, links.join(' '));
}
await browser.close();
