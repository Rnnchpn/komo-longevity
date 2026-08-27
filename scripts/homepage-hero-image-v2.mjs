import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const site = join(root, 'site');
const source = join(root, 'src', 'assets', 'images', 'komo-case-hero-20260827.webp');
const targetDir = join(site, 'assets', 'images');
const target = join(targetDir, 'komo-case-hero-20260827.webp');
const publicSrc = '/assets/images/komo-case-hero-20260827.webp';

await mkdir(targetDir, { recursive: true });
await copyFile(source, target);

const pages = [join(site, 'fr', 'index.html'), join(site, 'index.html'), join(site, 'es', 'index.html')];

for (const file of pages) {
  let html = await readFile(file, 'utf8');
  html = html.replace(/(<figure class="kpf-visual"[\s\S]*?<img\b[^>]*\bsrc=")[^"]+("[^>]*>)/i, `$1${publicSrc}$2`);
  html = html.replace(/<div class="kps-login"[\s\S]*?<\/div>/i, '');
  html = html.replace(/(<figure class="kpf-visual"[\s\S]*?<img\b[^>]*\balt=")[^"]*(")/i, '$1KŌMØ Case — six capteurs et interface KŌMØ Pulse$2');
  await writeFile(file, html);
  console.log(`[homepage-hero-image-v2] updated ${file}`);
}
