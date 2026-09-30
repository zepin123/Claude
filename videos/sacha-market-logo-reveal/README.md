# Sacha Market — logo reveal

Revelación del logo de 4.4 s, hecha en código con el kit *motion-reel* (película = función pura del tiempo, springs,
música y SFX sintetizados a 120 BPM, mezcla a −14 LUFS).

| Archivo | Uso |
|---|---|
| `renders/16x9.mp4` | 1920×1080, 60 fps: web, YouTube, intro/outro de videos |
| `renders/9x16.mp4` | 1080×1920, 60 fps: Reels, TikTok, Stories |
| `renders/1x1.mp4` | 1080×1080, 60 fps: feed de Instagram/LinkedIn |
| `renders/poster_*.jpg` | último fotograma (lockup) |

## Qué pasa
1. **0–0.5 s** Un punto amarillo cae sobre fondo tinta y aterriza con squash.
2. **0.5–1.0 s** Se estira en la banda amarilla del sitio, se inclina −7.5° y se despliega en el cuadrado del logo.
3. **1.0–1.5 s** La S se dibuja y se rellena de abajo arriba; un iris crema se abre desde el cuadrado.
4. **1.5–2.5 s** La cámara retrocede; "sacha" y "market" suben letra por letra; el cuadrado lanza el punto final a su lugar.
5. **2.5–4.4 s** "DE ESTUDIANTES, PARA ESTUDIANTES", un pequeño cabeceo del cuadrado y el subrayado del sitio.

El logo es el real: `sacha-market-logo.webp` vectorizado con potrace (`tools/vectorize.py` → `film/logo.js`), cada pieza
por separado, y dibujado en canvas cada fotograma para que el render sea determinista.

## Volver a renderizar
```sh
python3 tools/vectorize.py assets/brand/sacha-market-logo.webp film   # solo si cambia el logo
node scripts/sync.mjs && python3 scripts/music.py && node scripts/sfx.mjs && python3 scripts/mix.py
node scripts/render.mjs --all
```
