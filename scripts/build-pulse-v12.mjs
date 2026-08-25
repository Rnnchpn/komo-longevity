import { cp, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(root, 'pulse-app');
const target = join(root, 'site', 'pulse-v12');

await mkdir(target, { recursive: true });
await cp(source, target, { recursive: true });
console.log('[pulse-v12] standalone app copied to /pulse-v12/');
