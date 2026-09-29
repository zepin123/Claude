# Sacha Market — campus reel

Video de 24 s para https://sacha-market.vercel.app, hecho en código con el kit *motion-reel*
(película = función pura del tiempo `window.seek(t)`, springs, música y SFX sintetizados, mezcla a −14 LUFS).

| Archivo | Uso |
|---|---|
| `renders/16x9.mp4` | 1920×1080, 60 fps — hero del sitio web, YouTube |
| `renders/9x16.mp4` | 1080×1920, 60 fps — Reels, TikTok, Stories |
| `renders/poster_16x9.jpg`, `renders/poster_9x16.jpg` | póster (`<video poster>`) |
| `renders/contact_16x9.jpg` | un fotograma por beat |

## Guion (120 BPM, 48 beats)
1. **0–4 s** ESO QUE BUSCAS. ALGUIEN DEL CAMPUS LO TIENE. (H1 del sitio, palabra por palabra, banda amarilla) y el iPhone entra con la home real.
2. **4–8 s** PASO 01 · BUSCA. — toque en el buscador, escribe "audífonos", Buscar → Explorar → toque en Audífonos.
3. **8–11 s** PASO 02 · HABLA. — ficha del producto, "Contactar vendedor", dos mensajes.
4. **11–12 s** PASO 03 · ACUERDA. — "Entrada de la biblioteca · Lima".
5. **12–16 s** VENDE LO QUE YA NO USAS. — Publicar, tres fotos entran al formulario, Togito celebra.
6. **16–18 s** 0% de comisión · 3 campus · 13 categorías.
7. **18–20 s** ¿QUÉ ANDAS BUSCANDO? — marquesina amarilla y categorías con Togito.
8. **20–22 s** DE UN ESTUDIANTE. PARA OTRO.
9. **22–24 s** Logo + "Compra y vende en tu campus." + sacha-market.vercel.app

Toda la UI del teléfono es real: capturas móviles (390 px @3x) del propio código de `zepin123/sacha-market`
(`scripts/capture-ui.mjs`, `scripts/capture-nav.mjs`), con cabecera y barra inferior como capas propias.
Solo se reconstruyeron encima el texto escrito en el buscador y el estado "con fotos" de la zona de subida.

## Volver a renderizar
```sh
npm i                                   # playwright
node scripts/sync.mjs                   # timeline.json → film/data.js + cues
python3 scripts/music.py && python3 scripts/beats.py audio/music.wav --stem audio/drums.wav
node scripts/sfx.mjs && python3 scripts/mix.py
node scripts/render.mjs --all           # finales 60 fps con motion blur
```
Vista previa con audio: abre `film/index.html?play` desde un servidor estático en la raíz de esta carpeta.
Documentación: `docs/style_guide.md`, `docs/shotlist.md`, `docs/review_log.md` (5 rondas de crítica).

## Insertarlo en el sitio
```html
<video autoplay muted loop playsinline preload="metadata" poster="/video/sacha-reel-poster.jpg">
  <source src="/video/sacha-reel-16x9.mp4" type="video/mp4">
</video>
```
