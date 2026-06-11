/**
 * Загрузка структуры и комментариев из двух файлов Figma.
 * Токены — только через env, не коммитить в репозиторий.
 *
 * FIGMA_TOKEN_VIDEOANALYTICS — Видеоаналитика (P7JaihGhp6ELYWg00bF3mA)
 * FIGMA_TOKEN_BN_UI — BN-UI v1.0 (KrllB577QgRBqmx3RYgEWU)
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const FILES = [
  {
    key: 'P7JaihGhp6ELYWg00bF3mA',
    tokenEnv: 'FIGMA_TOKEN_VIDEOANALYTICS',
    outFile: 'figma-videoanalitika.json',
    commentsFile: 'figma-videoanalitika-comments.json',
    nodes: ['586:6181'],
  },
  {
    key: 'KrllB577QgRBqmx3RYgEWU',
    tokenEnv: 'FIGMA_TOKEN_BN_UI',
    outFile: 'figma-bn-ui.json',
    commentsFile: 'figma-bn-ui-comments.json',
    nodes: ['455:14987'],
  },
];

async function fetchJson(url, token) {
  const res = await fetch(url, { headers: { 'X-Figma-Token': token } });
  const json = await res.json();
  if (!res.ok) throw new Error(`${url}: ${JSON.stringify(json)}`);
  return json;
}

async function main() {
  for (const file of FILES) {
    const token = process.env[file.tokenEnv];
    if (!token) {
      console.warn(`Skip ${file.key}: set ${file.tokenEnv}`);
      continue;
    }

    const nodes = file.nodes.join(',');
    const [fileJson, commentsJson, nodesJson] = await Promise.all([
      fetchJson(`https://api.figma.com/v1/files/${file.key}?depth=2`, token),
      fetchJson(`https://api.figma.com/v1/files/${file.key}/comments`, token),
      fetchJson(`https://api.figma.com/v1/files/${file.key}/nodes?ids=${encodeURIComponent(nodes)}&depth=6`, token),
    ]);

    await fs.writeFile(path.join(root, file.outFile), JSON.stringify(fileJson, null, 2));
    await fs.writeFile(path.join(root, file.commentsFile), JSON.stringify(commentsJson, null, 2));
    await fs.writeFile(path.join(root, file.outFile.replace('.json', '-nodes.json')), JSON.stringify(nodesJson, null, 2));

    console.log(`Saved ${file.outFile}, ${file.commentsFile}`);
    for (const c of commentsJson.comments ?? []) {
      console.log(`  [${c.user?.handle}] ${c.message}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
