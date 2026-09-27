"""Vista previa aproximada de la animación del .jsx (modo imagen), sin After Effects.

Uso: pip install pillow numpy imageio-ffmpeg && python preview_render.py
Genera preview.mp4 (1280x720, 24 fps, 10 s).
"""
import math
import random
import subprocess

import imageio_ffmpeg
import numpy as np
from PIL import Image, ImageFilter

W, H, FPS, DUR = 1280, 720, 24, 10
OUT_START, OUT_DUR = 8.6, 1.2
LINES = [  # mismos tiempos y recortes que el .jsx
    dict(tIn=0.6, dur=2.0, scaleFrom=1.18, blurFrom=80, yFrom=-10, crop=(0.00, 0.145, 1.00, 0.458)),
    dict(tIn=2.1, dur=1.0, scaleFrom=1.35, blurFrom=30, yFrom=0, crop=(0.40, 0.458, 0.61, 0.542)),
    dict(tIn=2.5, dur=2.0, scaleFrom=1.18, blurFrom=80, yFrom=12, crop=(0.00, 0.542, 1.00, 0.860)),
]
K = W / 1920  # escala de píxeles respecto a 1080p


def ease(p):
    p = min(max(p, 0.0), 1.0)
    return p * p * (3 - 2 * p)


def ease_out(p):
    p = min(max(p, 0.0), 1.0)
    return 1 - (1 - p) ** 3


def keyed(t, keys):
    """Interpola [(t, v), ...] con ease-out."""
    if t <= keys[0][0]:
        return keys[0][1]
    for (t0, v0), (t1, v1) in zip(keys, keys[1:]):
        if t <= t1:
            return v0 + (v1 - v0) * ease_out((t - t0) / (t1 - t0))
    return keys[-1][1]


def flicker(t, idx, tIn, dur):
    r = random.Random(idx * 1000 + int(t * FPS)).random()
    v = 0.0
    if tIn <= t < OUT_START:
        p = min(max((t - tIn) / dur, 0), 1)
        v = ease(p)
        if p < 1 and r > p * 0.85 + 0.25:
            v *= 0.15
    elif t >= OUT_START:
        q = min(max((t - OUT_START) / OUT_DUR, 0), 1)
        v = 1 - ease(q)
        if q > 0 and r < q * 0.6:
            v *= 0.2
    return v


src = Image.open("titulo_referencia.png").convert("RGB").resize((W, H), Image.LANCZOS)
arr = np.asarray(src).astype(np.float32) / 255
rgba = np.dstack([arr, arr[:, :, 0]])  # alfa desde el canal rojo
slices = []
for L in LINES:
    x0, y0, x1, y1 = L["crop"]
    box = (int(x0 * W), int(y0 * H), int(x1 * W), int(y1 * H))
    piece = Image.fromarray((rgba[box[1]:box[3], box[0]:box[2]] * 255).astype(np.uint8), "RGBA")
    slices.append((piece, ((box[0] + box[2]) / 2, (box[1] + box[3]) / 2)))

yy, xx = np.mgrid[0:H, 0:W]
d = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
vignette = (1 - 0.7 * np.clip((d - 0.55) / 0.75, 0, 1))[..., None]

ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
proc = subprocess.Popen(
    [ffmpeg, "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
     "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "28", "-preset", "slow", "preview.mp4"],
    stdin=subprocess.PIPE,
)
rng = np.random.default_rng(1)
for f in range(FPS * DUR):
    t = f / FPS
    frame = Image.new("RGBA", (W, H), (0, 0, 0, 255))
    for i, (L, (piece, (cx, cy))) in enumerate(zip(LINES, slices)):
        op = flicker(t, i + 1, L["tIn"], L["dur"] * 0.8)
        if op <= 0.001:
            continue
        tEnd = L["tIn"] + L["dur"]
        s = keyed(t, [(L["tIn"], L["scaleFrom"]), (tEnd, 1.0), (OUT_START, 1.0), (OUT_START + OUT_DUR, 1.06)])
        blur = keyed(t, [(L["tIn"], L["blurFrom"]), (tEnd, 0.0), (OUT_START, 0.0), (OUT_START + OUT_DUR, 45)]) * K
        dy = keyed(t, [(L["tIn"], L["yFrom"]), (tEnd, 0.0)]) * K
        pw, ph = max(1, int(piece.width * s)), max(1, int(piece.height * s))
        p = piece.resize((pw, ph), Image.BILINEAR)
        pad = int(blur * 2) + 2
        canvas = Image.new("RGBA", (pw + 2 * pad, ph + 2 * pad), (0, 0, 0, 0))
        canvas.paste(p, (pad, pad))
        if blur > 0.3:
            canvas = canvas.filter(ImageFilter.GaussianBlur(blur / 2))
        a = np.asarray(canvas).astype(np.float32)
        a[:, :, 3] *= op
        canvas = Image.fromarray(a.astype(np.uint8), "RGBA")
        frame.alpha_composite(canvas, (int(cx - canvas.width / 2), int(cy + dy - canvas.height / 2)))

    # empuje lento de cámara + cámara en mano
    push = 1 + 0.06 * ease(t / DUR)
    sx = 2.5 * K * math.sin(t * 1.3) + 1.5 * K * math.sin(t * 2.9 + 1)
    sy = 2.5 * K * math.sin(t * 1.1 + 2) + 1.5 * K * math.sin(t * 3.3)
    frame = frame.convert("RGB").transform(
        (W, H), Image.AFFINE,
        (1 / push, 0, W / 2 - W / 2 / push - sx, 0, 1 / push, H / 2 - H / 2 / push - sy), Image.BILINEAR)

    base = np.asarray(frame).astype(np.float32) / 255
    gi = keyed(t, [(0.6, 0.4), (1.4, 2.0), (2.6, 1.1), (2.9, 1.8), (4.5, 1.0), (OUT_START, 1.0), (OUT_START + OUT_DUR, 2.2)])
    gi *= 1 + 0.15 * math.sin(t * 2.5 * 2.1) * math.cos(t * 1.7)
    bright = np.clip(base - 0.35, 0, 1) / 0.65
    glow = np.asarray(Image.fromarray((bright * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(45 * K))) / 255
    tight = np.asarray(Image.fromarray((bright * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(7 * K))) / 255
    out = 1 - (1 - base) * (1 - glow * gi * 0.9) * (1 - tight * 0.6)
    out = out * vignette
    out += rng.normal(0, 0.02, (H, W, 1))
    proc.stdin.write((np.clip(out, 0, 1) * 255).astype(np.uint8).tobytes())

proc.stdin.close()
proc.wait()
print("preview.mp4 listo")
