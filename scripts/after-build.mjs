import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(root, 'src', 'assets', 'check', 'index.html');
const targets = [
  join(root, 'site', 'check', 'index.html'),
  join(root, 'site', 'fr', 'check', 'index.html')
];

for (const target of targets) {
  await mkdir(dirname(target), { recursive: true });
  await copyFile(source, target);
  let html = await readFile(target, 'utf8');
  html = html
    .replace('<title>KŌMØ Check — GLFS-25</title>', '<title>KŌMØ Check — Complete Locomotor Function Check</title>')
    .replace('KŌMØ Check: complete the GLFS-25 online and receive your locomotor function score immediately, without sign-up.', 'KŌMØ Check combines GLFS-25, Stand-Up Test and Two-Step Test to provide an immediate overall locomotive syndrome stage, without sign-up.')
    .replace('</body>', '<script defer src="/assets/check/complete.js?v=20260821-1"></script>\n</body>');
  await writeFile(target, html);
}

console.log('Applied complete KŌMØ Check with GLFS-25, Stand-Up and Two-Step tests.');
