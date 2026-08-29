import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const site = join(process.cwd(), 'site');
const pages = [
  {
    path: 'key/index.html',
    anchor: 'data',
    eyebrow: 'KŌMØ KEY · EVERYDAY FOLLOW-UP',
    title: 'Your assessment is one day.<br><em>Your health is every day.</em>',
    lead: 'KŌMØ KEY follows what happens in between — movement by day, recovery by night, and change over time in Pulse.',
    stats: [
      ['20+', 'METRICS', 'Movement · sleep · recovery'],
      ['24H', 'ONE CONTINUOUS CYCLE', 'Day → night'],
      ['3', 'WAYS TO CARRY', 'Pocket · belt · key dock'],
      ['1', 'TRAJECTORY', 'KŌMØ Pulse']
    ],
    groups: [
      ['MOVE', 'Steps · distance · active time · cadence · movement patterns'],
      ['RECOVER', 'Sleep · resting heart rate · SpO₂ · stress · recovery'],
      ['EVOLVE', '7 days · 30 days · 90 days · since your last KŌMØ Motion']
    ],
    note: '20+ refers to compatible measurements and derived follow-up indicators available across the connected ecosystem. Availability depends on device, wear mode and data quality.'
  },
  {
    path: 'fr/key/index.html',
    anchor: 'data',
    eyebrow: 'KŌMØ KEY · SUIVI QUOTIDIEN',
    title: 'Votre bilan dure un jour.<br><em>Votre santé se joue chaque jour.</em>',
    lead: 'KŌMØ KEY suit ce qui se passe entre deux bilans — le mouvement le jour, la récupération la nuit et l’évolution dans le temps dans Pulse.',
    stats: [
      ['20+', 'INDICATEURS', 'Mouvement · sommeil · récupération'],
      ['24H', 'UN CYCLE CONTINU', 'Jour → nuit'],
      ['3', 'MODES DE PORT', 'Poche · ceinture · Key Dock'],
      ['1', 'TRAJECTOIRE', 'KŌMØ Pulse']
    ],
    groups: [
      ['MOVE', 'Pas · distance · temps actif · cadence · profils de mouvement'],
      ['RECOVER', 'Sommeil · fréquence cardiaque au repos · SpO₂ · stress · récupération'],
      ['EVOLVE', '7 jours · 30 jours · 90 jours · depuis votre dernier KŌMØ Motion']
    ],
    note: '20+ désigne les mesures compatibles et les indicateurs de suivi dérivés disponibles dans l’écosystème connecté. Leur disponibilité dépend du dispositif, du mode de port et de la qualité des données.'
  },
  {
    path: 'es/key/index.html',
    anchor: 'data',
    eyebrow: 'KŌMØ KEY · SEGUIMIENTO DIARIO',
    title: 'Tu evaluación dura un día.<br><em>Tu salud cambia cada día.</em>',
    lead: 'KŌMØ KEY sigue lo que ocurre entre evaluaciones — movimiento de día, recuperación de noche y evolución en Pulse.',
    stats: [
      ['20+', 'INDICADORES', 'Movimiento · sueño · recuperación'],
      ['24H', 'UN CICLO CONTINUO', 'Día → noche'],
      ['3', 'FORMAS DE LLEVARLO', 'Bolsillo · cinturón · Key Dock'],
      ['1', 'TRAYECTORIA', 'KŌMØ Pulse']
    ],
    groups: [
      ['MOVE', 'Pasos · distancia · tiempo activo · cadencia · patrones de movimiento'],
      ['RECOVER', 'Sueño · frecuencia cardíaca en reposo · SpO₂ · estrés · recuperación'],
      ['EVOLVE', '7 días · 30 días · 90 días · desde tu último KŌMØ Motion']
    ],
    note: '20+ se refiere a mediciones compatibles e indicadores derivados de seguimiento disponibles en el ecosistema conectado. La disponibilidad depende del dispositivo, el modo de uso y la calidad de los datos.'
  }
];

const css = `<style id="komo-key-marketing-v1">
.key-proof{padding:clamp(86px,10vw,142px) 0;border-top:1px solid rgba(255,255,255,.1);background:linear-gradient(180deg,#080909 0%,#0c0f0d 100%)}
.key-proof__head{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(280px,.75fr);gap:clamp(42px,8vw,120px);align-items:end}
.key-proof__eyebrow{display:block;margin-bottom:22px;color:#ded0b9;font-size:8px;font-weight:850;letter-spacing:.18em;text-transform:uppercase}
.key-proof h2{margin:0;color:#f4f1e9;font-size:clamp(48px,6vw,84px);font-weight:650;line-height:.92;letter-spacing:-.065em}
.key-proof h2 em{font-style:normal;color:#91aa9f}
.key-proof__lead{margin:0;color:rgba(255,255,255,.58);font-size:16px;line-height:1.65}
.key-proof__stats{display:grid;grid-template-columns:repeat(4,1fr);margin-top:clamp(54px,7vw,92px);border-top:1px solid rgba(255,255,255,.24);border-bottom:1px solid rgba(255,255,255,.12)}
.key-proof__stat{min-height:220px;padding:28px 26px;border-right:1px solid rgba(255,255,255,.1)}
.key-proof__stat:last-child{border-right:0}
.key-proof__number{display:block;color:#f4f1e9;font-size:clamp(56px,6vw,86px);font-weight:650;line-height:.9;letter-spacing:-.065em}
.key-proof__label{display:block;margin-top:42px;color:#ded0b9;font-size:7px;font-weight:850;letter-spacing:.16em;text-transform:uppercase}
.key-proof__sub{display:block;margin-top:9px;color:rgba(255,255,255,.45);font-size:11px;line-height:1.45}
.key-proof__groups{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:14px}
.key-proof__group{padding:24px 25px 27px;border:1px solid rgba(255,255,255,.09);border-radius:22px;background:rgba(255,255,255,.025)}
.key-proof__group b{display:block;color:#91aa9f;font-size:8px;letter-spacing:.18em}
.key-proof__group p{margin:34px 0 0;color:rgba(255,255,255,.61);font-size:12px;line-height:1.65}
.key-proof__note{margin:18px 0 0;max-width:820px;color:rgba(255,255,255,.34);font-size:9px;line-height:1.55}
@media(max-width:900px){.key-proof__head{grid-template-columns:1fr}.key-proof__stats{grid-template-columns:1fr 1fr}.key-proof__stat:nth-child(2){border-right:0}.key-proof__stat:nth-child(-n+2){border-bottom:1px solid rgba(255,255,255,.1)}.key-proof__groups{grid-template-columns:1fr}}
@media(max-width:600px){.key-proof{padding:72px 0}.key-proof h2{font-size:43px}.key-proof__stats{grid-template-columns:1fr 1fr}.key-proof__stat{min-height:170px;padding:22px 14px}.key-proof__number{font-size:52px}.key-proof__label{margin-top:30px}.key-proof__sub{font-size:9px}.key-proof__group{border-radius:18px;padding:20px}.key-proof__group p{margin-top:22px}}
</style>`;

for (const p of pages) {
  const fp = join(site, p.path);
  let html = await readFile(fp, 'utf8');
  if (html.includes('data-komo-key-marketing-v1')) continue;
  html = html.replace('</head>', `${css}</head>`);
  const statHtml = p.stats.map(([number,label,sub]) => `<div class="key-proof__stat"><strong class="key-proof__number">${number}</strong><span class="key-proof__label">${label}</span><span class="key-proof__sub">${sub}</span></div>`).join('');
  const groupHtml = p.groups.map(([name,text]) => `<article class="key-proof__group"><b>${name}</b><p>${text}</p></article>`).join('');
  const section = `<section class="key-proof" data-komo-key-marketing-v1><div class="shell"><div class="key-proof__head"><div><span class="key-proof__eyebrow">${p.eyebrow}</span><h2>${p.title}</h2></div><p class="key-proof__lead">${p.lead}</p></div><div class="key-proof__stats">${statHtml}</div><div class="key-proof__groups">${groupHtml}</div><p class="key-proof__note">${p.note}</p></div></section>`;
  const marker = `<section class="section" id="${p.anchor}">`;
  if (!html.includes(marker)) throw new Error(`[komo-key-marketing-v1] marker missing in ${p.path}`);
  html = html.replace(marker, `${section}${marker}`);
  await writeFile(fp, html, 'utf8');
}

console.log('[komo-key-marketing-v1] 20+ metrics marketing story added');
