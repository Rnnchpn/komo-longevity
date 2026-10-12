// Build the private KŌMØ Operations prototype as a separate static surface.
// Runs after all public-site rewrites to avoid changing the existing homepage or Pulse.
import { cp, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(root, 'src', 'pilotage');
const output = join(root, 'site', 'Pilotage');

await mkdir(output, { recursive: true });
await cp(source, output, { recursive: true, force: true });
console.log('[pilotage] /Pilotage/ private prototype assets copied');
