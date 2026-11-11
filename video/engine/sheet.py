#!/usr/bin/env python3
"""Contact sheet: 4x2 grid of frames at given times, with time labels.

Usage: python engine/sheet.py <frames_dir> <out.png> <t1,t2,...> [--guides]
--guides draws the text safe area (y 170..1330) in red for checking.
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

FPS = 30
frames_dir, out, times = Path(sys.argv[1]), sys.argv[2], [float(x) for x in sys.argv[3].split(",")]
guides = "--guides" in sys.argv
files = sorted(frames_dir.glob("f*.png"))
tw, th, cols = 360, 640, 4
rows = (len(times) + cols - 1) // cols
sheet = Image.new("RGB", (cols * tw + (cols + 1) * 12, rows * (th + 44) + 12), "#111")
try:
    font = ImageFont.truetype("/usr/share/fonts/truetype/inter/Inter-Bold.ttf", 26)
except OSError:
    font = ImageFont.load_default()
for i, t in enumerate(times):
    f = min(len(files) - 1, int(round(t * FPS)))
    im = Image.open(files[f]).convert("RGB")
    if guides:
        d = ImageDraw.Draw(im)
        for y in (170, 1330):
            d.line([(0, y), (1080, y)], fill="#ff3030", width=4)
        d.line([(24, 0), (24, 1920)], fill="#ff3030", width=2)
        d.line([(1056, 0), (1056, 1920)], fill="#ff3030", width=2)
    im = im.resize((tw, th), Image.LANCZOS)
    x = 12 + (i % cols) * (tw + 12)
    y = 12 + (i // cols) * (th + 44)
    sheet.paste(im, (x, y + 34))
    ImageDraw.Draw(sheet).text((x, y), f"{t:.2f}s  (frame {f})", fill="#E4C471", font=font)
sheet.save(out)
print("sheet:", out)
