import { cp, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(root, 'life-app');
const target = join(root, 'site', 'life-v1');

await mkdir(target, { recursive: true });
await cp(source, target, { recursive: true });
console.log('[life-v1] standalone storefront copied to /life-v1/');

// Public professional enquiry pages are patched after the core site has been
// generated so all existing /contact/ CTAs keep the same route.
await import('./professional-contact-v1.mjs');
