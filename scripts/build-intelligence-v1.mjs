import { mkdir, copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const source = resolve(root, 'src/intelligence/index.html');
const outDir = resolve(root, 'site/intelligence');
await mkdir(outDir, { recursive: true });
await copyFile(source, resolve(outDir, 'index.html'));
console.log('[intelligence-v1] built KŌMØ Intelligence Service');
