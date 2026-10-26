import {readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';

const path=join(process.cwd(),'site','parcours','index.html');
let html=await readFile(path,'utf8');
const acuity='https://app.acuityscheduling.com/schedule.php?owner=40696577';
const cannes='mailto:contact@komolongevity.com?subject=Consultation%20KOMO%20Motion%20-%20Cannes';
if(!html.includes(acuity))throw new Error('KŌMØ Paris Acuity entrypoint missing');

const style=\`<style id="komo-public-two-consultations">
#consultations{scroll-margin-top:95px;margin:68px 0 15px}
#consultations .tc-head{max-width:720px;margin-bottom:22px}
#consultations .tc-head h2{font:550 clamp(34px,4vw,52px)/1.1 Manrope,sans-serif;letter-spacing:-.055em;margin:10px 0 17px}
#consultations .tc-head p{font-size:14px;color:#66776b;line-height:1.75}
#consultations .tc-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
#consultations .tc-card{display:flex;flex-direction:column;align-items:flex-start;min-height:265px;padding:clamp(26px,3vw,37px);background:#fdfef8;border:1px solid #dfe8df;border-radius:24px;box-shadow:0 12px 31px rgba(35,70,41,.04);transition:transform .4s cubic-bezier(.22,1,.36,1),box-shadow .4s}
#consultations .tc-card:hover{transform:translateY(-5px);box-shadow:0 22px 50px rgba(35,70,41,.09)}
#consultations .tc-label{font-size:11px;font-weight:800;letter-spacing:.16em;color:#65846d;text-transform:uppercase}
#consultations .tc-card h3{font:550 clamp(25px,3vw,34px)/1.15 Manrope;margin:16px 0 10px;letter-spacing:-.04em}
#consultations .tc-card p{color:#66776b;line-height:1.7;font-size:13px}
#consultations .tc-card .button{margin-top:auto}
#consultations .tc-card.cannes{background:#eeefe7}
#consultations .tc-explainer{font-size:12px;line-height:1.7;color:#69776c;margin:16px 0 0}
@media(max-width:720px){#consultations{margin-top:55px}#consultations .tc-list{grid-template-columns:1fr}#consultations .tc-card{min-height:220px}}
@media(prefers-reduced-motion:reduce){#consultations .tc-card{transition:none}#consultations .tc-card:hover{transform:none}}
</style>\`;
const section=\`<section id="consultations" aria-label="Les deux consultations KŌMØ"><div class="tc-head"><span class="label">CHOISIR VOTRE LIEU</span><h2>Deux consultations.<br>Une seule expérience KŌMØ.</h2><p>Choisissez entre nos deux destinations. Aucun autre établissement n'est proposé à la réservation depuis ce parcours.</p></div>
<div class="tc-list">
<article class="tc-card paris"><span class="tc-label">01 · PARIS</span><h3>Consultation Paris — Centré</h3><p>Réservez un bilan KŌMØ Motion Initial, Suivi ou Advanced sur le calendrier Centré Paris × KŌMØ.</p><a class="button" href="\${acuity}" target="_blank" rel="noopener noreferrer">Choisir mon créneau à Paris →</a></article>
<article class="tc-card cannes"><span class="tc-label">02 · CANNES</span><h3>Consultation Cannes</h3><p>Demandez un rendez-vous KŌMØ Motion sur la Riviera. Le calendrier en ligne dédié à Cannes sera activé dès sa configuration.</p><a class="button" href="\${cannes}">Demander un rendez-vous à Cannes →</a></article>
</div><p class="tc-explainer">La réservation parisienne s'effectue sur Acuity. La confirmation et l'association au dossier Pulse ne sont pas encore automatisées. Le calendrier Cannes est à ouvrir séparément.</p></section>\`;
html=html.replaceAll(\`href="\${acuity}"\`, 'href="#consultations"');
const marker='<section class="bottom">';
if(!html.includes(marker))throw new Error('Could not find public journey action section');
html=html.replace(marker,section+'\n'+marker);
html=html.replace('</head>',style+'</head>');
await writeFile(path,html,'utf8');
console.log('[komo-two-consultations] public journey offers Paris Centré and Cannes only');
