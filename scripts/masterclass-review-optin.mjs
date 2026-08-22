import fs from 'node:fs';
import path from 'node:path';

const candidates = [
  path.resolve('site/assets/masterclass-v2/index.html'),
  path.resolve('site/assets/masterclass-v2.html')
];
const file = candidates.find((candidate) => fs.existsSync(candidate));
if (!file) {
  console.warn('[masterclass] page not found; KŌMØ Review opt-in skipped.');
  process.exit(0);
}

let html = fs.readFileSync(file, 'utf8');
if (html.includes('name="reviewOptIn"')) {
  console.log('[masterclass] KŌMØ Review opt-in already present.');
  process.exit(0);
}

const reviewConsent = '<label class="consent"><input type="checkbox" name="reviewOptIn"><span>Je souhaite recevoir <strong>KŌMØ Review</strong>, la revue scientifique mensuelle consacrée à la longévité locomotrice, à la marche et à la biomécanique. Ce choix est facultatif et peut être retiré à tout moment.</span></label>';
html = html.replace(
  '<label class="consent"><input type="checkbox" name="consent" required>',
  `${reviewConsent}<label class="consent"><input type="checkbox" name="consent" required>`
);
html = html.replace(
  'Le formulaire prépare actuellement un email d’inscription vers contact@komolongevity.com. Aucune donnée de santé n’est demandée.',
  'Le formulaire prépare actuellement un email d’inscription vers contact@komolongevity.com. L’abonnement à KŌMØ Review reste facultatif et séparé de l’inscription à la masterclass.'
);
html = html.replace(
  "`Ville / pays : ${d.get('city')||''}`,'','Merci de me transmettre le lien de connexion.'",
  "`Ville / pays : ${d.get('city')||''}`,`KŌMØ Review : ${d.get('reviewOptIn')?'Oui':'Non'}`,'','Merci de me transmettre le lien de connexion.'"
);
html = html.replace(
  '<a class="contact" href="mailto:contact@komolongevity.com">contact@komolongevity.com</a>',
  '<a class="contact" href="mailto:contact@komolongevity.com">contact@komolongevity.com</a><p><a href="/review" style="font-weight:700">Découvrir KŌMØ Review — Issue 01 ↗</a></p>'
);

fs.writeFileSync(file, html, 'utf8');
console.log(`[masterclass] added KŌMØ Review optional opt-in to ${file}`);
