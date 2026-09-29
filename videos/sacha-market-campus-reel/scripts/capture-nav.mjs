// Bottom nav layer with its raised "Publicar" button (the element screenshot clips it). Transparent PNG.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(path.join(process.cwd(), 'package.json'));
const { chromium } = require('playwright');
const base = process.argv[2] || 'http://127.0.0.1:5173';
const css = `@font-face{font-family:'Anton';src:url(https://fonts.gstatic.com/local/anton.woff2)}@font-face{font-family:'DM Sans';font-weight:400 800;src:url(https://fonts.gstatic.com/local/dmsans.woff2)}`;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 797 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
await ctx.route(/fonts\.googleapis\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: css }));
await ctx.route(/fonts\.gstatic\.com/, (r) => { const u = r.request().url(); const f = u.includes('anton') ? 'anton.woff2' : u.includes('dmsans') ? 'dmsans.woff2' : null; return f ? r.fulfill({ status: 200, contentType: 'font/woff2', body: fs.readFileSync('assets/fonts/' + f) }) : r.abort(); });
const page = await ctx.newPage();
for (const [name, route] of [['nav', '/'], ['nav-publicar', '/publicar'], ['nav-buscar', '/explorar']]) {
  await page.goto(base + route, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(600);
  await page.addStyleTag({ content: 'html,body{background:transparent!important}body>*:not(#root){display:none}#root *{visibility:hidden}.mobile-nav,.mobile-nav *{visibility:visible!important}' });
  await page.waitForTimeout(200);
  await page.screenshot({ path: `assets/ui/${name}.png`, clip: { x: 0, y: 797 - 92, width: 390, height: 92 }, omitBackground: true });
}
await browser.close();
