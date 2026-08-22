import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = join(root,'site','assets','media','index.html');

try {
  let html = await readFile(path,'utf8');
  if (!html.includes('id="library-hero-actions"')) {
    const marker = '<p class="lead">KŌMØ Library réunit articles, vidéos, revues et perspectives scientifiques sur la marche, le muscle, l’équilibre, la posture, la biomécanique et la longévité locomotrice.</p>';
    const actions = '<div class="hero-actions-library" id="library-hero-actions"><a class="hero-action-library" href="/fr/check/">Faire le KŌMØ Check →</a><a class="hero-action-library secondary" href="#newsletter">Recevoir KŌMØ Review</a></div>';
    html = html.replace(marker, marker + actions);
    await writeFile(path,html,'utf8');
  }
  console.log('[library-hero-fix] Library hero CTAs ready.');
} catch (e) {
  console.warn('[library-hero-fix]',e.message);
}
