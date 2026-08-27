import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const file = join(process.cwd(), 'site', 'fr', 'index.html');
let html = await readFile(file, 'utf8');

const priorHeroA = '<h1>Votre mobilité.<br>Votre longévité.<br><em>Un check-up complet, dans une valise.</em></h1>';
const priorHeroB = '<h1>Votre mobilité, mesurée.<br>Votre longévité, <em>mise en mouvement.</em></h1>';
const priorHeroC = '<h1>Votre mobilité, mesurée.<br>Votre longévité, <em>en mouvement.</em></h1>';
const oldHero = '<h1>Accédez à la plateforme<br><em>KŌMØ Pulse.</em></h1>';
const newHero = '<h1>Votre mobilité, mesurée.<br><em>Votre longévité locomotrice, dans une valise.</em></h1>';
const newLead = '<p class="kpf-lead">Un check-up portable qui réunit les mesures clés de votre mobilité, du mouvement, de la posture et de la fonction musculaire dans un même parcours KŌMØ, puis les suit dans le temps avec Pulse.</p>';

if (!html.includes(oldHero) && !html.includes(priorHeroA) && !html.includes(priorHeroB) && !html.includes(priorHeroC) && !html.includes(newHero)) {
  throw new Error('[homepage-hero-message-v1] hero title target not found');
}

html = html.replace(oldHero, newHero).replace(priorHeroA, newHero).replace(priorHeroB, newHero).replace(priorHeroC, newHero);
html = html.replace(/<p class="kpf-lead">[\s\S]*?<\/p>/, newLead);
await writeFile(file, html);
console.log('[homepage-hero-message-v1] French homepage hero updated');
