# Style guide: Sacha Market reel

Source material: `assets/site/info.json` (desktop capture), `assets/ui/*.png` + `ui.json` (mobile layers and tap rects),
`assets/brand/` (logo, Togito poses, category art, product photos), the repo's `DESIGN.md`.
Reference: "Built on iPhone" (whatships.com). Grammar only.

## 1. Palette (measured)
| Token | Hex | Source |
|---|---|---|
| `--bg` | #F7F5EE | `--background`, body + header |
| `--ink` | #111111 | `--foreground`, headlines, black buttons, seller banner |
| `--ink-2` | #4F4E47 | hero paragraph colour |
| `--accent` | #F4D928 | `--yellow`: logo tile, Publicar button, highlight band, marquee — the ONE accent |
| `--card` | #FFFFFF | product cards, search box |
The site's blue/green/coral appear only inside real captured UI and art (category tiles, Togito). They are never used for film graphics.

## 2. Type
- Display: Anton 400, UPPERCASE, full stop at the end of every statement, tracking -0.02em, line-height 1.02. The site's
  highlight = a yellow band from 62 % to 96 % of the line box behind the key phrase ("LO TIENE.").
- UI: DM Sans 500–700, sentence case (eyebrows: 700, uppercase, tracking 0.12em).
- Sizes at 1080p: hero 150–190 px, captions 190 px, sublines ≥ 34 px, eyebrows ≥ 28 px.

## 3. Rhythm (reference grammar)
120 BPM, 1 bar = 2 s. The phone never cuts: it rises in once and stays the container of the film for 16 s while screens push
inside it. Hard cuts only for full-frame colour changes, on bar lines (b24, b32, b36, b40, b44). A tap, a push or a caption
every 1–2 beats.

## 4. Transitions (vocabulary)
iOS push inside the phone (new screen slides from the right, old one parallaxes -30 %) · tap → push · colour wipe on a bar
(ink panel slides up, yellow marquee band covers) · push past camera · type rise/lift through masks. Never crossfades.

## 5. Camera
The phone enters with a 2D tilt (-9° → -2°, the logo's 9° lean) and a deep soft contact shadow. Punch-ins on UI moments
(search field, contact button, upload box) 1.00 → 1.35. Every hold keeps a 1.00 → 1.04 micro push.

## 6. Texture & finish
Clean digital, no grain, no glow. Depth from the phone's shadow and 1 px ink borders (the site's border language).

## 7. Text in / out
Enter: words rise through masks (heavy), eyebrows/sublines rise small. Exit: lift through the mask or get covered by a wipe.

## 8. Sound
Original synth, bright major loop (C–G–Am–F). Taps = click, pages = whoosh landing on the push, words/cards = pop,
typing = ticks, logo = riser + thump. Mix -14 LUFS.
