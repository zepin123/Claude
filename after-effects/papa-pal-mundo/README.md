# PAPA PAL MUNDO — Título animado (After Effects)

- `PapaPalMundo_Titulo.jsx`: script que arma la animación completa en After Effects.
- `titulo_referencia.png`: tu diseño en PNG, porque AE no importa `.webp`.
- `preview.mp4`: vista previa aproximada renderizada sin AE.
- `preview_render.py`: script que genera esa vista previa.

## Cómo usarlo

1. En After Effects ve a **Archivo › Scripts › Ejecutar archivo de script…** y elige `PapaPalMundo_Titulo.jsx`.
2. Cuando te pida una imagen:
   - **Elige `titulo_referencia.png`** (o tu PNG/PSD original sobre negro) para animar tu diseño tal cual. Esto se llama **modo imagen**.
   - **Pulsa Cancelar** para que lo construya con **texto editable** y una textura de fuego procedural (**modo texto**). Antes cambia `FONT` al inicio del script por el nombre PostScript de tu tipografía.
3. Se abre la comp `PAPA PAL MUNDO - Titulo` (1920×1080, 24 fps, 10 s). Renderízala desde la cola de procesamiento o desde Media Encoder.

## Línea de tiempo

| Tiempo | Qué pasa |
|---|---|
| 0.0–0.6 s | Negro |
| 0.6 s | **PAPA** se enciende con parpadeo de tubo, pasando de desenfocado a nítido y de 118 % a 100 % |
| 2.1 s | Entra **PAL** |
| 2.5 s | Se enciende **MUNDO**, que sube desde abajo |
| 3–8.6 s | El brillo "respira", hay distorsión de calor sutil, grano de película, viñeta, un empuje lento de cámara y un leve movimiento de cámara en mano |
| 8.6–9.8 s | Salida con parpadeo y desenfoque a negro |

## Ajustes rápidos (al inicio del .jsx)

- `LETTERBOX = true`: agrega barras de cine 2.39:1.
- `HEAT_HAZE = false`: quita la distorsión de calor.
- `LINES`: aquí cambias los tiempos, la escala inicial y el desenfoque de cada palabra.
- `COL_SHADOW / COL_MID / COL_HIGH`: los colores del fuego en modo texto.

En la comp se puede ajustar todo: los keyframes están en la precomp `TITULO_lineas`, y el brillo y el calor en la capa de ajuste `FX Brillo y calor`.
