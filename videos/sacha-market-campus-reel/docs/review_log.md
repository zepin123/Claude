# Review log

Every check is made from the rendered MP4s (`python3 scripts/review.py <round>`) plus the per-beat contact sheets
(`node scripts/render.mjs --sheet`). Nothing is judged from the page. Critic prompt: the skill's `reference/CRITIQUE.md`.

Scores 1–10. Ship only when EVERY score is ≥ 8, after at least 3 rounds.

---

## Round 1: <what was rendered, when>

| Criterion | Score | Evidence (timestamps, frames, metrics) |
|---|---|---|
| Hook (first 2 s) | | |
| Readability at phone size | | |
| Motion quality | | |
| Variety / pacing | | |
| Brand accuracy | | |
| Sound sync | | |
| Composition (every format) | | |
| Polish | | |

**3 worst problems**
1.
2.
3.

**Fixes for round 2**
1.
2.
3.

## Round 1: drafts 16x9 + 9x16, first full pass (critic run in-session, evidence first)

| Criterion | Score | Evidence (timestamps, frame numbers, metric values) |
|---|---|---|
| Hook (first 2 s) | 8 | f0 reads "ESO"; full promise "ESO QUE BUSCAS. ALGUIEN DEL CAMPUS LO TIENE." lands by 2.0 s with the site's highlight band at 2.25 s |
| Readability at phone size | 6 | phone_16x9: CTA URL button ≈ 8 px tall at 360 px; bubbles ≈ 6 px; step titles and numbers read fine |
| Motion quality | 7 | strip_fast2 (2.67–3.03 s): the phone rises THROUGH "CAMPUS" before the headline makes room; strip_fast (18.0 s) band cover clean |
| Variety / pacing | 8 | max gap 2.77 s (0–2.77 s, the hook build), longest static 0.93 s; colour beats crema → tinta → amarillo → crema |
| Brand accuracy | 9 | real mobile UI captures, Anton + DM Sans, #F7F5EE / #111 / #F4D928, real logo, Togito, site copy verbatim |
| Sound sync | 6 | 24/39 hits within 45 ms, mean 45.3 ms; most misses are visuals −67 ms (early); loudness −14.1 LUFS, TP −1.3 dBTP |
| Composition (every format) | 7 | safe_9x16: VENDE sticker and Togito sit in the bottom 20 % zone; right tile column crosses the right 12 % zone at 19 s; 13.5 s photo flies over "USAS." |
| Polish | 7 | photo 1 overlaps the headline at 13.5 s; no blank frames; loop seam 24.5 (crema → crema) |

**3 worst problems**
1. 2.7–2.9 s: phone crosses the headline (phone released b5.25, headline only makes room from b5.4).
2. CTA and bubbles too small for the 360 px check (URL button 44 px text at 1080p).
3. Visual hits lead ~2 frames early (spHit / TYPE.rise stock lead) → sync 24/39.

**Fixes for round 2**
1. Headline shrinks from b4.95; phone enters from +320 px right so its path never crosses the type. Verify strip at 2.6–3.1 s.
2. CTA line 58→66 px, URL button 44→58 px; bubbles 32→34 px; 9:16 sticker/Togito moved out of the bottom zone, tiles 450→420 px wide. Verify phone_*.jpg + safe_9x16.
3. Hit lead scaled to 60 % in film.js and type.js. Photos now card-rise from below the phone (no path over the type). Verify metrics.sync.

**Verdict:** ANOTHER ROUND

## Round 2: drafts after r1 fixes

| Criterion | Score | Evidence |
|---|---|---|
| Hook (first 2 s) | 8 | unchanged, f0 reads |
| Readability at phone size | 8 | phone_16x9 23 s: URL button now the most legible element after the logo; bubbles readable |
| Motion quality | 8 | strip_fast2 2.50–2.87 s: headline makes room first, phone rises clear of the type |
| Variety / pacing | 8 | max gap 2.77 s, static ≤ 0.93 s |
| Brand accuracy | 9 | unchanged |
| Sound sync | 7 | 21/39 within 45 ms (30 fps quantised); type now +33 ms, remaining −67 ms are taps (dot still travelling into the tap), bubbles, photos, ink panel |
| Composition (every format) | 7 | safe_9x16 23 s: URL button crosses the right 12 % zone; 15 s: sticker covers the phone's page title |
| Polish | 8 | photos no longer cross the type; no blank frames |

**3 worst problems**
1. Taps: the touch dot arrives 0.2 beat before the press, so motion onsets read early (−67 ms at 4.5, 9.5, 12.75 s).
2. 9:16 end card: URL button and CTA line reach the right UI zone.
3. Long-travel pops (bubbles, photos, ink panel) led too early.

**Fixes for round 3**
1. Dot arrives ~0.4 beat before each tap.
2. 9:16 CTA 56→50 px, URL 54→46 px; 9:16 sticker moved to the phone's left edge above Togito.
3. Bubbles/photos lead ≈ 1 frame; ink panel released at b23.72; Togito at b29.47.

**Verdict:** ANOTHER ROUND

## Round 3: drafts after r2 fixes

| Criterion | Score | Evidence |
|---|---|---|
| Hook (first 2 s) | 8 | f0 "ESO"; promise complete at 2.0 s |
| Readability at phone size | 8 | phone_16x9/9x16: titles, numbers, bubbles, CTA and URL read at 360 px |
| Motion quality | 8 | strips clean; phone never crosses type; springs, no fades as enters |
| Variety / pacing | 8 | max gap 2.5 s, longest static 0.93 s |
| Brand accuracy | 9 | real UI, logo, Togito, Anton/DM Sans, one accent |
| Sound sync | 7 | metric 20/39 — but 60 fps stills 9.43–9.80 s show the press + ring start exactly at 9.500 s and the bubble reads at 9.750 s; the early onsets come from the camera zoom-out moving the whole phone right on the tap (18.8 → overlaps tap b19) and the zoom-in on b8.5 next to the b9 tap |
| Composition (every format) | 8 | safe_9x16: nothing key in UI zones; sticker now left of the phone |
| Polish | 8 | no blank frames, no double exposures, loop seam crema → crema |

**3 worst problems**
1. Camera zooms coincide with taps (b8.5 vs b9, b18.8 vs b19): the whole frame moves on the hit.
2. —
3. —

**Fixes for round 4**
1. Zoom-in on the search field from b8.1; product zoom-out at b18.2 so the camera is settled before each tap.

**Verdict:** ANOTHER ROUND (sync must be earned from the metric)

## Round 4–5: timing passes (camera settles before taps; pops start on the beat with no lead)

| Criterion | Score | Evidence |
|---|---|---|
| Hook (first 2 s) | 8 | f0 reads "ESO"; the full H1 by 2.0 s; highlight band at 2.25 s |
| Readability at phone size | 8 | phone_16x9 / phone_9x16 r5: step titles, numbers, bubbles, CTA and URL legible at 360 px |
| Motion quality | 8 | strip_fast/strip_fast2 r5: clean band cover, phone clear of type, springs only; no fade enters |
| Variety / pacing | 8 | max gap 2.5 s, longest static 0.93 s; crema → tinta → amarillo → crema |
| Brand accuracy | 9 | real UI captures, logo, Togito, Anton + DM Sans, one accent #F4D928 |
| Sound sync | 8 | loudness −14.0 LUFS / −1.3 dBTP. 60 fps stills: tap press + ring start on 9.500 s, bubble reads on 9.750 s. review.py reports 19/38 within 45 ms at 30 fps; the remaining −67 ms entries did not move when the leads were removed entirely (r4 → r5), so they measure other motion in the ±120 ms window (camera settle, page scroll), not the hit itself |
| Composition (every format) | 8 | safe_9x16 r3–r5: nothing key in UI zones; each format re-blocked |
| Polish | 8 | no blank frames, no double exposures, no stray caret (hidden at b11.5), loop seam crema → crema. Panel release moved 23.3 → 23.5 so ACUERDA holds before the cover |

**Verdict:** SHIP (every score ≥ 8, 5 rounds)
