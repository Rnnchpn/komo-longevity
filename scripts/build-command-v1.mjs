import { mkdir, copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const source = resolve(root, 'src/command/index.html');
const crmJs = resolve(root, 'src/command/crm.js');
const crmCss = resolve(root, 'src/command/crm.css');
const outDir = resolve(root, 'site/command-v1');
await mkdir(outDir, { recursive: true });
await copyFile(source, resolve(outDir, 'index.html'));
await copyFile(crmJs, resolve(outDir, 'crm.js'));
await copyFile(crmCss, resolve(outDir, 'crm.css'));
console.log('[command-v1] built private command center');
