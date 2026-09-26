"""Tile build/stills/*.jpg into one labelled contact sheet for review."""
import glob, os, sys
from PIL import Image, ImageDraw
files = sorted(glob.glob(os.path.join(os.path.dirname(__file__), '..', 'build', 'stills', '*.jpg')))
cols, w = 2, 900
h = int(w / 2.388)
sheet = Image.new('RGB', (cols * w, ((len(files) + cols - 1) // cols) * (h + 4)), '#222')
for i, f in enumerate(files):
    im = Image.open(f).resize((w, h))
    d = ImageDraw.Draw(im); d.rectangle([0, 0, 70, 20], fill='black'); d.text((4, 4), os.path.basename(f)[1:-4], fill='yellow')
    sheet.paste(im, ((i % cols) * w, (i // cols) * (h + 4)))
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), '..', 'build', 'contact.jpg')
sheet.save(out, quality=85)
print(out)
