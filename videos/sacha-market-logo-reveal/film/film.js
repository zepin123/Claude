// SACHA MARKET — logo reveal. 4.8 s · 120 BPM · 9.6 beats · 16x9, 9x16, 1x1.
// Everything is born from one yellow dot: it stretches into the site's highlight band, leans to the logo's angle and
// unfolds into the tile; the S draws itself and fills; a crema iris opens from the tile; the camera pulls back while
// "sacha" and "market" rise letter by letter; the tile tosses the period into place; the site's eyebrow closes.
// Logo pieces are the real logo vectorized with potrace (tools/vectorize.py → film/logo.js), placed in logo units.
// Pure function of time: no timers, no Math.random, nothing mutated in run().
(() => {
  const { W, H, pick, put, reg, el, scene, sp, spHit, trk, seg, clamp, lerp, ease, bt, beatOf } = C;
  C.fonts = ['700 30px UI'];
  const L = window.LOGO, P = Object.fromEntries(L.pieces.map((p) => [p.id, p]));
  // tile rebuilt as a clean rounded rect fitted to the traced tile (fit error ≈ 1 logo unit): it has to morph
  const TILE = { cx: 151.84, cy: 134.9, w: 158, h: 160, r: 38, ang: -7.5 };
  const CONTENT = { cx: 320, cy: 134.5, h: 173 };                     // bbox of the whole lockup, logo units
  const sA = pick(3.0, 3.1, 3.6);                                      // camera scale while the tile is born
  const K = pick(2.05, 1.62, 1.74);                                    // final lockup scale (logo unit → px)
  const CY = pick(500, 470, 880);                                      // final lockup centre y
  const EY = CY + CONTENT.h / 2 * K + pick(64, 58, 84);                // eyebrow top
  const D = 72 / sA;                                                   // the first dot: 72 px on screen
  const INK = '#111111', CREMA = '#F7F5EE', YEL = '#F4D928';

  scene({
    name: 'reveal', from: 'dot', to: 'done',
    build(root, S) {
      root.style.background = INK;
      S.iris = reg(el('div', { class: 'fill', style: `background:${CREMA}` }, root), { o: 0 });
      // The logo is DRAWN on a canvas every frame from the traced vector paths (Path2D). Inline SVG and scaled <img>
      // pieces both painted differently depending on the frames painted before them (Chromium raster/decode caches);
      // a canvas repaint from the same numbers is identical every time (render --verify).
      S.ctx = C.canvas(root);
      S.paths = {};
      for (const p of L.pieces) {
        const m = p.svg.match(/translate\(([-\d.]+),([-\d.]+)\) scale\(([-\d.]+),([-\d.]+)\)/);
        S.paths[p.id] = { p, tf: m.slice(1).map(Number), d: [...p.svg.matchAll(/ d="([^"]+)"/g)].map((x) => new Path2D(x[1])) };
      }
      // S outline lengths for the draw-on (measured once from a detached SVG)
      const probe = el('div', { style: 'position:absolute;visibility:hidden' }, document.body, P.S.svg);
      S.sLen = [...probe.querySelectorAll('path')].map((q) => q.getTotalLength());
      probe.remove();
      // wordmark rows: each is a mask, letters rise through it
      S.rows = [['sacha', 5, 64, 94], ['market', 6, 157, 56]].map(([word, n, top, h]) => ({ word, n, top, h, at: beatOf(word) }));
      // eyebrow (the site's hero eyebrow) + underline, centred under the lockup
      S.eyMask = el('div', { class: 'abs', style: `left:0;top:${EY}px;width:${W}px;height:${pick(46, 42, 48)}px;overflow:hidden;text-align:center` }, root);
      S.ey = reg(el('span', { class: 'uil eyebrow', style: `display:inline-block;font-size:${pick(30, 26, 30)}px;letter-spacing:.22em;color:${INK};font-weight:700` }, S.eyMask,
        `<span style="display:inline-block;width:.42em;height:.42em;border-radius:50%;background:${YEL};margin-right:.7em;vertical-align:.12em;box-shadow:0 0 0 1.5px ${INK}"></span>DE ESTUDIANTES, PARA ESTUDIANTES`), { hide: true });
      S.rule = reg(el('div', { class: 'abs', style: `top:${EY + pick(46, 42, 48)}px;height:3px;background:${INK}` }, root), { o: 0 });
    },

    run(t, b, S) {
      // ---------------- camera: logo point P shown at stage point Q with scale s
      const cam = sp(t, 'cam', 'heavy');
      const push0 = 1 + 0.06 * ease.inOut(seg(t, 0, 'cam'));
      const hold = 1 + 0.055 * ease.inOut(seg(t, 4.4, 'done'));
      const s = lerp(sA * push0, K, cam) * hold;
      const px = lerp(TILE.cx, CONTENT.cx, cam), py = lerp(TILE.cy, CONTENT.cy, cam);
      const qx = W / 2, qy = lerp(H / 2, CY, cam);
      const toStage = (lx, ly) => ({ x: qx + s * (lx - px), y: qy + s * (ly - py) });
      const g = S.ctx;
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
      const base = () => g.setTransform(s, 0, 0, s, qx - s * px, qy - s * py);       // logo units → stage px
      const draw = (id, color, stroke) => {                                          // a traced piece at its logo position
        const { tf, d } = S.paths[id];
        g.save(); g.scale(1 / 8, 1 / 8); g.translate(tf[0], tf[1]); g.scale(tf[2], tf[3]);
        for (const q of d) { if (stroke) g.stroke(q); else { g.fillStyle = color; g.fill(q); } }
        g.restore();
      };

      // ---------------- crema iris opens from the tile (behind everything)
      const ir = sp(t, 2.72, 'default');
      const c0 = toStage(TILE.cx, TILE.cy);
      put(S.iris, ir > 0.999 ? { o: 1 } : { o: ir > 0.001 ? 1 : 0, clip: `circle(${(Math.hypot(W, H) * ir).toFixed(1)}px at ${c0.x.toFixed(1)}px ${c0.y.toFixed(1)}px)` });

      // ---------------- dot → band → tile
      // frame 0: the dot is already falling into the frame; it lands on b0.5 with a squash, which is also the anticipation
      const fall = sp(t, -0.22, 'default');
      const squash = sp(t, 'land', 'snappy') - sp(t, 0.8, 'snappy');
      const band = Motion.indicator(t, [[0, -D / 2, D / 2], [bt(1) - 0.05, -D / 2, 150], [bt(1.25) - 0.05, -100, 100]]);
      const stretch = clamp((band.size - D) / (200 - D));
      const u = spHit(t, 'tile', 'default');                                          // unfold into the tile
      const w = lerp(band.size, TILE.w, u);
      const hBand = D * (1 - 0.38 * stretch);
      const h = lerp(hBand, TILE.h, u);
      const rad = lerp(hBand / 2, TILE.r, u);
      const lean = TILE.ang * sp(t, 1.45, 'default');
      const nod = 3 * (sp(t, 6.1, 'default') - sp(t, 6.7, 'default'));            // the hold breathes: a small "pausa" nod
      const breath = 1 + 0.035 * (spHit(t, 'fill', 'snappy') - sp(t, 3.15, 'snappy'));
      const aboutTile = (extra) => {                                                 // tile centre frame: nod + breath (+ lean for the tile itself)
        g.translate(TILE.cx, TILE.cy - (H * 0.42 / s) * (1 - fall)); g.rotate(((extra || 0) + nod) * Math.PI / 180); g.scale(breath, breath);
      };
      base(); aboutTile(lean); g.scale(1 + 0.32 * squash, 1 - 0.26 * squash);
      g.beginPath(); g.roundRect(band.center * (1 - u) - w / 2, -h / 2, w, h, Math.min(rad, w / 2, h / 2)); g.fillStyle = YEL; g.fill();

      // ---------------- S draws on, then fills bottom-up; both ride the tile's nod/breath about its centre
      const drawP = ease.inOut(seg(t, 'draw0', 'draw1'));
      const fill = sp(t, 'fill', 'snappy');
      if (drawP > 0.001 && fill < 0.999) {
        base(); aboutTile(); g.translate(-TILE.cx, -TILE.cy);
        const { tf, d } = S.paths.S;
        g.save(); g.scale(1 / 8, 1 / 8); g.translate(tf[0], tf[1]); g.scale(tf[2], tf[3]);
        g.strokeStyle = INK; g.lineWidth = 240; g.lineJoin = 'round';
        d.forEach((q, i) => { const len = S.sLen[i] || S.sLen[0]; g.setLineDash([len, len]); g.lineDashOffset = len * (1 - drawP); g.stroke(q); });
        g.restore(); g.setLineDash([]);
      }
      if (fill > 0.001) {
        base(); g.save(); aboutTile(); g.translate(-TILE.cx, -TILE.cy);
        g.beginPath(); g.rect(P.S.x - 10, P.S.y + P.S.h * (1 - fill), P.S.w + 20, P.S.h * fill + 10); g.clip();
        draw('S', INK); g.restore();
      }

      // ---------------- wordmark rises letter by letter through each row's mask
      for (const row of S.rows) {
        base(); g.save(); g.beginPath(); g.rect(230, row.top, 360, row.h); g.clip();
        for (let i = 0; i < row.n; i++) {
          const pc = P[row.word + i];
          const k = spHit(t, row.at + i * 0.075, 'heavy', C.leadFor('heavy') * 1.7), dist = row.h * 1.45;   // 60 fps check r2: a masked word reads ~0.2 s after release
          const y = dist * (1 - k);
          if (y >= dist * 0.999) continue;
          const bx = pc.x + pc.w / 2, by = pc.y + pc.h;                                // pivot: bottom centre
          g.save(); g.translate(bx, by + y); g.rotate((7 * (1 - k)) * Math.PI / 180); g.translate(-bx, -by);
          draw(row.word + i, INK); g.restore();
        }
        g.restore();
      }

      // ---------------- the tile tosses the period: pops out of its corner, arcs over the wordmark, lands on the beat
      const x0 = 214, y0 = 62, x1 = P.dot.x, y1 = P.dot.y;
      const tau = seg(t, 4.08, 'period');
      const born = sp(t, 4.0, 'snappy');
      const land = sp(t, 'period', 'snappy') - sp(t, 4.95, 'snappy');
      if (born > 0.001) {
        const dx = lerp(x0, x1, tau), dy = lerp(y0, y1, tau) - 120 * 4 * tau * (1 - tau), sc = 0.3 + 0.7 * born;
        const bx = dx + P.dot.w / 2, by = dy + P.dot.h;
        base(); g.translate(bx, by); g.scale(sc * (1 + 0.22 * land), sc * (1 - 0.22 * land)); g.translate(-bx, -by);
        g.translate(dx - P.dot.x, dy - P.dot.y); draw('dot', YEL);
      }
      g.setTransform(1, 0, 0, 1, 0, 0);

      // ---------------- eyebrow + underline sweep (the site's nav underline)
      const eg = spHit(t, 'eyebrow', 'default'), ed = pick(46, 42, 48);
      put(S.ey, { y: ed * 1.2 * (1 - eg), hide: eg < 0.002 });
    },
    after(t, b, S) {
      const r = C.rectOf(S.ey);
      const x0 = r.x + r.w * 0.07, x1 = r.x + r.w;
      const sw = Motion.indicator(t, [[0, x0, x0], [bt('sweep') - 0.05, x0, x1], [bt(7.8), x1, x1]]);
      put(S.rule, { o: sw.size > 0.5 && C.beatAt(t) > 6 ? 1 : 0, x: sw.start, css: { width: Math.max(0, sw.size) + 'px' } });
    },
  });

  C.start();
})();
