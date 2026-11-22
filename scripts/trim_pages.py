"""Beskjærer hvite marger på sidebildene (beholder litt luft)."""
import sys, os
from PIL import Image, ImageOps
root = sys.argv[1]
n = 0
for d, _, files in os.walk(root):
    for f in files:
        if not f.endswith('.jpg'): continue
        p = os.path.join(d, f)
        im = Image.open(p).convert('RGB')
        g = ImageOps.invert(im.convert('L')).point(lambda v: 255 if v > 40 else 0)
        box = g.getbbox()
        if not box: continue
        pad = 24
        x0, y0, x1, y1 = box
        box = (max(0, x0 - pad), max(0, y0 - pad), min(im.width, x1 + pad), min(im.height, y1 + pad))
        im.crop(box).save(p, quality=75, optimize=True)
        n += 1
print('trimmet', n)
