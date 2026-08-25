import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(root, 'pulse-app');
const target = join(root, 'site', 'pulse-v12');

await mkdir(target, { recursive: true });
await cp(source, target, { recursive: true });

// Product wording only: keep the validated visual design and replace the
// ambiguous member-facing term "Parcours" with the clearer "Programme".
for (const relativePath of ['index.html', 'app.js']) {
  const filePath = join(target, relativePath);
  let content = await readFile(filePath, 'utf8');
  content = content.replaceAll('Parcours', 'Programme').replaceAll('parcours', 'programme');
  await writeFile(filePath, content, 'utf8');
}

console.log('[pulse-v12] standalone app copied to /pulse-v12/; wording: Parcours → Programme');
