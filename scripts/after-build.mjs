import { copyFile, mkdir } from 'node:fs/promises';
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
}

console.log('Applied authorised GLFS-25 KŌMØ Check overrides.');
