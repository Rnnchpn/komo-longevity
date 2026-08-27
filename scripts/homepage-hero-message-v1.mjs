import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const file = join(process.cwd(), 'site', 'fr', 'index.html');
let html = await readFile(file, 'utf8');

const previousHero = '<h1>Votre mobilité.<br>Votre longévité.<br><em>Un check-up complet, dans une valise.</em></h1>';
const oldHero = '<h1>Accédez à la plateforme<br><em>KŌMØ Pulse.</em></h1>';
const newHero = '<h1>Votre mobilité, mesurée.<br>Votre longévité, <em>mise en mouvement.</em></h1>';
const newLead = '<p class="kpf-lead">Un check-up complet, portable et structuré autour de la KŌMØ Case. Pulse relie votre première évaluation, votre bilan Motion, l’interprétation Clinical et leur évolution dans le temps.</p>';

if (!html.includes(oldHero) && !html.includes(previousHero) && !html.includes(newHero)) {
  throw new Error('[homepage-hero-message-v1] hero title target not found');
}

html = html.replace(oldHero, newHero).replace(previousHero, newHero);
html = html.replace(/<p class="kpf-lead">[\s\S]*?<\/p>/, newLead);
await writeFile(file, html);
console.log('[homepage-hero-message-v1] French homepage hero updated');
