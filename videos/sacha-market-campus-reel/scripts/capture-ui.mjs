// Layered mobile captures of the real Sacha Market UI for the phone in the film.
//   node scripts/capture-ui.mjs [base=http://127.0.0.1:5173]
// For each page: content.png (full page, sticky header + fixed nav hidden so the phone can scroll it under
// real header/nav layers), plus rects (CSS px, page coords) of the elements the film taps or covers.
// Google Fonts are fulfilled from assets/fonts (fonts.gstatic.com is blocked for Chromium in this sandbox).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(path.join(process.cwd(), 'package.json'));
const { chromium } = require('playwright');
const base = process.argv[2] || 'http://127.0.0.1:5173';
const OUT = 'assets/ui';
fs.mkdirSync(OUT, { recursive: true });
const css = `@font-face{font-family:'Anton';font-weight:400;font-display:block;src:url(https://fonts.gstatic.com/local/anton.woff2) format('woff2')}
@font-face{font-family:'DM Sans';font-weight:400 800;font-display:block;src:url(https://fonts.gstatic.com/local/dmsans.woff2) format('woff2')}`;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 797 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
await ctx.route(/fonts\.googleapis\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: css }));
await ctx.route(/fonts\.gstatic\.com/, (r) => {
  const u = r.request().url();
  const f = u.includes('anton') ? 'anton.woff2' : u.includes('dmsans') ? 'dmsans.woff2' : null;
  return f ? r.fulfill({ status: 200, contentType: 'font/woff2', body: fs.readFileSync('assets/fonts/' + f) }) : r.abort();
});
const page = await ctx.newPage();
const pages = {
  home: { route: '/', rects: { search: '.hero-search', searchInput: '.hero-search input', searchBtn: '.hero-search .button', h1: '.hero h1', strip: '.community-strip' } },
  explorar: { route: '/explorar', rects: { grid: '.product-grid', card0: '.product-grid > *:nth-child(1)', card1: '.product-grid > *:nth-child(2)' } },
  producto: { route: '/producto/audifonos', rects: { h1: 'h1', contact: 'a.button.black, button.button.black' } },
  publicar: { route: '/publicar', rects: { h1: 'h1' } },
};
const info = {};
for (const [name, p] of Object.entries(pages)) {
  await page.goto(base + p.route, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(900);
  const H = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < H; y += 500) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(100); }
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(600);
  if (name === 'home') {
    await page.locator('.site-header').screenshot({ path: `${OUT}/header.png` });
    await page.locator('.mobile-nav').screenshot({ path: `${OUT}/nav.png` });
  }
  const rects = await page.evaluate((sel) => {
    const o = {};
    for (const [k, s] of Object.entries(sel)) { const el = document.querySelector(s); if (el) { const r = el.getBoundingClientRect(); o[k] = { x: r.x, y: r.y + scrollY, w: r.width, h: r.height }; } }
    const hd = document.querySelector('.site-header').getBoundingClientRect(); o.header = { x: 0, y: 0, w: hd.width, h: hd.height };
    // extra: every element whose own text matches, for tap targets
    const find = (re) => { for (const el of document.querySelectorAll('a,button,span,strong,h1,h2,h3,p,label,div')) { if (re.test(el.innerText || '') && el.children.length < 4 && (el.innerText || '').length < 60) { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, w: r.width, h: r.height, t: el.innerText }; } } };
    o.tContact = find(/^Contactar vendedor/); o.tUpload = find(/^Añade las fotos/); o.tEntrega = find(/^Entrega$/); o.tSeller = find(/^PUBLICADO POR/i);
    o.tContinuar = find(/^Continuar$/); o.tAudifonos = find(/^Audífonos para desconectarte$/); o.tPrice = find(/^S\/ 180$/);
    return o;
  }, p.rects);
  await page.addStyleTag({ content: '.site-header{visibility:hidden!important}.mobile-nav,.back-to-top,.scroll-progress,.skip-link{display:none!important}' });
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  info[name] = { route: p.route, height: H, rects };
  console.log(name, H, JSON.stringify(rects).slice(0, 400));
}
fs.writeFileSync(`${OUT}/ui.json`, JSON.stringify(info, null, 1));
await browser.close();
