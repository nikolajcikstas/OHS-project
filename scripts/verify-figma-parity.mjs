/**
 * Сверка текстов макета и правил из комментариев Figma с кодом.
 * Запуск: node scripts/verify-figma-parity.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const srcDir = path.join(root, 'src');

const REQUIRED_UI = [
  'Дата и время',
  'Поступило',
  'Обработать',
  'Статус • Вы',
  'Ожидает обработки',
  'Это нарушение',
  'Это не нарушение',
  'Отправить',
  'Пресеты фильтров',
  'Обнаружения',
];

const COMMENT_RULES = [
  { id: 'L1-date-shows-received', path: 'utils/discoveryPresentation.ts', pattern: /getPrimary: \(d: Discovery\) => d\.receivedAt/ },
  { id: 'L2-no-relative', path: 'utils/discoveryPresentation.ts', pattern: /showRelative: false/ },
  { id: 'hide-status-L2L3', path: 'utils/discoveryPresentation.ts', pattern: /showStatusColumn/ },
  { id: 'submit-disabled', path: 'components/StatusTimeline.tsx', pattern: /disabled=\{!choice\}/ },
  { id: 'buffered-frames', path: 'components/BufferedFrameImage.tsx', pattern: /onload/ },
];

function readAllSrc() {
  const chunks = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (/\.(tsx?|css)$/.test(entry.name)) chunks.push(fs.readFileSync(p, 'utf8'));
    }
  }
  walk(srcDir);
  return chunks.join('\n');
}

function main() {
  const src = readAllSrc();
  let failed = 0;

  console.log('=== Figma UI strings in code ===');
  for (const text of REQUIRED_UI) {
    const ok = src.includes(text);
    console.log(`${ok ? '✓' : '✗'} ${text}`);
    if (!ok) failed += 1;
  }

  console.log('\n=== Comment rules in code ===');
  for (const rule of COMMENT_RULES) {
    const content = fs.readFileSync(path.join(srcDir, rule.path), 'utf8');
    const ok = rule.pattern.test(content);
    console.log(`${ok ? '✓' : '✗'} ${rule.id}`);
    if (!ok) failed += 1;
  }

  console.log(failed ? `\nFAILED: ${failed} checks` : '\nAll parity checks passed');
  process.exit(failed ? 1 : 0);
}

main();
