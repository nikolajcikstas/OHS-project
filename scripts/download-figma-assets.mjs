import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'public', 'assets', 'figma');
const token = process.env.FIGMA_TOKEN;
const fileKey = 'P7JaihGhp6ELYWg00bF3mA';

const exports = {
  'video-frame.png': 'I781:3358;781:2374',
  'video-controls.png': 'I781:3358;781:2390',
  'player-full.png': '781:3358',
  'table-thumb.png': 'I781:3358;781:2374',
  'status-l1.png': '798:11957',
  'status-l2.png': '798:11978',
  'status-l3-eval.png': '798:11930',
  'info-panel.png': '745:1378',
};

async function downloadUrl(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${res.status}: ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(dest, buf);
  console.log('saved', path.basename(dest));
}

async function exportNodes() {
  if (!token) throw new Error('FIGMA_TOKEN env var required');
  await fs.mkdir(outDir, { recursive: true });

  const ids = Object.values(exports).join(',');
  const apiUrl = `https://api.figma.com/v1/images/${fileKey}?ids=${encodeURIComponent(ids)}&format=png&scale=2`;
  const res = await fetch(apiUrl, { headers: { 'X-Figma-Token': token } });
  const json = await res.json();
  if (!res.ok || json.err) throw new Error(JSON.stringify(json));

  for (const [filename, nodeId] of Object.entries(exports)) {
    const url = json.images[nodeId];
    if (!url) {
      console.warn('missing export for', filename, nodeId);
      continue;
    }
    await downloadUrl(url, path.join(outDir, filename));
    await new Promise((r) => setTimeout(r, 300));
  }
}

exportNodes().catch((err) => {
  console.error(err);
  process.exit(1);
});
