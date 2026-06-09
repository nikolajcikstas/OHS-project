import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const source = path.join(root, 'public', 'assets', 'figma', 'video-frame.png');
const outDir = path.join(root, 'public', 'assets', 'frames', 'discovery');

const COUNT = 61;
const OUT_W = 1168;
const OUT_H = 654;
const ZOOM = 1.18;

async function main() {
  await fs.mkdir(outDir, { recursive: true });
  const meta = await sharp(source).metadata();
  const scaledW = Math.round(meta.width * ZOOM);
  const scaledH = Math.round(meta.height * ZOOM);
  const base = await sharp(source).resize(scaledW, scaledH, { fit: 'cover' }).toBuffer();

  const maxLeft = Math.max(0, scaledW - OUT_W);
  const maxTop = Math.max(0, scaledH - OUT_H);

  for (let i = 0; i < COUNT; i += 1) {
    const t = COUNT <= 1 ? 0 : i / (COUNT - 1);
    const left = Math.round(maxLeft * t);
    const top = Math.round(maxTop * 0.5 + Math.sin(i / 6) * Math.min(24, maxTop / 3));
    const modulate = 1 + Math.sin(i / 4) * 0.03;

    await sharp(base)
      .extract({
        left: Math.min(left, maxLeft),
        top: Math.max(0, Math.min(top, maxTop)),
        width: Math.min(OUT_W, scaledW),
        height: Math.min(OUT_H, scaledH),
      })
      .modulate({ brightness: modulate })
      .jpeg({ quality: 84 })
      .toFile(path.join(outDir, `frame-${String(i).padStart(3, '0')}.jpg`));
  }

  console.log(`Generated ${COUNT} frames in ${outDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
