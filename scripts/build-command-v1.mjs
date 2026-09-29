import { mkdir, copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const source = resolve(root, 'src/command/index.html');
const outDir = resolve(root, 'site/command-v1');
await mkdir(outDir, { recursive: true });
await copyFile(source, resolve(outDir, 'index.html'));
console.log('[command-v1] built private command center');
