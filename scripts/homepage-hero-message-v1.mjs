import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const file = join(process.cwd(), 'site', 'fr', 'index.html');
let html = await readFile(file, 'utf8');

const oldHero = '<h1>Accédez à la plateforme<br><em>KŌMØ Pulse.</em></h1>';
const newHero = '<h1>Votre mobilité.<br>Votre longévité.<br><em>Un check-up complet, dans une valise.</em></h1>';

if (!html.includes(oldHero) && !html.includes(newHero)) {
  throw new Error('[homepage-hero-message-v1] hero title target not found');
}

html = html.replace(oldHero, newHero);
await writeFile(file, html);
console.log('[homepage-hero-message-v1] French homepage hero updated');
