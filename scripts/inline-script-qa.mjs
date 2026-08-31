import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const site = resolve(process.argv[2] ?? join(root, 'site'));
const failures = [];

async function listHtmlFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listHtmlFiles(path));
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(path);
  }
  return files;
}

const files = await listHtmlFiles(site);

for (const file of files) {
  const html = await readFile(file, 'utf8');
  const scripts = html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi);
  let index = 0;

  for (const match of scripts) {
    index += 1;
    const attributes = match[1];
    const source = match[2].trim();
    if (!source || /\bsrc\s*=/i.test(attributes)) continue;

    const typeMatch = attributes.match(/\btype\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const type = typeMatch?.slice(1).find(Boolean)?.toLowerCase() ?? '';
    if (type && !['text/javascript', 'application/javascript'].includes(type)) continue;

    try {
      new Script(source, { filename: `${relative(site, file)}#inline-script-${index}` });
    } catch (error) {
      failures.push(`${relative(site, file)} (script ${index}): ${error.message.split('\n')[0]}`);
    }
  }
}

if (failures.length) {
  console.error('[inline-script-qa] FAILED');
  failures.forEach((failure) => console.error(` - ${failure}`));
  process.exit(1);
}

console.log(`[inline-script-qa] ${files.length} final HTML files passed inline JavaScript syntax checks.`);
