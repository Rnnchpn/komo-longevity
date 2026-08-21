import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(root, 'src', 'assets', 'check', 'index.html');
const targets = [
  join(root, 'site', 'assets', 'check', 'index.html'),
  join(root, 'site', 'check', 'index.html'),
  join(root, 'site', 'fr', 'check', 'index.html')
];

const scripts = [
  '<script defer src="/assets/check/complete.js?v=20260821-2"></script>',
  '<script defer src="/assets/check/img-intro.js?v=20260821-seq1"></script>',
  '<script defer src="/assets/check/img-stand.js?v=20260821-seq1"></script>',
  '<script defer src="/assets/check/img-two.js?v=20260821-seq1"></script>',
  '<script defer src="/assets/check/sequential.js?v=20260821-seq1"></script>'
].join('\n');

for (const target of targets) {
  await mkdir(dirname(target), { recursive: true });
  await copyFile(source, target);
  let html = await readFile(target, 'utf8');
  html = html
    .replace('<title>KŌMØ Check — GLFS-25</title>', '<title>KŌMØ Check — Locomotor Prevention</title>')
    .replace('KŌMØ Check: complete the GLFS-25 online and receive your locomotor function score immediately, without sign-up.', 'KŌMØ Check combines GLFS-25, Stand-Up Test and Two-Step Test in a simple sequential prevention journey, with an immediate shareable result.')
    .replace('</body>', `${scripts}\n</body>`);
  await writeFile(target, html, 'utf8');
}

console.log('Applied sequential KŌMØ Check with illustrations and PNG result.');
