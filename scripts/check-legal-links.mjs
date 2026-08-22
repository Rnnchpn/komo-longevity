import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const targets = [
  { path: join(root, 'site', 'check', 'index.html'), medical: '/medical-information/', privacy: '/privacy/', label: 'Medical information & safety', privacyLabel: 'Privacy' },
  { path: join(root, 'site', 'fr', 'check', 'index.html'), medical: '/fr/medical-information/', privacy: '/fr/privacy/', label: 'Informations médicales & sécurité', privacyLabel: 'Confidentialité' }
];

for (const target of targets) {
  let html = await readFile(target.path, 'utf8');
  if (html.includes(target.medical)) continue;
  const legal = `<span><a href="${target.medical}">${target.label}</a> · <a href="${target.privacy}">${target.privacyLabel}</a></span>`;
  html = html.replace('<span>Locomotor function · Prevention · Clinical continuity</span>', legal);
  await writeFile(target.path, html, 'utf8');
}

console.log('[check-legal-links] standalone KŌMØ Check safety and privacy links added.');
