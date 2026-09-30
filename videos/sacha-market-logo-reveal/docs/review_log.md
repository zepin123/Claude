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

## Round 1: first full draft (critic run in-session, evidence first)

| Criterion | Score | Evidence |
|---|---|---|
| Hook (first 2 s) | 6 | f0: a 44 px dot on a black field (near-blank); the logo only completes at 2.4 s |
| Readability at phone size | 8 | lockup legible at 360 px in all formats; eyebrow is secondary |
| Motion quality | 8 | strip_fast2: dot → band → tile morph clean; strip_fast: iris + fill clean |
| Variety / pacing | 7 | longest static 2.03 s (2.73–4.76 s), max gap 3.0 s |
| Brand accuracy | 9 | real logo pieces (vectorized), exact palette, the site's eyebrow |
| Sound sync | 7 | 3/8 within 45 ms; words measured −133 ms |
| Composition | 8 | lockup centred per format, 9x16 re-scaled |
| Polish | 8 | no blank frames, S outline thin (hairline) at sA scale |

**3 worst problems:** 1. frame 0 near-blank; 2. end hold static > 2 s; 3. word timing.
**Fixes:** dot 44 → 72 px and already falling on frame 0 (lands b0.5 with squash); duration 4.8 → 4.4 s, hold push 3.5 → 5.5 %,
bigger nod; S stroke 100 → 240 units; word lead retuned.
**Verdict:** ANOTHER ROUND

## Round 2

| Criterion | Score | Evidence |
|---|---|---|
| Hook (first 2 s) | 8 | f0 shows the dot mid-fall; tile formed at 1.0 s, name reads at 1.9 s |
| Readability at phone size | 8 | phone_*.jpg |
| Motion quality | 8 | strips clean |
| Variety / pacing | 8 | longest static 1.63 s, max gap 2.47 s |
| Brand accuracy | 9 | unchanged |
| Sound sync | 7 | 60 fps stills 1.633–1.95 s: "sacha" first appears ~1.85 s, i.e. ~150 ms LATE (the −133 ms in metrics.json is the camera pull in the same window) |
| Composition | 8 | 9x16 lockup 874 px wide, eyebrow clear of UI zones |
| Polish | 8 | — |

**Fix:** word lead = 1.7 × leadFor('heavy'). **Verdict:** ANOTHER ROUND

## Round 3

| Criterion | Score | Evidence |
|---|---|---|
| Hook (first 2 s) | 8 | f0 dot falling; tile at 1.0 s; "sacha" reads 1.70–1.75 s |
| Readability at phone size | 8 | phone_16x9 / 9x16 / 1x1: lockup and eyebrow legible |
| Motion quality | 8 | springs only, stretch/settle band, ballistic period with landing squash; no fades |
| Variety / pacing | 8 | something new every ≤ 0.5 s until 2.6 s; hold 1.63 s with push, nod and underline |
| Brand accuracy | 9 | the real logo, vectorized; crema/tinta/amarillo |
| Sound sync | 8 | 60 fps stills: dot landing, tile, fill, "sacha", period on their beats; loudness −14.0 LUFS, TP −1.5 dBTP |
| Composition | 8 | re-scaled per format; nothing in 9x16 UI zones |
| Polish | 8 | no blank frames (near_blank_frames = []), no stray strokes after the fill |

**Verdict:** SHIP

## Final: determinism fix + 60 fps finals

`render --verify` failed 5/12 after b4.6: letter edges rendered 1 px bolder/thinner depending on the frames painted before
(Chromium path/decode caches for inline SVG and scaled images). The logo is now drawn on a canvas every frame from the traced
Path2D data → 12/12 identical in 16x9, 9x16 and 1x1. Final frames checked at 60 fps: tile closes on the drop (1.00–1.05 s),
the period lands at 2.367–2.383 s on its 2.375 s cue. Loudness −14.0 LUFS, true peak −1.5 dBTP. Verdict: SHIP.
