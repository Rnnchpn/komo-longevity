import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const site = join(process.cwd(), 'site');

const pages = [
  {
    file: join(site, 'fr', 'index.html'),
    fieldEy: 'KŌMØ MOTION · SUR LE TERRAIN',
    fieldTitle: 'Des données abstraites. Des usages très concrets.',
    fieldLead: 'La mesure prend sa valeur dans le mouvement réel : activation musculaire, marche et tests fonctionnels dans un protocole simple à répéter.',
    muscle: 'Acquisition musculaire',
    gait: 'Analyse de la marche',
    fieldMeta: 'Photographies KŌMØ · acquisition instrumentée',
    pulseTitle: 'Votre mobilité, dans le temps.',
    pulseLead: 'Pulse reprend le langage visuel du système KŌMØ : une lecture immédiate, des détails accessibles en profondeur et une continuité entre chaque session.',
    session: 'SESSION 03',
    score: 'MOTION SCORE',
    age: 'ÂGE LOCOMOTEUR',
    trajectory: 'TRAJECTOIRE',
    sensors: 'CAPTEURS CONNECTÉS',
    result: 'Résultat illustratif',
    nav: ['Accueil','Sessions','Résultats','Capteurs','Profil'],
    cta: 'Accéder à Pulse →',
    caption: 'Aperçu d’interface KŌMØ Pulse · données illustratives'
  },
  {
    file: join(site, 'index.html'),
    fieldEy: 'KŌMØ MOTION · IN USE',
    fieldTitle: 'Abstract data. Concrete movement.',
    fieldLead: 'Measurement becomes meaningful in real movement: muscle activation, gait and functional testing in a workflow designed to be repeated.',
    muscle: 'Muscle acquisition',
    gait: 'Gait analysis',
    fieldMeta: 'KŌMØ photography · instrumented acquisition',
    pulseTitle: 'Your mobility, over time.',
    pulseLead: 'Pulse uses the same visual language as the KŌMØ system: immediate understanding, deeper detail when needed and continuity between sessions.',
    session: 'SESSION 03',
    score: 'MOTION SCORE',
    age: 'LOCOMOTOR AGE',
    trajectory: 'TRAJECTORY',
    sensors: 'CONNECTED SENSORS',
    result: 'Illustrative result',
    nav: ['Home','Sessions','Results','Sensors','Profile'],
    cta: 'Access Pulse →',
    caption: 'KŌMØ Pulse interface preview · illustrative data'
  },
  {
    file: join(site, 'es', 'index.html'),
    fieldEy: 'KŌMØ MOTION · EN USO',
    fieldTitle: 'Datos abstractos. Movimiento concreto.',
    fieldLead: 'La medición cobra valor en el movimiento real: activación muscular, marcha y pruebas funcionales dentro de un protocolo fácil de repetir.',
    muscle: 'Adquisición muscular',
    gait: 'Análisis de la marcha',
    fieldMeta: 'Fotografías KŌMØ · adquisición instrumentada',
    pulseTitle: 'Tu movilidad, a lo largo del tiempo.',
    pulseLead: 'Pulse comparte el lenguaje visual del sistema KŌMØ: comprensión inmediata, detalle cuando hace falta y continuidad entre sesiones.',
    session: 'SESIÓN 03',
    score: 'MOTION SCORE',
    age: 'EDAD LOCOMOTORA',
    trajectory: 'TRAYECTORIA',
    sensors: 'SENSORES CONECTADOS',
    result: 'Resultado ilustrativo',
    nav: ['Inicio','Sesiones','Resultados','Sensores','Perfil'],
    cta: 'Acceder a Pulse →',
    caption: 'Vista previa de KŌMØ Pulse · datos ilustrativos'
  }
];

const CSS = `<style id="homepage-brand-visual-v5-style">
/* KŌMØ V5 — sharper photography + Pulse-native illustration */
.kw-case__image picture,.kw-case__image img{display:block;width:100%;height:100%}.kw-case__image img{object-fit:contain!important;object-position:center!important;background:#eeeae1!important;filter:none!important}.kw-case__image{background:linear-gradient(145deg,#e8e3da,#f4f0e8)!important}.kw-case__image:after{background:rgba(8,9,8,.72)!important;border:1px solid rgba(255,255,255,.12)!important}
.kw-sensors__device-grid{position:relative;z-index:2;width:min(88%,660px);display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(18px,2.5vw,34px);padding:clamp(24px,4vw,52px);filter:drop-shadow(0 34px 50px rgba(21,23,22,.11));transform:translateY(var(--wow-sensor-y,0px)) rotate(var(--wow-sensor-r,0deg));transition:transform .12s linear}.kw-sensor-device{position:relative;aspect-ratio:1.22;display:grid;place-items:center;border-radius:34% 34% 40% 40%/42% 42% 34% 34%;background:linear-gradient(160deg,#292b2a,#0b0c0c 72%);box-shadow:inset 0 0 0 1px rgba(255,255,255,.08),inset 0 -12px 20px rgba(0,0,0,.35),0 18px 26px rgba(21,23,22,.16)}.kw-sensor-device:before{content:'';position:absolute;left:-13%;right:-13%;top:24%;bottom:18%;z-index:-1;border:1px solid rgba(21,23,22,.22);border-radius:32px;background:rgba(21,23,22,.04)}.kw-sensor-device:after{content:'';position:absolute;top:14%;width:10px;height:10px;border-radius:50%;background:#6d9bd5;box-shadow:0 0 0 4px rgba(109,155,213,.10),0 0 16px rgba(109,155,213,.38)}.kw-sensor-device b{margin-top:23%;color:rgba(255,255,255,.72);font-size:clamp(8px,.72vw,11px);font-weight:850;letter-spacing:.16em}.kw-sensor-device small{position:absolute;bottom:11%;color:rgba(255,255,255,.28);font-size:6px;letter-spacing:.12em}.kw-sensors__stage{isolation:isolate}.kw-sensors__halo{opacity:.72}
.kw-field{padding:clamp(82px,10vw,148px) 0;background:#0a0b0a;color:#fff}.kw-field__head{display:grid;grid-template-columns:.9fr 1.1fr;gap:clamp(42px,8vw,120px);align-items:end;margin-bottom:clamp(42px,6vw,72px)}.kw-field .kw-ey{color:#decdb2}.kw-field h2{margin:0;font-size:clamp(52px,7vw,104px);font-weight:720;line-height:.88;letter-spacing:-.068em}.kw-field h2 em{font-style:normal;color:#91aa9f}.kw-field__lead{margin:0;max-width:620px;color:rgba(255,255,255,.62);font-size:clamp(16px,1.3vw,20px);line-height:1.58}.kw-field__grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.kw-field__card{position:relative;overflow:hidden;min-height:580px;margin:0;border:1px solid rgba(255,255,255,.12);border-radius:26px;background:#151716}.kw-field__card img{width:100%;height:100%;display:block;object-fit:cover;object-position:center;filter:saturate(.88) contrast(1.03);transition:transform .8s cubic-bezier(.22,1,.36,1)}.kw-field__card:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 58%,rgba(6,7,7,.72))}.kw-field__card figcaption{position:absolute;z-index:2;left:24px;right:24px;bottom:22px;display:flex;justify-content:space-between;gap:18px;align-items:end}.kw-field__card strong{font-size:clamp(25px,2.5vw,38px);letter-spacing:-.045em}.kw-field__card span{max-width:210px;color:rgba(255,255,255,.52);font-size:8px;line-height:1.45;letter-spacing:.08em;text-align:right;text-transform:uppercase}@media(pointer:fine){.kw-field__card:hover img{transform:scale(1.025)}}
.kw-pulse-v3{background:#e7ded0!important}.kw-pulse-v3:before{color:rgba(255,255,255,.36)!important}.kw-pulse-v5{position:relative;overflow:hidden;padding:16px;border:1px solid rgba(22,27,42,.13);border-radius:30px;background:#161b2a;box-shadow:0 38px 95px rgba(70,58,43,.22);transform:rotate(.45deg)}.kw-pulse-v5__frame{display:grid;grid-template-columns:156px 1fr;min-height:590px;overflow:hidden;border-radius:21px;background:#f7f4ed}.kw-pulse-v5__side{padding:22px 15px;background:#f1eee7;border-right:1px solid rgba(22,27,42,.08);display:flex;flex-direction:column}.kw-pulse-v5__brand{margin-bottom:28px;color:#161b2a;font-size:11px;font-weight:900;letter-spacing:.16em}.kw-pulse-v5__nav{display:grid;gap:7px}.kw-pulse-v5__nav span{padding:10px 11px;border-radius:10px;color:#777a79;font-size:8px;font-weight:700}.kw-pulse-v5__nav span:first-child{background:#dfe8e2;color:#4d6d62}.kw-pulse-v5__person{margin-top:auto;padding-top:16px;border-top:1px solid rgba(22,27,42,.08);color:#777a79;font-size:7px;line-height:1.5}.kw-pulse-v5__main{padding:25px 26px 24px}.kw-pulse-v5__top{display:flex;justify-content:space-between;gap:16px;align-items:center}.kw-pulse-v5__top strong{font-size:18px;letter-spacing:-.035em}.kw-pulse-v5__status{display:flex;align-items:center;gap:7px;color:#5f756c;font-size:7px}.kw-pulse-v5__status:before{content:'';width:6px;height:6px;border-radius:50%;background:#6d9b87;box-shadow:0 0 0 3px rgba(109,155,135,.12)}.kw-pulse-v5__summary{display:grid;grid-template-columns:1.35fr .65fr;gap:12px;margin-top:24px}.kw-pulse-v5__score,.kw-pulse-v5__age{min-height:200px;padding:20px;border:1px solid rgba(22,27,42,.08);border-radius:18px;background:#fff}.kw-pulse-v5__label{color:#777a79;font-size:7px;font-weight:850;letter-spacing:.12em;text-transform:uppercase}.kw-pulse-v5__number{display:block;margin-top:24px;color:#4f776a;font-size:76px;font-weight:650;line-height:.75;letter-spacing:-.075em}.kw-pulse-v5__number small{font-size:14px;font-weight:600;letter-spacing:-.02em}.kw-pulse-v5__trend{height:58px;margin-top:26px}.kw-pulse-v5__trend svg{width:100%;height:100%;overflow:visible}.kw-pulse-v5__age b{display:block;margin-top:35px;color:#161b2a;font-size:54px;line-height:.8;letter-spacing:-.065em}.kw-pulse-v5__age span{display:block;margin-top:13px;color:#8a7352;font-size:7px;letter-spacing:.09em;text-transform:uppercase}.kw-pulse-v5__lower{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}.kw-pulse-v5__panel{min-height:150px;padding:18px;border:1px solid rgba(22,27,42,.08);border-radius:18px;background:#fff}.kw-pulse-v5__sensor-row{display:grid;grid-template-columns:repeat(6,1fr);gap:7px;margin-top:23px}.kw-pulse-v5__sensor{aspect-ratio:.72;border-radius:11px;background:linear-gradient(160deg,#292b2a,#111);box-shadow:inset 0 0 0 1px rgba(255,255,255,.06);position:relative}.kw-pulse-v5__sensor:before{content:'';position:absolute;top:8px;left:50%;width:4px;height:4px;margin-left:-2px;border-radius:50%;background:#6d9b87}.kw-pulse-v5__timeline{display:flex;align-items:end;gap:6px;height:78px;margin-top:22px}.kw-pulse-v5__timeline i{flex:1;border-radius:6px 6px 2px 2px;background:#dbe5df}.kw-pulse-v5__timeline i:nth-child(1){height:38%}.kw-pulse-v5__timeline i:nth-child(2){height:48%}.kw-pulse-v5__timeline i:nth-child(3){height:57%}.kw-pulse-v5__timeline i:nth-child(4){height:69%}.kw-pulse-v5__timeline i:nth-child(5){height:82%}.kw-pulse-v5__timeline i:nth-child(6){height:96%;background:#648779}.kw-pulse-v5__caption{display:flex;justify-content:space-between;gap:18px;padding:12px 8px 0;color:rgba(255,255,255,.45);font-size:7px;letter-spacing:.07em}.kw-pulse-v5__caption a{color:#decdb2;text-decoration:none}.kw-pulse-v3__copy{color:#5b5852!important}
@media(max-width:980px){.kw-field__head{grid-template-columns:1fr}.kw-field__grid{grid-template-columns:1fr}.kw-field__card{min-height:520px}.kw-pulse-v5{max-width:780px;transform:none}.kw-pulse-v5__frame{min-height:560px}}
@media(max-width:620px){.kw-field{padding:64px 0}.kw-field h2{font-size:47px;line-height:.91}.kw-field__lead{font-size:15px}.kw-field__grid{gap:10px}.kw-field__card{min-height:360px;border-radius:20px}.kw-field__card figcaption{left:17px;right:17px;bottom:16px}.kw-field__card strong{font-size:27px}.kw-field__card span{font-size:6px}.kw-sensors__device-grid{width:100%;gap:14px;padding:26px 12px}.kw-sensor-device{border-radius:28% 28% 34% 34%/38% 38% 30% 30%}.kw-pulse-v5{padding:9px;border-radius:22px}.kw-pulse-v5__frame{grid-template-columns:1fr;min-height:0;border-radius:16px}.kw-pulse-v5__side{display:none}.kw-pulse-v5__main{padding:18px 16px}.kw-pulse-v5__top strong{font-size:16px}.kw-pulse-v5__summary{grid-template-columns:1fr}.kw-pulse-v5__score,.kw-pulse-v5__age{min-height:150px;padding:16px}.kw-pulse-v5__number{font-size:62px;margin-top:18px}.kw-pulse-v5__age b{margin-top:24px;font-size:46px}.kw-pulse-v5__lower{grid-template-columns:1fr}.kw-pulse-v5__sensor-row{gap:5px}.kw-pulse-v5__caption{font-size:6px}}
</style>`;

function buildPulse(p) {
  const nav = p.nav.map(x => `<span>${x}</span>`).join('');
  const sensors = Array.from({length: 6}, () => '<i class="kw-pulse-v5__sensor"></i>').join('');
  return `<section class="kw-pulse-v3 kw-reveal" id="pulse"><div class="kw-shell kw-pulse-v3__grid"><div><p class="kw-ey">KŌMØ PULSE</p><h2>${p.pulseTitle}</h2><p class="kw-pulse-v3__copy">${p.pulseLead}</p><div class="kw-pulse-v3__actions"><a class="kw-btn" href="https://pulse.komolongevity.com/">${p.cta}</a><a class="kw-link" href="#score">Motion Score →</a></div></div><div class="kw-pulse-v5" aria-label="KŌMØ Pulse interface preview"><div class="kw-pulse-v5__frame"><aside class="kw-pulse-v5__side"><div class="kw-pulse-v5__brand">KŌMØ PULSE</div><div class="kw-pulse-v5__nav">${nav}</div><div class="kw-pulse-v5__person">KŌMØ MEMBER<br>Pulse · connected</div></aside><div class="kw-pulse-v5__main"><div class="kw-pulse-v5__top"><strong>KŌMØ Pulse</strong><span class="kw-pulse-v5__status">6 sensors connected</span></div><div class="kw-pulse-v5__summary"><div class="kw-pulse-v5__score"><span class="kw-pulse-v5__label">${p.score}</span><b class="kw-pulse-v5__number">84<small>/100</small></b><div class="kw-pulse-v5__trend"><svg viewBox="0 0 260 60" role="img" aria-label="Trajectory preview"><path d="M2 49 C30 42,42 31,62 34 S96 40,113 28 S145 18,166 21 S206 23,258 4" fill="none" stroke="#5f8074" stroke-width="3" stroke-linecap="round"/><path d="M2 49 C30 42,42 31,62 34 S96 40,113 28 S145 18,166 21 S206 23,258 4 L258 60 L2 60 Z" fill="#dfe8e2" opacity=".65"/></svg></div></div><div class="kw-pulse-v5__age"><span class="kw-pulse-v5__label">${p.age}</span><b>44</b><span>${p.result}</span></div></div><div class="kw-pulse-v5__lower"><div class="kw-pulse-v5__panel"><span class="kw-pulse-v5__label">${p.sensors}</span><div class="kw-pulse-v5__sensor-row">${sensors}</div></div><div class="kw-pulse-v5__panel"><span class="kw-pulse-v5__label">${p.trajectory}</span><div class="kw-pulse-v5__timeline"><i></i><i></i><i></i><i></i><i></i><i></i></div></div></div></div></div><div class="kw-pulse-v5__caption"><span>${p.session}</span><a href="https://pulse.komolongevity.com/">${p.caption}</a></div></div></div></section>`;
}

function buildField(p) {
  return `<section class="kw-field"><div class="kw-shell"><div class="kw-field__head"><div><p class="kw-ey">${p.fieldEy}</p><h2>${p.fieldTitle.replace('.', '.<br><em>')}</em></h2></div><p class="kw-field__lead">${p.fieldLead}</p></div><div class="kw-field__grid"><figure class="kw-field__card kw-reveal"><img src="/assets/images/komo-case-muscle.jpeg" alt="${p.muscle}" loading="lazy" decoding="async"><figcaption><strong>${p.muscle}</strong><span>${p.fieldMeta}</span></figcaption></figure><figure class="kw-field__card kw-reveal" data-wow-delay="1"><img src="/assets/images/komo-case-gait.jpeg" alt="${p.gait}" loading="lazy" decoding="async"><figcaption><strong>${p.gait}</strong><span>${p.fieldMeta}</span></figcaption></figure></div></div></section>`;
}

for (const p of pages) {
  let html = await readFile(p.file, 'utf8');
  if (html.includes('homepage-brand-visual-v5-style')) continue;

  html = html.replace('</head>', `${CSS}</head>`);

  html = html.replace(/<div class="kw-sensors__image"><img[^>]*><\/div>/, `<div class="kw-sensors__image kw-sensors__device-grid" aria-label="Six KŌMØ sensors"><span class="kw-sensor-device"><b>KŌMØ</b><small>01</small></span><span class="kw-sensor-device"><b>KŌMØ</b><small>02</small></span><span class="kw-sensor-device"><b>KŌMØ</b><small>03</small></span><span class="kw-sensor-device"><b>KŌMØ</b><small>04</small></span><span class="kw-sensor-device"><b>KŌMØ</b><small>05</small></span><span class="kw-sensor-device"><b>KŌMØ</b><small>06</small></span></div>`);

  const sensors = html.match(/<section class="kw-sensors" id="sensors">[\s\S]*?<\/section>/);
  if (sensors) html = html.replace(sensors[0], `${sensors[0]}${buildField(p)}`);

  html = html.replace(/<section class="kw-pulse-v3 kw-reveal" id="pulse">[\s\S]*?<\/section>/, buildPulse(p));

  html = html.replace('loading="lazy" decoding="async"></picture></div><div class="kw-facts">', 'loading="eager" fetchpriority="high" decoding="async"></picture></div><div class="kw-facts">');

  await writeFile(p.file, html);
  console.log(`[homepage-brand-visual-v5] polished ${p.file}`);
}
