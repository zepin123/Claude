// SACHA MARKET — campus reel. 24 s · 120 BPM · 48 beats · 16x9 + 9x16.
// Grammar ("Built on iPhone"): the phone is the hero. It rises in once and never cuts; real screens of
// sacha-market (assets/ui/*, captured from the site's own code) push inside it, driven by taps, while
// kinetic Anton type tells the story around it: BUSCA · HABLA · ACUERDA · VENDE.
// Pure function of time: no timers, no Math.random, nothing mutated in run().
(() => {
  const { W, H, pick, put, reg, el, scene, sp, trk, seg, clamp, lerp, ease, bt, beatOf, FMT } = C;
  const { line, rise, type } = TYPE;
  C.fonts = ['400 100px Display', '500 40px UI', '700 40px UI', '800 40px UI'];
  const WIDE = FMT === '16x9';
  const PAD = pick(140, 90, 80);
  const A = '../assets/';
  const step = Motion.step;
  // r1 measured visuals ~2 frames early with the stock lead; hits lead by 60 % of it
  const spHit = (t, beat, preset = 'snappy') => C.spHit(t, beat, preset, C.leadFor(preset) * 0.6);

  // ------------------------------------------------------------------ helpers
  // A masked UI line (DM Sans) built with TYPE.line so it rises like the display type.
  const uline = (root, text, o) => line(root, text, { ...o, cls: 'uil' + (o.eyebrow ? ' eyebrow' : '') });
  // enter with a snap of opacity inside ≤ 4 frames while the scale grows: never a pure fade
  const snapO = (p) => clamp(p * 5);
  // a group of lines: [line, inBeat] pairs, all leaving at outAt
  function riseAll(t, items, outAt, o = {}) { for (const [L, at, oo] of items) rise(t, L, at, outAt, { ...o, ...oo }); }

  // ------------------------------------------------------------------ phone pose (rig coordinates, before the camera)
  const BASE = pick({ x: 1190, y: 104, s: 0.99, r: -2 }, { x: 330, y: 150, s: 0.95, r: -2 }, { x: 285, y: 566, s: 1.22, r: -2 });
  function pose(t) {
    const p = sp(t, 5.25, 'default');                        // lands on phone_in (b6): whoosh peaks there
    const q = ease.expoIn(seg(t, 31.2, 31.95));             // pushed up past camera into the numbers
    return {
      x: BASE.x + pick(320, 120, 60) * (1 - p),
      y: lerp(H + 120, BASE.y, p) - (H + 900) * q,
      s: BASE.s * (1 + 0.35 * q),
      r: -9 + 7 * p - 7 * q,
    };
  }
  // phone-local point → rig coordinates (phone transform-origin is 0 0)
  function map(P, lx, ly) {
    const a = (P.r * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
    return { x: P.x + P.s * (lx * c - ly * s), y: P.y + P.s * (lx * s + ly * c) };
  }
  // camera punch-ins on UI moments: [in, out, zoom, focus (phone-local)]
  const ZOOMS = [
    [8.1, 11.8, pick(1.3, 1.2, 1.12), [pick(0, 0, 209), pick(451, 451, 60)]],        // search field
    [16.2, 18.2, pick(1.2, 1.15, 1.1), [pick(0, 0, 209), pick(330, 330, 60)]],     // title + price
    [26.5, 29.1, pick(1.3, 1.2, 1.14), [pick(0, 0, 209), pick(450, 450, 60)]],      // upload box
  ];
  function camera(t, b) {
    let z = 1, f = ZOOMS[0];
    for (const Z of ZOOMS) { z += (Z[2] - 1) * (sp(t, Z[0], 'default') - sp(t, Z[1], 'default')); if (b >= Z[0] - 1) f = Z; }
    const F = map(pose(t), f[3][0], f[3][1]);
    return { s: z, x: F.x * (1 - z), y: F.y * (1 - z) };
  }

  // ------------------------------------------------------------------ 1. HOOK (b0 → b8): the site's H1, word by word
  scene({
    name: 'hook', from: 'hook', to: 'busca',
    build(root, S) {
      S.head = reg(el('div', { class: 'abs', style: `width:${W}px;height:${H}px` }, root));
      S.band = reg(el('div', { class: 'abs', style: 'background:var(--accent)' }, S.head), { o: 0 });
      if (WIDE) {
        const sz = 168, y0 = 232, dy = 196;
        S.L = [line(S.head, 'ESO QUE BUSCAS.', { x: PAD, y: y0, size: sz }),
          line(S.head, 'ALGUIEN DEL CAMPUS', { x: PAD, y: y0 + dy, size: sz }),
          line(S.head, 'LO TIENE.', { x: PAD, y: y0 + 2 * dy, size: sz })];
        S.ins = [[-0.4, 'hook_w2', 'hook_w3'], ['l2a', 'l2b', 'l2c'], ['lo', 4.1]];
      } else {
        const sz = pick(0, 150, 188), y0 = pick(0, 170, 330), dy = pick(0, 160, 206);
        const txt = ['ESO QUE', 'BUSCAS.', 'ALGUIEN DEL', 'CAMPUS', 'LO TIENE.'];
        S.L = txt.map((s, i) => line(S.head, s, { x: PAD, y: y0 + i * dy, size: sz }));
        S.ins = [[-0.4, 'hook_w2'], ['hook_w3'], ['l2a', 'l2b'], ['l2c'], ['lo', 4.1]];
      }
      S.last = S.L[S.L.length - 1];
    },
    run(t, b, S) {
      // 16x9: the headline settles into the left column as the phone arrives (the site's 55/45 hero); 9x16: it lifts out
      const k = WIDE ? sp(t, 4.95, 'heavy') : 0;
      const s = 1 - 0.36 * k;
      put(S.head, { s, x: PAD * (1 - s), y: 232 * (1 - s) + 150 * k });
      const out = WIDE ? 7.45 : 5.35;
      S.L.forEach((L, i) => rise(t, L, S.ins[i], out, { stagger: 0.05 }));
      // highlight band (site .highlight: yellow from 62 % to 96 % of the line) wipes in under LO TIENE.
      const h = sp(t, 'hl', 'default') * (1 - sp(t, out - 0.1, 'snappy'));
      S.bandP = h;
    },
    after(t, b, S) {
      const r = C.rectOf(S.last.el), hs = C.rectOf(S.head);
      const k = hs.w / W || 1;                                            // head scale
      const lx = (r.x - hs.x) / k, ly = (r.y - hs.y) / k, lw = r.w / k, sz = S.last.size;
      put(S.band, { o: S.bandP > 0.002 ? 1 : 0, x: lx - 6, y: ly + sz * 0.72, css: { width: (lw + 12) * S.bandP + 'px', height: sz * 0.36 + 'px' } });
    },
  });

  // ------------------------------------------------------------------ 2. STEPS captions (b8 → b24): BUSCA · HABLA · ACUERDA
  const STEPS = [
    { n: 'PASO 01', t: 'BUSCA.', sub: ['Encuentra eso que necesitas', 'dentro de tu comunidad.'], at: 8, out: 15.6 },
    { n: 'PASO 02', t: 'HABLA.', sub: ['Contacta al estudiante por', 'WhatsApp y resuelve tus dudas.'], at: 16, out: 21.6 },
    { n: 'PASO 03', t: 'ACUERDA.', sub: ['Elijan un punto concurrido del', 'campus y revisa el producto.'], at: 22, out: null },
  ];
  scene({
    name: 'steps', from: 'busca', to: 24.3, cut: false,
    build(root, S) {
      const ey = pick(292, 150, 290), ty = pick(344, 196, 330), tsz = pick(212, 150, 150);
      S.items = STEPS.map((st) => {
        const g = [[uline(root, st.n, { x: PAD + 4, y: ey, size: pick(30, 28, 30), eyebrow: true }), st.at - 0.25, { preset: 'snappy' }],
          [line(root, st.t, { x: PAD, y: ty, size: tsz }), st.at]];
        if (WIDE) st.sub.forEach((s, i) => g.push([uline(root, s, { x: PAD + 2, y: 618 + i * 52, size: 38, color: 'var(--ink-2)' }), st.at + 0.35 + i * 0.12, { preset: 'default' }]));
        return g;
      });
    },
    run(t, b, S) { S.items.forEach((g, i) => riseAll(t, g, STEPS[i].out)); },
  });

  // ------------------------------------------------------------------ 3. VENDE (b24 → b32): ink panel covers, the site's seller banner
  scene({
    name: 'vende', from: 'vende', to: 32.4, pre: 0.6,
    build(root, S) {
      S.panel = reg(el('div', { class: 'fill', style: 'background:var(--ink)' }, root));
      const cream = '#F7F5EE';
      S.ey = uline(root, 'HAZ ESPACIO PARA LO QUE VIENE', { x: PAD + 4, y: pick(282, 140, 280), size: pick(30, 26, 28), eyebrow: true, color: 'var(--accent)' });
      S.t1 = line(root, 'VENDE LO QUE', { x: PAD, y: pick(334, 180, 318), size: pick(176, 130, 108), color: cream });
      S.t2 = line(root, 'YA NO USAS.', { x: PAD, y: pick(520, 318, 430), size: pick(176, 130, 108), color: 'var(--accent)' });
      S.sub = WIDE ? ['Haz espacio y dale una nueva', 'historia con otro estudiante.'].map((s, i) => uline(root, s, { x: PAD + 2, y: 744 + i * 52, size: 38, color: 'rgba(247,245,238,.78)' })) : [];
    },
    run(t, b, S) {
      put(S.panel, { y: H * (1 - sp(t, 23.5, 'default')) });           // cover lands on the bar (whoosh peaks on b24)
      rise(t, S.ey, 24.35, null, { preset: 'snappy' });
      rise(t, S.t1, 24.5, null, { stagger: 0.12 });
      rise(t, S.t2, 25, null, { stagger: 0.12 });
      S.sub.forEach((L, i) => rise(t, L, 25.5 + i * 0.12, null, { preset: 'default' }));
    },
  });

  // ------------------------------------------------------------------ 4. NUMBERS (b32 → b36): the site's value strip, on ink
  const NUMS = WIDE || FMT !== '9x16'
    ? [[0, 100, '%', ['de comisión. El trato es', 'directo entre ustedes.']], [3, 0, '', ['campus UPeU: Lima,', 'Juliaca y Tarapoto.']], [13, 0, '', ['categorías, de apuntes', 'a emprendimientos.']]]
    : [[0, 100, '%', ['de comisión. El trato', 'es directo entre ustedes.']], [3, 0, '', ['campus UPeU: Lima,', 'Juliaca y Tarapoto.']], [13, 0, '', ['categorías, de apuntes', 'a emprendimientos.']]];
  scene({
    name: 'stats', from: 'stats', to: 36.45, cut: false,
    build(root, S) {
      root.style.background = 'var(--ink)';
      const beats = ['n1', 'n2', 'n3'];
      S.ey = uline(root, 'SACHA MARKET EN CIFRAS', { x: PAD + 4, y: pick(206, 60, 170), size: pick(30, 26, 28), eyebrow: true, color: 'var(--accent)' });
      S.cols = NUMS.map(([to, from, suf, lab], i) => {
        const x = pick(PAD + i * 590, PAD, PAD), y = pick(300, 120 + i * 300, 300 + i * 410);
        const num = line(root, String(to) + suf, { x, y, size: pick(300, 190, 250), color: 'var(--accent)' });
        const lx = pick(x + 6, x + 330, x + 6), ly = pick(y + 350, y + 40, y + 280);
        const labs = lab.map((s, j) => uline(root, s, { x: lx, y: ly + j * 50, size: pick(38, 34, 36), color: '#F7F5EE' }));
        const rule = i > 0 && WIDE ? reg(el('div', { class: 'abs', style: `left:${x - 50}px;top:300px;width:2px;height:520px;background:rgba(247,245,238,.22);transform-origin:0 0` }, root), { o: 0 }) : null;
        return { num, labs, rule, at: beatOf(beats[i]), to, from, suf };
      });
    },
    run(t, b, S) {
      rise(t, S.ey, 31.9, null, { preset: 'snappy' });
      for (const c of S.cols) {
        rise(t, c.num, c.at, null, { preset: 'heavy' });
        // the site's CountUp: 100 → 0 %, 0 → 13 (text only; the glyph box does not move)
        const k = ease.out(seg(t, c.at - 0.2, c.at + 1.1));
        if (c.from !== c.to) put(c.num.words[0], { text: String(Math.round(lerp(c.from, c.to, k))) + c.suf });
        c.labs.forEach((L, j) => rise(t, L, c.at + 0.3 + j * 0.1, null, { preset: 'default' }));
        if (c.rule) { const g = sp(t, c.at - 0.3, 'default'); put(c.rule, { o: g > 0.002 ? 1 : 0, sy: g }); }
      }
    },
  });

  // ------------------------------------------------------------------ 5. PHONE (b5 → b32.4): the hero container, never cut
  // Real UI: full-page captures of the mobile site (390 px @3x) with the sticky header and fixed nav captured as their own
  // layers, so pages scroll and push under them exactly like the site's view transitions keep header + nav in place.
  const PAGES = {
    home: { img: 'home.png', w: 394 },
    explorar: { img: 'explorar.png', w: 390 },
    producto: { img: 'producto.png', w: 390 },
    publicar: { img: 'publicar.png', w: 390 },
  };
  const push = (t, m) => step(t - (bt(m) - 0.3), 'default');         // iOS push, lands on the whoosh
  const SCROLL = { response: 0.9, damping: 1 };                        // a finger flick, critically damped
  // touch visualizer: [appear, leave, [[beat, x, y] …] in screen px, taps]
  const TOUCH = [
    [8.3, 11.95, [[8.3, 196, 520], [8.4, 150, 427], [9.3, 236, 520], [10.8, 327, 437]], [9, 11.5]],
    [13.7, 14.9, [[13.7, 214, 470], [13.85, 102, 330]], [14.5]],
    [18.15, 19.4, [[18.15, 230, 700], [18.3, 150, 574]], [19]],
    [24.75, 25.9, [[24.75, 260, 700], [24.9, 193, 810]], [25.5]],
  ];
  scene({
    name: 'phone', from: 5, to: 32.4, cut: false,
    build(root, S) {
      S.rig = reg(el('div', { class: 'abs' }, root));
      S.ph = reg(el('div', { class: 'phone' }, S.rig));
      for (const [l, tp, h] of [[-3, 190, 36], [-3, 262, 64], [-3, 340, 64], [417, 290, 104]]) el('div', { class: 'btn', style: `left:${l}px;top:${tp}px;height:${h}px` }, S.ph);
      const sc = el('div', { class: 'screen' }, S.ph);
      const pages = el('div', { class: 'pages' }, sc);
      S.pg = {};
      for (const [k, p] of Object.entries(PAGES)) {
        const page = reg(el('div', { class: 'page' }, pages), { hide: true });
        const body = reg(el('div', { class: 'body' }, page));
        el('img', { src: A + 'ui/' + p.img, style: `width:${p.w}px` }, body);
        const dim = reg(el('div', { class: 'dim' }, page), { o: 0 });
        S.pg[k] = { page, body, dim };
      }
      // Rebuilt over the captured search box: the input's white field and typed text (the capture shows its placeholder).
      const hb = S.pg.home.body;
      S.field = reg(el('div', { class: 'abs', style: 'left:62px;top:374px;width:216px;height:33px;background:#fff' }, hb), { o: 0 });
      S.typed = reg(el('span', { class: 'abs', style: "left:67px;top:380px;font:400 15px/21px 'UI';color:#111;white-space:nowrap" }, hb, ''));
      S.caret = reg(el('span', { class: 'abs', style: 'top:380px;width:1.5px;height:21px;background:#111' }, hb), { o: 0 });
      // Rebuilt filled state of the upload box once photos arrive (the capture shows the empty state).
      S.upl = reg(el('div', { class: 'abs', style: 'left:34px;top:650px;width:322px;height:214px;border-radius:11px;background:#EFEDE3' }, S.pg.publicar.body), { o: 0 });
      el('img', { class: 'abs', src: A + 'ui/header.png', style: 'width:394px' }, pages);
      S.nav = ['nav', 'nav-buscar', 'nav-publicar'].map((n) => reg(el('img', { class: 'abs', src: A + `ui/${n}.png`, style: 'top:705px;width:390px' }, pages), { hide: true }));
      const st = el('div', { class: 'status' }, sc);
      el('b', {}, st, '9:41');
      el('div', { class: 'abs', style: 'left:290px;top:17px' }, st,
        '<svg width="70" height="14" viewBox="0 0 70 14"><g fill="#111"><rect x="0" y="9" width="3.2" height="4" rx="1"/><rect x="5" y="6.5" width="3.2" height="6.5" rx="1"/><rect x="10" y="3.5" width="3.2" height="9.5" rx="1"/><rect x="15" y="1" width="3.2" height="12" rx="1"/>' +
        '<path d="M31 4.2a9 9 0 0 1 12 0l-1.4 1.5a7 7 0 0 0-9.2 0zM33.6 7a5.2 5.2 0 0 1 6.8 0L39 8.5a3.2 3.2 0 0 0-4 0zM37 12.6l-1.8-2a2.6 2.6 0 0 1 3.6 0z"/>' +
        '<rect x="46.5" y="1.5" width="21" height="11" rx="3.4" fill="none" stroke="#111" stroke-opacity=".45"/><rect x="48.5" y="3.5" width="15" height="7" rx="1.8"/><rect x="68.6" y="5" width="1.4" height="4" rx=".7" fill-opacity=".45"/></g></svg>');
      el('div', { class: 'island' }, sc);
      el('div', { class: 'homebar' }, sc);
      S.ring = reg(el('div', { class: 'ring' }, sc), { o: 0 });
      S.touch = reg(el('div', { class: 'touch' }, sc), { o: 0 });

      // overlays living in rig space (they zoom with the camera): chat bubbles, meeting point, photos, Togito, sticker
      S.b1 = reg(el('div', { class: 'bubble me' }, S.rig, 'Hola, ¿siguen disponibles<br>los audífonos?'), { o: 0 });
      S.b2 = reg(el('div', { class: 'bubble them' }, S.rig, '¡Sí! ¿Nos vemos en<br>la biblioteca?'), { o: 0 });
      S.pin = reg(el('div', { class: 'pin' }, S.rig,
        '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#F4D928" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.99-5.54 10.19-7.4 11.8a1 1 0 0 1-1.2 0C9.54 20.19 4 14.99 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>Entrada de la biblioteca · Lima'), { o: 0 });
      S.photos = ['backpack', 'books', 'camera'].map((n) => { const d = reg(el('div', { class: 'photo' }, S.rig), { o: 0 }); el('img', { src: A + `brand/${n}.jpg` }, d); return d; });
      S.togi = reg(el('img', { class: 'abs', src: A + 'brand/togito-5-cut.png', style: `width:${pick(330, 300, 300)}px;transform-origin:50% 100%` }, S.rig), { o: 0 });
      S.stick = reg(el('div', { class: 'sticker' }, S.rig, 'MENOS CAJONES.<br>MÁS CONEXIONES. ✳'), { o: 0 });
    },
    run(t, b, S) {
      const P = pose(t), cam = camera(t, b);
      put(S.rig, { x: cam.x, y: cam.y, s: cam.s });
      put(S.ph, { x: P.x, y: P.y, s: P.s, r: P.r });

      // ---- pages: push in from the right, the outgoing page parallaxes -30 % and dims
      const pE = push(t, 'push_explorar'), pP = push(t, 'push_producto'), pU = push(t, 'push_publicar');
      const order = [['home', 1, pE], ['explorar', pE, pP], ['producto', pP, pU], ['publicar', pU, 0]];
      for (const [k, pin, pout] of order) {
        const g = S.pg[k], x = 390 * (1 - pin) - 117 * pout;
        const shown = (k === 'home' || pin > 0.001) && pout < 0.999;
        put(g.page, { hide: !shown, x });
        put(g.dim, { o: 0.12 * pout });
      }
      put(S.pg.explorar.body, { y: -trk(t, [[0, 520], [12.4, 668, SCROLL]]) });
      put(S.pg.producto.body, { y: -trk(t, [[0, 0], [16.25, 453, SCROLL]]) });
      put(S.pg.publicar.body, { y: -trk(t, [[0, 0], [26.2, 380, SCROLL]]) });
      const navI = b < 12 ? 0 : b < 26 ? 1 : 2;
      S.nav.forEach((n, i) => put(n, { hide: i !== navI }));

      // ---- typing "audífonos" into the real search box
      const focused = b >= 9.02;
      put(S.field, { o: focused ? 1 : 0 });
      const n = type(t, S.typed, 'audífonos', 'type0', 'type1', S.caret, 11.5);
      put(S.caret, { x: 67 + n * 8.1 + 1 });
      if (!focused) put(S.caret, { o: 0 });

      // ---- touch visualizer
      let tx = 0, ty = 0, vis = 0, press = 0, ringAge = -1;
      for (const [a0, a1, keys, taps] of TOUCH) {
        const v = C.win(t, a0, a1, 'snappy', 'snappy');
        if (b >= a0 - 0.3 && b < a1 + 0.5) {
          vis = v;
          tx = trk(t, keys.map(([k, x]) => [k, x]), 'default');
          ty = trk(t, keys.map(([k, , y]) => [k, y]), 'default');
          for (const tp of taps) {
            press += sp(t, tp, 'snappy') - sp(t, tp + 0.2, 'snappy');   // pops are visible from their first frame: no lead
            const age = t - bt(tp);
            if (age > -0.02 && age < 0.42) ringAge = Math.max(0, age);
          }
        }
      }
      put(S.touch, { o: snapO(vis), x: tx, y: ty, s: (0.55 + 0.45 * vis) * (1 - 0.2 * press) });
      if (ringAge >= 0) { const k = ringAge / 0.42; put(S.ring, { o: 1 - k, x: tx, y: ty, s: 1 + 1.3 * ease.out(k) }); }

      // ---- chat: two bubbles grow out of the contact button, a meeting point grows out of the reply
      const home = (lx, ly) => map(P, lx, ly);
      const gone = sp(t, 23.62, 'snappy');                                                  // collapse back into the phone
      const bub = (e, at, anchor, w, rightAligned) => {
        const g = sp(t, at, 'snappy') * (1 - gone);
        const x = rightAligned ? anchor.x - w : anchor.x;
        put(e, { o: snapO(g), x: x + (rightAligned ? 60 : -60) * (1 - g), y: anchor.y + 30 * (1 - g), s: 0.82 + 0.18 * g });
      };
      if (WIDE) {
        bub(S.b1, 'bub1', home(64, 452), 438, true);
        bub(S.b2, 'bub2', home(64, 610), 346, true);
        bub(S.pin, 'pin', home(64, 770), 520, true);
      } else {
        bub(S.b1, 'bub1', { x: pick(0, 60, 60), y: home(0, 380).y }, 0, false);
        bub(S.b2, 'bub2', { x: pick(0, 170, 170), y: home(0, 540).y }, 0, false);
        bub(S.pin, 'pin', { x: pick(0, 60, 60), y: home(0, 700).y }, 0, false);
      }

      // ---- photos card-rise into the upload box (phone-local slots inside the box at page y 649, scrolled 380)
      put(S.upl, { o: b >= beatOf('ph1') - 0.05 ? 1 : 0 });
      S.photos.forEach((ph, i) => {
        const at = ['ph1', 'ph2', 'ph3'][i];
        const g = sp(t, at, 'default'), lift = ease.expoIn(seg(t, 31.2, 31.95));
        const slot = { x: 57 + i * 104, y: 390 }, from = { x: slot.x - 40 + i * 30, y: 1000 + i * 40 };
        const lx = lerp(from.x, slot.x, g), ly = lerp(from.y, slot.y, g);
        const m = map(P, lx, ly);
        put(ph, { o: snapO(g) * (1 - (lift > 0.999 ? 1 : 0)), x: m.x, y: m.y, s: P.s * (1 + 1.3 * (1 - g)), r: P.r + [-10, 7, -5][i] * (1 - g) });
      });
      // ---- Togito celebrates (mascot: playful spring allowed), then the site's seller sticker
      const tg = sp(t, 'togito', 'playful') * (1 - sp(t, 31.3, 'snappy'));
      const tp = WIDE ? home(-330, 520) : { x: 30, y: home(0, 560).y };
      put(S.togi, { o: snapO(tg), x: tp.x, y: tp.y + 40 * (1 - tg), s: 0.3 + 0.7 * tg, r: 8 * (1 - tg) });
      const sk = sp(t, 'sticker', 'snappy') * (1 - sp(t, 31.3, 'snappy'));
      const kp = WIDE ? home(300, 120) : { x: 40, y: home(0, 430).y };
      put(S.stick, { o: snapO(sk), x: kp.x, y: kp.y, s: 0.7 + 0.3 * sk, r: -6 - 6 * (1 - sk) });
    },
  });

  // ------------------------------------------------------------------ 6. CATEGORIES (b36 → b40): the yellow marquee covers, real category tiles build
  const CATS = [['Tecnología', 'tecnologia', '#C0D1F9'], ['Libros', 'libros', '#F1DA4E'], ['Ropa', 'ropa', '#C6E28C'],
    ['Apuntes', 'apuntes', '#F2A89D'], ['Accesorios', 'accesorios', '#E5D8EE'], ['Deportes', 'deportes', '#F2CE9F']];
  const MARQ = 'BUENAS COSAS, SEGUNDAS HISTORIAS  ✳  DE TU CAMPUS A TUS MANOS  ✳  COMPRA CERCA. CONECTA MÁS.  ✳  ';
  scene({
    name: 'cats', from: 'cats', to: 'quote', pre: 0.62,
    build(root, S) {
      S.bg = reg(el('div', { class: 'fill', style: 'background:var(--bg)' }, root), { o: 0 });
      S.title = WIDE ? [line(root, '¿QUÉ ANDAS BUSCANDO?', { x: PAD, y: 176, size: 150 })]
        : [line(root, '¿QUÉ ANDAS', { x: PAD, y: 320, size: 128 }), line(root, 'BUSCANDO?', { x: PAD, y: 450, size: 128 })];
      const tw = pick(262, 290, 420), th = pick(400, 290, 272), gap = pick(18, 20, 18);
      S.tiles = CATS.map(([name, img, bg], i) => {
        const x = WIDE ? PAD + i * (tw + gap) : PAD + (i % 2) * (tw + gap), y = WIDE ? 404 : 624 + Math.floor(i / 2) * (th + gap);
        const d = reg(el('div', { class: 'tile', style: `left:${x}px;top:${y}px;width:${tw}px;height:${th}px;background:${bg}` }, root), { o: 0 });
        el('span', { class: 'num' }, d, '0' + (i + 1));
        el('img', { src: A + `brand/categories/togito-${img}.webp`, style: `top:${th * 0.1}px;height:${th * 0.66}px` }, d);
        el('strong', {}, d, name + '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2.2" stroke-linecap="round"><path d="M7 17 17 7M7 7h10v10"/></svg>');
        return d;
      });
      S.band = reg(el('div', { class: 'band', style: `width:${W * 2.2}px` }, root));
      S.mq = reg(el('span', {}, S.band, (MARQ + MARQ + MARQ + MARQ)));
    },
    run(t, b, S) {
      const cover = 36.32;                                   // the band fills the frame here; the new scene is revealed under it
      put(S.bg, { o: b >= cover ? 1 : 0 });
      const bh = trk(t, [[0, 140], [35.98, H * 2.3, 'snappy'], [cover + 0.06, pick(96, 96, 104), 'default']]);
      const cy = trk(t, [[0, H / 2], [cover + 0.06, pick(946, 960, 200), 'default']]);
      const r = trk(t, [[0, -7], [cover + 0.06, pick(-2, -2, -3), 'default']]);
      const bx = -W * 2.3 * (1 - spHit(t, 'cats', 'default'));
      put(S.band, { x: -W * 0.6 + bx, y: cy - bh / 2, r, css: { height: bh + 'px' } });
      put(S.mq, { x: -((t - bt(35)) * 150) % 2400 });
      const show = b >= cover;
      S.title.forEach((L, i) => { if (show) rise(t, L, cover + 0.05 + i * 0.12, null, { stagger: 0.07 }); else L.words.forEach((w) => put(w, { hide: true })); });
      S.tiles.forEach((d, i) => {
        const g = show ? sp(t, 36.4 + i * 0.4, 'default') : 0;
        put(d, { o: snapO(g), y: 110 * (1 - g), s: 0.86 + 0.14 * g, r: [-4, 3, -3, 4, -2, 3][i] * (1 - g) });
      });
    },
  });

  // ------------------------------------------------------------------ 7. QUOTE (b40 → b44): hard cut to yellow, Togito waves
  scene({
    name: 'quote', from: 'quote', to: 'logo',
    build(root, S) {
      root.style.background = 'var(--accent)';
      S.ey = WIDE ? [uline(root, 'HISTORIAS QUE QUEREMOS HACER POSIBLES', { x: PAD + 4, y: 236, size: 30, eyebrow: true })]
        : [uline(root, 'HISTORIAS QUE QUEREMOS', { x: PAD + 4, y: 300, size: 28, eyebrow: true }), uline(root, 'HACER POSIBLES', { x: PAD + 4, y: 342, size: 28, eyebrow: true })];
      S.l1 = WIDE ? [line(root, 'DE UN ESTUDIANTE.', { x: PAD, y: 290, size: 176 })]
        : [line(root, 'DE UN', { x: PAD, y: 400, size: 160 }), line(root, 'ESTUDIANTE.', { x: PAD, y: 566, size: 160 })];
      S.l2 = line(root, 'PARA OTRO.', { x: PAD, y: pick(490, 520, 732), size: pick(176, 160, 160) });
      S.togi = reg(el('img', { class: 'abs', src: A + 'brand/togito-3-cut.png', style: `width:${pick(470, 400, 520)}px;transform-origin:50% 100%` }, root), { o: 0 });
      S.push = root;
    },
    run(t, b, S) {
      put(S.push, { s: 1 + 0.035 * ease.inOut(seg(t, 'quote', 'logo')) });
      S.ey.forEach((L, i) => rise(t, L, 40.3 + i * 0.08, null, { preset: 'snappy' }));
      // word 0 is released just before the cut so the first frame of the shot already reads
      if (WIDE) rise(t, S.l1[0], [39.8, 40.25, 40.5]);
      else { rise(t, S.l1[0], [39.8, 40.25]); rise(t, S.l1[1], [40.5]); }
      rise(t, S.l2, 'q2', null, { stagger: 0.1 });
      const g = sp(t, 40.9, 'playful');
      put(S.togi, { o: snapO(g), x: pick(1330, 640, 470), y: pick(560, 600, 1000) + 60 * (1 - g), s: 0.4 + 0.6 * g, r: -6 * (1 - g) });
    },
  });

  // ------------------------------------------------------------------ 8. END CARD (b44 → b48): real logo + CTA, never static
  scene({
    name: 'end', from: 'logo', to: 'done',
    build(root, S) {
      S.push = reg(el('div', { class: 'abs', style: `width:${W}px;height:${H}px;transform-origin:${PAD}px ${H / 2}px` }, root));
      const lw = pick(820, 700, 800);
      S.logo = reg(el('img', { class: 'abs', src: A + 'brand/sacha-market-logo.webp', style: `left:${PAD - lw * 0.11}px;top:${pick(236, 170, 470)}px;width:${lw}px;transform-origin:15% 60%` }, S.push), { o: 0 });
      S.cta = uline(S.push, 'Compra y vende en tu campus.', { x: PAD, y: pick(636, 520, 860), size: pick(66, 50, 50), color: 'var(--ink)' });
      S.cta.el.style.fontWeight = '600';
      S.btn = reg(el('div', { class: 'cta-btn', style: `left:${PAD}px;top:${pick(752, 610, 960)}px;font-size:${pick(58, 48, 46)}px` }, S.push,
        'sacha-market.vercel.app<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#F4D928" stroke-width="2.4" stroke-linecap="round"><path d="M7 17 17 7M7 7h10v10"/></svg>'), { o: 0 });
      S.arrow = reg(S.btn.querySelector('svg'));
      S.togi = reg(el('img', { class: 'abs', src: A + 'brand/togito-3-cut.png', style: `width:${pick(560, 380, 400)}px;transform-origin:50% 100%` }, S.push), { o: 0 });
    },
    run(t, b, S) {
      put(S.push, { s: 1 + 0.05 * ease.inOut(seg(t, 'logo', 'done')) });
      const g = spHit(t, 'logo', 'heavy');
      put(S.logo, { o: snapO(g), s: 0.86 + 0.14 * g, y: 50 * (1 - g) });
      rise(t, S.cta, 'cta', null, { stagger: 0.04, preset: 'default' });
      const u = sp(t, 'url', 'snappy');
      put(S.btn, { o: snapO(u), s: 0.88 + 0.12 * u, x: -20 * (1 - u) });
      // the arrow nudges on each remaining beat so the hold keeps breathing
      const nud = [46.5, 47, 47.5].reduce((a, k) => a + spHit(t, k, 'snappy') - sp(t, k + 0.2, 'snappy'), 0);
      put(S.arrow, { x: 5 * nud, y: -5 * nud });
      const tg = sp(t, 45.85, 'playful');
      put(S.togi, { o: snapO(tg), x: pick(1250, 700, 560), y: pick(390, 480, 1090) + 60 * (1 - tg), s: 0.4 + 0.6 * tg, r: 6 * (1 - tg) });
    },
  });

  C.start();
})();
