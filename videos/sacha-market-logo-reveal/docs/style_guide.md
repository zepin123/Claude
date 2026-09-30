# Style guide: Sacha Market logo reveal

- **Palette:** #111111 (opening field), #F7F5EE (lockup field, the site's background), #F4D928 (the one accent: dot, band, tile, period).
- **Logo:** `assets/brand/sacha-market-logo.webp` vectorized with potrace (`tools/vectorize.py` → `film/logo.js`): tile, S, 10 letters
  and the period as separate pieces in logo units (640×275). The tile is rebuilt as a rounded rect fitted to the traced shape
  (158×160, r 38, −7.5°) so it can morph; fit error ≈ 1 logo unit.
- **Type:** the wordmark is the logo's own letterforms; the eyebrow is DM Sans 700, uppercase, tracking 0.22em.
- **Rhythm:** 120 BPM. Dot lands b0.5 · band b1–b1.25 · tile b2 (drop) · S draws b2.1–b2.8, fills b2.9 · iris b2.7–b3.1 ·
  camera pulls b3.1 · "sacha" b3.4 · "market" b3.9 · period lands b4.75 · eyebrow b5.25 · nod b6.1 · underline b7 · end b8.8.
- **Motion:** closed-form springs only (heavy for camera and type, default for the tile morph, snappy for squash/pops);
  the band uses the indicator (leading edge stiffer, it stretches and settles); the period follows a ballistic arc.
- **Transitions:** morph (one container: dot → band → tile), iris from the tile, masks for letters. No fades, no glow, no particles.
- **Sound:** pop on the dot landing, whoosh on the band, riser + thump on the tile, ticks while the S draws, pop on the fill,
  whoosh on the iris, pops on the words, thump on the period, click on the underline. −14 LUFS.
