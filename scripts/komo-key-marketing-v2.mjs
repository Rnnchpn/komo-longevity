import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const site = join(process.cwd(), 'site');

const pages = [
  {
    path: 'key/index.html',
    eyebrow: 'KŌMØ KEY · RESULTS',
    title: 'One day of data.<br><em>One readable trajectory.</em>',
    lead: 'KEY turns everyday movement, sleep and recovery signals into a longitudinal view in Pulse. The goal is not more numbers — it is seeing change between two assessments.',
    metrics: [
      ['steps', '7,842', 'STEPS', 'daily movement'],
      ['distance', '5.4 km', 'DISTANCE', 'movement volume'],
      ['active', '68 min', 'ACTIVE TIME', 'useful movement'],
      ['sleep', 'Sleep', 'RECOVERY', 'overnight context']
    ],
    trajectoryEyebrow: 'PULSE TRAJECTORY',
    trajectoryTitle: 'From today to trend.',
    nodes: ['Today', '7 days', '30 days', '90 days', 'Pulse'],
    note: 'KEY data contextualise your evolution between assessments. They never modify the clinical Motion Score.',
    unchanged: 'MOTION SCORE · UNCHANGED'
  },
  {
    path: 'fr/key/index.html',
    eyebrow: 'KŌMØ KEY · RENDU DES RÉSULTATS',
    title: 'Une journée de données.<br><em>Une trajectoire lisible.</em>',
    lead: 'KEY transforme les signaux du quotidien — mouvement, sommeil et récupération — en une lecture longitudinale dans Pulse. L’objectif n’est pas d’accumuler des chiffres, mais de voir l’évolution entre deux bilans.',
    metrics: [
      ['steps', '7 842', 'PAS', 'mouvement quotidien'],
      ['distance', '5,4 km', 'DISTANCE', 'volume de déplacement'],
      ['active', '68 min', 'TEMPS ACTIF', 'mouvement utile'],
      ['sleep', 'Sommeil', 'RÉCUPÉRATION', 'contexte nocturne']
    ],
    trajectoryEyebrow: 'TRAJECTOIRE PULSE',
    trajectoryTitle: 'Du jour à la tendance.',
    nodes: ['Aujourd’hui', '7 jours', '30 jours', '90 jours', 'Pulse'],
    note: 'Les données KEY contextualisent votre évolution entre deux bilans. Elles ne modifient jamais le Motion Score clinique.',
    unchanged: 'MOTION SCORE · INCHANGÉ'
  },
  {
    path: 'es/key/index.html',
    eyebrow: 'KŌMØ KEY · RESULTADOS',
    title: 'Un día de datos.<br><em>Una trayectoria legible.</em>',
    lead: 'KEY transforma las señales cotidianas — movimiento, sueño y recuperación — en una lectura longitudinal en Pulse. El objetivo no es acumular cifras, sino ver la evolución entre dos evaluaciones.',
    metrics: [
      ['steps', '7.842', 'PASOS', 'movimiento diario'],
      ['distance', '5,4 km', 'DISTANCIA', 'volumen de movimiento'],
      ['active', '68 min', 'TIEMPO ACTIVO', 'movimiento útil'],
      ['sleep', 'Sueño', 'RECUPERACIÓN', 'contexto nocturno']
    ],
    trajectoryEyebrow: 'TRAYECTORIA PULSE',
    trajectoryTitle: 'Del día a la tendencia.',
    nodes: ['Hoy', '7 días', '30 días', '90 días', 'Pulse'],
    note: 'Los datos de KEY contextualizan tu evolución entre evaluaciones. Nunca modifican el Motion Score clínico.',
    unchanged: 'MOTION SCORE · SIN CAMBIOS'
  }
];

const icons = {
  steps: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.1 4.2c1.45.25 2.27 1.62 2.02 3.22-.3 1.95-1.63 3.5-3.15 3.27-1.52-.23-2.25-1.58-1.95-3.53.25-1.64 1.4-3.25 3.08-2.96Z"/><path d="M15.9 12.2c1.62.24 2.8 1.8 2.55 3.53-.27 1.88-1.65 3.47-3.22 3.24-1.52-.23-2.35-1.65-2.08-3.53.24-1.67 1.17-3.48 2.75-3.24Z"/></svg>`,
  distance: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="17" r="2"/><circle cx="19" cy="7" r="2"/><path d="M7 16c2.2-3.6 4.15-4.2 6.05-2.1C15.1 16.15 16.4 12 17.5 9"/></svg>`,
  active: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.4V12l3.2 2"/><path d="M9.1 2.8h5.8"/></svg>`,
  sleep: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.5 15.2A7.8 7.8 0 0 1 8.8 5.5a7.8 7.8 0 1 0 9.7 9.7Z"/><path d="M14.7 8.2h2.7l-2.7 3h2.7"/></svg>`,
  trajectory: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 16.5 8.2 12l4 2.8 7.9-8"/><circle cx="3.5" cy="16.5" r="1.5"/><circle cx="8.2" cy="12" r="1.5"/><circle cx="12.2" cy="14.8" r="1.5"/><circle cx="20.1" cy="6.8" r="1.5"/></svg>`,
  boundary: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5 19 6v5.3c0 4.25-2.6 7.55-7 9.2-4.4-1.65-7-4.95-7-9.2V6l7-2.5Z"/><path d="m8.8 12 2.1 2.1 4.5-4.6"/></svg>`
};

const css = `<style id="komo-key-marketing-v2">
.key-data-v2{position:relative;padding:clamp(92px,10vw,148px) 0;border-top:1px solid rgba(255,255,255,.1);background:radial-gradient(circle at 83% 18%,rgba(145,170,159,.10),transparent 27%),linear-gradient(180deg,#080909 0%,#0b0e0c 100%);overflow:hidden}
.key-data-v2:before{content:"";position:absolute;width:760px;height:760px;right:-410px;top:-390px;border:1px solid rgba(255,255,255,.045);border-radius:50%;pointer-events:none}
.kd2-head{display:grid;grid-template-columns:minmax(0,1.14fr) minmax(310px,.72fr);gap:clamp(48px,8vw,128px);align-items:end}
.kd2-eyebrow{display:block;margin-bottom:22px;color:#ded0b9;font-size:8px;font-weight:850;letter-spacing:.19em;text-transform:uppercase}
.kd2-head h2{margin:0;max-width:860px;color:#f4f1e9;font-size:clamp(52px,6.2vw,88px);font-weight:650;line-height:.91;letter-spacing:-.068em}
.kd2-head h2 em{font-style:normal;color:#91aa9f}
.kd2-lead{margin:0 0 4px;color:rgba(255,255,255,.58);font-size:15px;line-height:1.68}
.kd2-main{display:grid;grid-template-columns:minmax(0,1.08fr) minmax(390px,.92fr);gap:14px;margin-top:clamp(56px,7vw,92px)}
.kd2-metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.kd2-metric{position:relative;min-height:210px;padding:24px 25px 22px;border:1px solid rgba(255,255,255,.085);border-radius:22px;background:linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.018));overflow:hidden;transition:transform .28s cubic-bezier(.22,1,.36,1),border-color .28s ease,background .28s ease}
.kd2-metric:hover{transform:translateY(-3px);border-color:rgba(222,208,185,.22);background:linear-gradient(145deg,rgba(255,255,255,.062),rgba(255,255,255,.022))}
.kd2-icon{width:38px;height:38px;display:grid;place-items:center;border:1px solid rgba(255,255,255,.1);border-radius:12px;background:rgba(255,255,255,.035);color:#91aa9f}
.kd2-icon svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.55;stroke-linecap:round;stroke-linejoin:round}
.kd2-value{display:block;margin-top:44px;color:#f4f1e9;font-size:clamp(35px,3.5vw,51px);font-weight:620;line-height:.95;letter-spacing:-.058em}
.kd2-label{display:block;margin-top:13px;color:#ded0b9;font-size:7px;font-weight:850;letter-spacing:.17em;text-transform:uppercase}
.kd2-sub{display:block;margin-top:7px;color:rgba(255,255,255,.38);font-size:10px;line-height:1.45}
.kd2-trajectory{position:relative;min-height:430px;padding:29px 30px 27px;border:1px solid rgba(145,170,159,.19);border-radius:24px;background:radial-gradient(circle at 78% 18%,rgba(145,170,159,.15),transparent 30%),#131916;overflow:hidden}
.kd2-trajectory:after{content:"";position:absolute;inset:auto -100px -190px auto;width:440px;height:440px;border:1px solid rgba(145,170,159,.08);border-radius:50%;pointer-events:none}
.kd2-traj-top{position:relative;z-index:2;display:flex;align-items:flex-start;justify-content:space-between;gap:22px}
.kd2-traj-icon{width:42px;height:42px;display:grid;place-items:center;border-radius:13px;background:rgba(145,170,159,.11);color:#a9c0b6}
.kd2-traj-icon svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.55;stroke-linecap:round;stroke-linejoin:round}
.kd2-traj-copy{flex:1}
.kd2-traj-eyebrow{display:block;color:#b9cbbf;font-size:7px;font-weight:850;letter-spacing:.17em;text-transform:uppercase}
.kd2-trajectory h3{margin:12px 0 0;color:#f4f1e9;font-size:clamp(28px,3vw,42px);font-weight:580;line-height:1;letter-spacing:-.052em}
.kd2-chart{position:relative;z-index:2;margin-top:76px;padding:0 2px}
.kd2-chart-line{position:absolute;left:5%;right:5%;top:10px;height:1px;background:linear-gradient(90deg,rgba(222,208,185,.35),rgba(145,170,159,.9));box-shadow:0 0 24px rgba(145,170,159,.12)}
.kd2-nodes{position:relative;display:grid;grid-template-columns:repeat(5,1fr);gap:5px}
.kd2-node{position:relative;padding-top:34px;color:rgba(255,255,255,.4);font-size:8px;font-weight:720;letter-spacing:.08em;text-align:center;text-transform:uppercase}
.kd2-node:before{content:"";position:absolute;top:4px;left:50%;width:12px;height:12px;transform:translateX(-50%);border:2px solid #18201c;border-radius:50%;background:#65766e;box-shadow:0 0 0 1px rgba(255,255,255,.11)}
.kd2-node:first-child:before{background:#ded0b9;box-shadow:0 0 0 5px rgba(222,208,185,.08)}
.kd2-node:last-child{color:#d9e5df}
.kd2-node:last-child:before{background:#91aa9f;box-shadow:0 0 0 6px rgba(145,170,159,.1),0 0 22px rgba(145,170,159,.2)}
.kd2-signal{position:relative;z-index:2;margin-top:58px;height:92px;border-bottom:1px solid rgba(255,255,255,.07);overflow:hidden}
.kd2-signal svg{width:100%;height:100%;fill:none;stroke:#91aa9f;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;opacity:.62}
.kd2-signal .ghost{stroke:rgba(255,255,255,.08);stroke-width:1}
.kd2-boundary{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:18px;align-items:center;margin-top:14px;padding:19px 21px;border:1px solid rgba(255,255,255,.075);border-radius:18px;background:rgba(255,255,255,.018)}
.kd2-boundary-icon{width:36px;height:36px;display:grid;place-items:center;border-radius:11px;background:rgba(222,208,185,.055);color:#ded0b9}
.kd2-boundary-icon svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.55;stroke-linecap:round;stroke-linejoin:round}
.kd2-boundary p{margin:0;max-width:820px;color:rgba(255,255,255,.55);font-size:11px;line-height:1.55}
.kd2-status{padding:8px 10px;border:1px solid rgba(145,170,159,.15);border-radius:999px;color:#9bb2a8;background:rgba(145,170,159,.045);font-size:7px;font-weight:850;letter-spacing:.13em;white-space:nowrap}
@media(prefers-reduced-motion:no-preference){.kd2-head,.kd2-main,.kd2-boundary{animation:kd2-rise .62s cubic-bezier(.22,1,.36,1) both}.kd2-main{animation-delay:.05s}.kd2-boundary{animation-delay:.1s}@keyframes kd2-rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}}
@media(max-width:980px){.kd2-head,.kd2-main{grid-template-columns:1fr}.kd2-lead{max-width:680px}.kd2-trajectory{min-height:390px}.kd2-chart{margin-top:60px}}
@media(max-width:650px){.key-data-v2{padding:72px 0}.kd2-head h2{font-size:44px}.kd2-lead{font-size:14px}.kd2-main{margin-top:44px}.kd2-metrics{grid-template-columns:1fr 1fr}.kd2-metric{min-height:176px;padding:18px 17px;border-radius:18px}.kd2-icon{width:34px;height:34px;border-radius:10px}.kd2-value{margin-top:32px;font-size:32px}.kd2-label{font-size:6.5px}.kd2-sub{font-size:9px}.kd2-trajectory{min-height:360px;padding:22px 18px;border-radius:20px}.kd2-trajectory h3{font-size:31px}.kd2-chart{margin-top:52px;overflow-x:auto;padding-bottom:8px;scrollbar-width:none}.kd2-chart::-webkit-scrollbar{display:none}.kd2-chart-line{left:34px;right:auto;width:390px}.kd2-nodes{width:455px;grid-template-columns:repeat(5,91px)}.kd2-signal{margin-top:38px}.kd2-boundary{grid-template-columns:auto 1fr;padding:17px}.kd2-status{grid-column:2;justify-self:start}.kd2-boundary p{font-size:10px}}
@media(max-width:430px){.kd2-metrics{grid-template-columns:1fr}.kd2-metric{min-height:158px}.kd2-value{font-size:36px}.kd2-boundary{grid-template-columns:1fr}.kd2-status{grid-column:1}.kd2-boundary-icon{display:none}}
@media(prefers-reduced-motion:reduce){.kd2-head,.kd2-main,.kd2-boundary{animation:none!important}.kd2-metric{transition:none!important}}
</style>`;

function metricHtml([icon, value, label, sub]) {
  return `<article class="kd2-metric"><span class="kd2-icon">${icons[icon]}</span><strong class="kd2-value">${value}</strong><span class="kd2-label">${label}</span><span class="kd2-sub">${sub}</span></article>`;
}

function sectionHtml(p) {
  const nodes = p.nodes.map(label => `<span class="kd2-node">${label}</span>`).join('');
  return `<section class="key-data-v2" id="data" data-komo-key-marketing-v2><div class="shell"><div class="kd2-head"><div><span class="kd2-eyebrow">${p.eyebrow}</span><h2>${p.title}</h2></div><p class="kd2-lead">${p.lead}</p></div><div class="kd2-main"><div class="kd2-metrics">${p.metrics.map(metricHtml).join('')}</div><aside class="kd2-trajectory"><div class="kd2-traj-top"><span class="kd2-traj-icon">${icons.trajectory}</span><div class="kd2-traj-copy"><span class="kd2-traj-eyebrow">${p.trajectoryEyebrow}</span><h3>${p.trajectoryTitle}</h3></div></div><div class="kd2-chart"><span class="kd2-chart-line" aria-hidden="true"></span><div class="kd2-nodes">${nodes}</div></div><div class="kd2-signal" aria-hidden="true"><svg viewBox="0 0 520 92" preserveAspectRatio="none"><path class="ghost" d="M0 70H520M0 42H520M0 14H520"/><path d="M0 72 C48 70 58 61 86 62 S137 52 164 55 S214 45 240 47 S291 38 316 40 S360 27 390 31 S445 17 520 13"/></svg></div></aside></div><div class="kd2-boundary"><span class="kd2-boundary-icon">${icons.boundary}</span><p>${p.note}</p><span class="kd2-status">${p.unchanged}</span></div></div></section>`;
}

for (const p of pages) {
  const fp = join(site, p.path);
  let html = await readFile(fp, 'utf8');
  const sectionPattern = /<section class="section" id="data">[\s\S]*?<\/section>/;
  if (!sectionPattern.test(html)) throw new Error(`[komo-key-marketing-v2] data section missing in ${p.path}`);
  html = html.replace('</head>', `${css}</head>`);
  html = html.replace(sectionPattern, sectionHtml(p));
  await writeFile(fp, html, 'utf8');
}

console.log('[komo-key-marketing-v2] PASS · four useful signals + longitudinal Pulse trajectory + unified SVG icon system');
