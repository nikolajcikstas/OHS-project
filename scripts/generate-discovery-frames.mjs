import { execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const videoPath = path.join(root, '..', 'ohs_project', 'media', 'videos', 'test_video.mp4');
const outDir = path.join(root, 'public', 'assets', 'frames', 'discovery');

const COUNT = 61;
/** 0.5 fps = 1 кадр каждые 2 с, как в ohs_project при frame_skip≈10 */
const FPS = 0.5;

function toDockerPath(winPath) {
  return winPath.replace(/\\/g, '/');
}

async function cleanOutputDir() {
  await fs.mkdir(outDir, { recursive: true });
  const entries = await fs.readdir(outDir);
  await Promise.all(
    entries
      .filter((name) => /^frame-\d+\.jpg$/i.test(name))
      .map((name) => fs.unlink(path.join(outDir, name))),
  );
}

function extractWithDockerFfmpeg() {
  const video = toDockerPath(videoPath);
  const out = toDockerPath(outDir);
  const vf = `fps=${FPS},scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2`;

  const cmd = [
    'docker run --rm',
    `-v "${video}:/in/video.mp4:ro"`,
    `-v "${out}:/out"`,
    'jrottenberg/ffmpeg:4.1-alpine',
    '-y -i /in/video.mp4',
    `-vf "${vf}"`,
    `-start_number 0 -frames:v ${COUNT}`,
    '/out/frame-%03d.jpg',
  ].join(' ');

  execSync(cmd, { stdio: 'inherit' });
}

async function main() {
  try {
    await fs.access(videoPath);
  } catch {
    throw new Error(`Video not found: ${videoPath}`);
  }

  await cleanOutputDir();
  extractWithDockerFfmpeg();

  const files = (await fs.readdir(outDir)).filter((f) => f.endsWith('.jpg')).sort();
  console.log(`Extracted ${files.length} sequential frames from ${videoPath}`);
  console.log(`Output: ${outDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
