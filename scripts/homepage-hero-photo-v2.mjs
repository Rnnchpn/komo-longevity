import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const targets = [
  join(process.cwd(), 'site', 'index.html'),
  join(process.cwd(), 'site', 'fr', 'index.html'),
  join(process.cwd(), 'site', 'es', 'index.html')
];

for (const file of targets) {
  let html = await readFile(file, 'utf8');
  html = html.replaceAll('/assets/images/komo-case-score.jpeg', '/assets/images/komo-case-hero-20260827.webp');
  html = html.replace(/<div class="kps-login"[\s\S]*?<\/div>(?=<figcaption)/g, '');
  html = html.replace(/<img src="\/assets\/images\/komo-case-hero-20260827\.webp"[^>]*>/g, '<img src="/assets/images/komo-case-hero-20260827.webp" alt="KŌMØ Case with six sensors and KŌMØ Pulse" width="1122" height="1402" fetchpriority="high" decoding="async">');
  await writeFile(file, html);
}

console.log('[homepage-hero-photo-v2] latest KŌMØ Case hero deployed');
