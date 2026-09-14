import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(root, 'src', 'riviera-experience');
const targets = [
  join(root, 'site', 'assets', 'riviera-experience'),
  join(root, 'site', 'experience')
];

for (const target of targets) {
  await rm(target, { recursive: true, force: true });
  await mkdir(dirname(target), { recursive: true });
  await cp(source, target, { recursive: true });
}

console.log('[riviera-experience] copied isolated experience assets and public route');
