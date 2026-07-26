import sys
import argparse
from PIL import Image, ImageEnhance, ImageFilter

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', required=True)
    parser.add_argument('--columns', type=int, required=True)
    parser.add_argument('--rows', type=int, required=True)
    args = parser.parse_args()

    # Load image
    img = Image.open(args.source)

    # Convert transparency to solid white background if RGBA/LA
    if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
        bg = Image.new("RGBA", img.size, (255, 255, 255, 255))
        bg.paste(img, (0, 0), img.convert("RGBA"))
        img = bg.convert("RGB")
    else:
        img = img.convert("RGB")

    # Tight, symmetrical crop centered around subject (X center = 204)
    left = 74
    top = 210
    right = 334
    bottom = 570
    img = img.crop((left, top, right, bottom))

    # Grayscale conversion
    img = img.convert('L')

    # Contrast, Brightness adjustments
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(1.18)
    enhancer = ImageEnhance.Brightness(img)
    img = enhancer.enhance(1.04)

    # Gamma adjustment (approximate gamma=0.96)
    lut = [int(255 * (i / 255.0) ** 0.96) for i in range(256)]
    img = img.point(lut)

    # Unsharp mask (radius=3, percent=35) -> unsharp=3:3:0.35
    img = img.filter(ImageFilter.UnsharpMask(radius=3, percent=35, threshold=3))

    # Resize to columns x rows
    img = img.resize((args.columns, args.rows), Image.Resampling.LANCZOS)

    # Output as PGM P5 format
    sys.stdout.buffer.write(b"P5\n")
    sys.stdout.buffer.write(f"{args.columns} {args.rows}\n".encode('ascii'))
    sys.stdout.buffer.write(b"255\n")
    sys.stdout.buffer.write(img.tobytes())

if __name__ == '__main__':
    main()
