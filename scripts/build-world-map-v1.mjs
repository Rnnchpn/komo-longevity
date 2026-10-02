import { mkdir, copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const source = resolve(root, 'src/world/index.html');
const outDir = resolve(root, 'site/world');
await mkdir(outDir, { recursive: true });
await copyFile(source, resolve(outDir, 'index.html'));
console.log('[world-map-v1] built KŌMØ World member map — legacy 3D runtime not shipped');
