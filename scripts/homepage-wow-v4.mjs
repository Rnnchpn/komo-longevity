import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const site = join(process.cwd(), 'site');

const pages = [
  {
    file: join(site, 'fr', 'index.html'),
    sensorEy: 'KŌMØ MOTION · ACQUISITION',
    sensorTitle: 'Six capteurs.<br><em>Le mouvement devient visible.</em>',
    sensorLead: 'La session instrumentée ajoute une couche objective aux tests fonctionnels. Le signal reste complexe ; l’expérience, elle, reste simple.',
    sensorFacts: [['06','capteurs'],['02','côtés'],['01','session'],['∞','trajectoire']],
    sensorAlt: 'Les six capteurs KŌMØ utilisés pendant une session Motion',
    proEy: 'KŌMØ PRO · REQUEST A DEMO',
    proTitle: 'Déployez KŌMØ<br><em>dans votre centre.</em>',
    proLead: 'Cabinet, clinique de longévité, performance ou hospitality : KŌMØ Case et Pulse sont conçus comme un même système, avec un parcours patient et un espace professionnel.',
    proContexts: [['CABINET','Bilan locomoteur premium'],['LONGEVITY','Mesure fonctionnelle intégrée'],['PERFORMANCE','Suivi instrumenté'],['HOSPITALITY','Format portable']],
    demo: 'Demander une démo',
    proLink: 'Découvrir KŌMØ Pro',
    ticker: 'LONGEVITY IN MOTION · MEASURE · UNDERSTAND · FOLLOW · '
  },
  {
    file: join(site, 'index.html'),
    sensorEy: 'KŌMØ MOTION · ACQUISITION',
    sensorTitle: 'Six sensors.<br><em>Movement becomes visible.</em>',
    sensorLead: 'The instrumented session adds an objective layer to functional testing. The signal stays complex; the experience stays simple.',
    sensorFacts: [['06','sensors'],['02','sides'],['01','session'],['∞','trajectory']],
    sensorAlt: 'The six KŌMØ sensors used during a Motion session',
    proEy: 'KŌMØ PRO · REQUEST A DEMO',
    proTitle: 'Bring KŌMØ<br><em>to your centre.</em>',
    proLead: 'Practice, longevity clinic, performance or hospitality: KŌMØ Case and Pulse are designed as one system, with a patient journey and a professional workspace.',
    proContexts: [['PRACTICE','Premium locomotor assessment'],['LONGEVITY','Integrated functional measurement'],['PERFORMANCE','Instrumented follow-up'],['HOSPITALITY','Portable format']],
    demo: 'Request a demo',
    proLink: 'Discover KŌMØ Pro',
    ticker: 'LONGEVITY IN MOTION · MEASURE · UNDERSTAND · FOLLOW · '
  },
  {
    file: join(site, 'es', 'index.html'),
    sensorEy: 'KŌMØ MOTION · ADQUISICIÓN',
    sensorTitle: 'Seis sensores.<br><em>El movimiento se hace visible.</em>',
    sensorLead: 'La sesión instrumentada añade una capa objetiva a las pruebas funcionales. La señal sigue siendo compleja; la experiencia, simple.',
    sensorFacts: [['06','sensores'],['02','lados'],['01','sesión'],['∞','trayectoria']],
    sensorAlt: 'Los seis sensores KŌMØ utilizados durante una sesión Motion',
    proEy: 'KŌMØ PRO · SOLICITAR DEMO',
    proTitle: 'Lleve KŌMØ<br><em>a su centro.</em>',
    proLead: 'Consulta, clínica de longevidad, rendimiento u hospitality: KŌMØ Case y Pulse están diseñados como un único sistema, con recorrido del paciente y espacio profesional.',
    proContexts: [['CONSULTA','Evaluación locomotora premium'],['LONGEVITY','Medición funcional integrada'],['PERFORMANCE','Seguimiento instrumentado'],['HOSPITALITY','Formato portátil']],
    demo: 'Solicitar una demo',
    proLink: 'Descubrir KŌMØ Pro',
    ticker: 'LONGEVITY IN MOTION · MEASURE · UNDERSTAND · FOLLOW · '
  }
];

const CSS = `<style id="homepage-wow-v4-style">
:root{--wow-black:#060707;--wow-ink:#151716;--wow-paper:#faf8f3;--wow-ivory:#f1ede4;--wow-sage:#91aa9f;--wow-sage-dark:#5f756c;--wow-beige:#decdb2;--wow-line:rgba(21,23,22,.14);--wow-white-line:rgba(255,255,255,.14)}
.kw-ticker{overflow:hidden;background:var(--wow-beige);color:#101110;border-top:1px solid rgba(16,17,16,.16);border-bottom:1px solid rgba(16,17,16,.16)}.kw-ticker__track{width:max-content;display:flex;animation:kw-marquee 26s linear infinite}.kw-ticker span{display:block;padding:15px 0;font-size:10px;font-weight:900;letter-spacing:.18em;white-space:pre;text-transform:uppercase}.kw-ticker span+span{margin-left:48px}@keyframes kw-marquee{to{transform:translateX(-50%)}}
.kw-sensors{position:relative;overflow:hidden;padding:clamp(84px,10vw,150px) 0;background:linear-gradient(160deg,#eeebe3,#faf8f3 72%);color:var(--wow-ink)}.kw-sensors:before{content:'06';position:absolute;right:-.03em;top:-.12em;color:rgba(21,23,22,.035);font-size:clamp(250px,39vw,640px);font-weight:950;line-height:.78;letter-spacing:-.12em}.kw-sensors__grid{position:relative;z-index:1;display:grid;grid-template-columns:minmax(340px,.78fr) minmax(520px,1.22fr);gap:clamp(54px,8vw,130px);align-items:center}.kw-sensors__copy h2{margin:0;font-size:clamp(52px,7vw,104px);font-weight:720;line-height:.88;letter-spacing:-.068em}.kw-sensors__copy h2 em{font-style:normal;color:var(--wow-sage-dark)}.kw-sensors__copy>p:last-of-type{margin:28px 0 0;max-width:560px;color:#676b66;font-size:clamp(16px,1.28vw,19px);line-height:1.58}.kw-sensors__facts{display:grid;grid-template-columns:repeat(4,1fr);margin-top:46px;border-top:1px solid var(--wow-ink);border-bottom:1px solid var(--wow-line)}.kw-sensors__fact{min-height:112px;padding:18px 16px 18px 0;border-right:1px solid var(--wow-line)}.kw-sensors__fact:not(:first-child){padding-left:16px}.kw-sensors__fact:last-child{border-right:0}.kw-sensors__fact b{display:block;font-size:33px;line-height:1;letter-spacing:-.055em}.kw-sensors__fact span{display:block;margin-top:10px;color:#727570;font-size:8px;font-weight:800;letter-spacing:.1em;text-transform:uppercase}.kw-sensors__stage{position:relative;min-height:650px;display:grid;place-items:center}.kw-sensors__halo{position:absolute;width:78%;aspect-ratio:1;border-radius:50%;border:1px solid rgba(21,23,22,.12);box-shadow:inset 0 0 0 36px rgba(255,255,255,.25),inset 0 0 0 37px rgba(21,23,22,.045);transform:scale(var(--wow-sensor-scale,1));transition:transform .15s linear}.kw-sensors__halo:before,.kw-sensors__halo:after{content:'';position:absolute;inset:18%;border:1px solid rgba(21,23,22,.1);border-radius:50%}.kw-sensors__halo:after{inset:36%;background:rgba(145,170,159,.09)}.kw-sensors__image{position:relative;z-index:2;width:min(92%,680px);filter:drop-shadow(0 34px 50px rgba(21,23,22,.14));transform:translateY(var(--wow-sensor-y,0px)) rotate(var(--wow-sensor-r,0deg));transition:transform .12s linear}.kw-sensors__image img{display:block;width:100%;height:auto;mix-blend-mode:multiply}.kw-sensors__tag{position:absolute;z-index:3;padding:9px 11px;border:1px solid rgba(21,23,22,.12);border-radius:999px;background:rgba(250,248,243,.82);backdrop-filter:blur(14px);font-size:7px;font-weight:850;letter-spacing:.13em;text-transform:uppercase}.kw-sensors__tag--a{left:5%;top:20%}.kw-sensors__tag--b{right:4%;top:36%}.kw-sensors__tag--c{left:10%;bottom:16%}
.kw-score-card{isolation:isolate}.kw-score-card:before{content:'';position:absolute;inset:-28%;z-index:-1;background:conic-gradient(from 90deg,transparent 0 18%,rgba(145,170,159,.16) 21% 29%,transparent 32% 62%,rgba(222,205,178,.12) 65% 72%,transparent 75%);animation:kw-orbit 18s linear infinite}.kw-score-orb{position:relative;background:radial-gradient(circle,rgba(145,170,159,.09),transparent 67%)}.kw-score-orb:before{content:'';position:absolute;inset:-14px;border-radius:50%;background:conic-gradient(var(--wow-sage) 0 84%,rgba(255,255,255,.08) 84% 100%);-webkit-mask:radial-gradient(circle,transparent 64%,#000 65%);mask:radial-gradient(circle,transparent 64%,#000 65%);transform:rotate(-90deg);opacity:.86}.kw-score-orb b,.kw-age b,.kw-pulse-ui__main b{font-variant-numeric:tabular-nums}.kw-score-card:not(.is-live) .kw-score-row i:before,.kw-score-card:not(.is-live) .kw-score-orb:before{transform:rotate(-90deg) scaleX(0)}.kw-score-row i:before{transform-origin:left;transition:transform 1.25s cubic-bezier(.22,1,.36,1)}.kw-score-orb:before{transform-origin:center;transition:transform 1.4s cubic-bezier(.22,1,.36,1)}@keyframes kw-orbit{to{transform:rotate(360deg)}}
.kw-pro-wow{position:relative;overflow:hidden;padding:clamp(90px,11vw,170px) 0;background:#0a0b0a;color:#fff}.kw-pro-wow:before{content:'PRO';position:absolute;right:-.03em;bottom:-.18em;color:rgba(255,255,255,.035);font-size:clamp(240px,39vw,620px);font-weight:950;line-height:.78;letter-spacing:-.12em}.kw-pro-wow__grid{position:relative;z-index:1;display:grid;grid-template-columns:1.08fr .92fr;gap:clamp(48px,9vw,145px);align-items:end}.kw-pro-wow h2{margin:0;font-size:clamp(60px,8vw,122px);font-weight:720;line-height:.87;letter-spacing:-.07em}.kw-pro-wow h2 em{font-style:normal;color:var(--wow-sage)}.kw-pro-wow__aside>p{margin:0;max-width:590px;color:rgba(255,255,255,.63);font-size:clamp(16px,1.3vw,20px);line-height:1.58}.kw-pro-wow__actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:30px}.kw-pro-wow__btn{display:inline-flex;min-height:54px;align-items:center;justify-content:center;padding:0 22px;border-radius:10px;background:var(--wow-beige);color:#0a0b0a!important;text-decoration:none;font-size:10px;font-weight:900;letter-spacing:.05em;text-transform:uppercase}.kw-pro-wow__btn--ghost{background:transparent;color:#fff!important;border:1px solid rgba(255,255,255,.25)}.kw-pro-wow__contexts{position:relative;z-index:1;display:grid;grid-template-columns:repeat(4,1fr);margin-top:clamp(56px,7vw,90px);border-top:1px solid rgba(255,255,255,.24);border-bottom:1px solid rgba(255,255,255,.14)}.kw-pro-wow__context{min-height:180px;padding:22px 24px 24px 0;border-right:1px solid rgba(255,255,255,.14)}.kw-pro-wow__context:not(:first-child){padding-left:24px}.kw-pro-wow__context:last-child{border-right:0}.kw-pro-wow__context small{color:var(--wow-sage);font-size:8px;font-weight:900;letter-spacing:.13em}.kw-pro-wow__context strong{display:block;margin-top:52px;font-size:20px;letter-spacing:-.03em}.kw-pro-wow__context span{display:block;margin-top:9px;color:rgba(255,255,255,.45);font-size:10px;line-height:1.45}
.wow-motion .kw-reveal{opacity:0;transform:translateY(26px);transition:opacity .85s cubic-bezier(.22,1,.36,1),transform .85s cubic-bezier(.22,1,.36,1)}.wow-motion .kw-reveal.is-visible{opacity:1;transform:none}.kw-reveal[data-wow-delay="1"]{transition-delay:.08s}.kw-reveal[data-wow-delay="2"]{transition-delay:.16s}.kw-reveal[data-wow-delay="3"]{transition-delay:.24s}.kw-rail a.is-active{color:#fff}.kw-rail a.is-active:after{right:0}.kwo-logo{will-change:transform;transform:translateY(var(--wow-hero-y,0px)) scale(var(--wow-hero-s,1))}
@media(pointer:fine){.kw-pulse-ui{transition:transform .28s ease,box-shadow .28s ease;transform:perspective(1000px) rotateX(var(--wow-tilt-x,0deg)) rotateY(var(--wow-tilt-y,0deg)) rotateZ(1deg)}.kw-pulse-v3:hover .kw-pulse-ui{box-shadow:0 46px 120px rgba(77,62,42,.30)}}
@media(max-width:980px){.kw-sensors__grid,.kw-pro-wow__grid{grid-template-columns:1fr}.kw-sensors__stage{min-height:560px}.kw-sensors__copy>p:last-of-type{max-width:720px}.kw-pro-wow__contexts{grid-template-columns:1fr 1fr}.kw-pro-wow__context:nth-child(2){border-right:0}.kw-pro-wow__context:nth-child(-n+2){border-bottom:1px solid rgba(255,255,255,.14)}.kw-pro-wow__context:nth-child(3){padding-left:0}}
@media(max-width:620px){.kw-ticker span{padding:12px 0;font-size:8px}.kw-sensors,.kw-pro-wow{padding:64px 0}.kw-sensors__copy h2,.kw-pro-wow h2{font-size:47px;line-height:.91}.kw-sensors__copy>p:last-of-type,.kw-pro-wow__aside>p{font-size:15px}.kw-sensors__facts{grid-template-columns:1fr 1fr;margin-top:32px}.kw-sensors__fact{min-height:88px}.kw-sensors__fact:nth-child(2){border-right:0}.kw-sensors__fact:nth-child(-n+2){border-bottom:1px solid var(--wow-line)}.kw-sensors__fact:nth-child(3){padding-left:0}.kw-sensors__stage{min-height:420px;margin-top:12px}.kw-sensors__halo{width:92%}.kw-sensors__image{width:100%}.kw-sensors__tag{font-size:6px}.kw-sensors__tag--a{left:0;top:16%}.kw-sensors__tag--b{right:0;top:42%}.kw-sensors__tag--c{left:3%;bottom:12%}.kw-pro-wow__actions{display:grid}.kw-pro-wow__btn{width:100%}.kw-pro-wow__contexts{grid-template-columns:1fr;margin-top:38px}.kw-pro-wow__context,.kw-pro-wow__context:not(:first-child),.kw-pro-wow__context:nth-child(3){min-height:0;padding:18px 0;border-right:0;border-bottom:1px solid rgba(255,255,255,.14)}.kw-pro-wow__context strong{margin-top:20px}.kw-pro-wow__context:last-child{border-bottom:0}.kw-score-card:before{display:none}.wow-motion .kw-reveal{transform:translateY(16px)}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto!important}.kw-ticker__track,.kw-score-card:before{animation:none!important}.wow-motion .kw-reveal{opacity:1!important;transform:none!important;transition:none!important}.kwo-logo,.kw-sensors__image,.kw-sensors__halo,.kw-pulse-ui{transform:none!important}.kw-score-row i:before,.kw-score-orb:before{transition:none!important}}
</style>`;

const JS = `<script id="homepage-wow-v4-js">
(()=>{
  document.documentElement.classList.add('wow-motion');
  const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const q=(s,r=document)=>r.querySelector(s), qa=(s,r=document)=>[...r.querySelectorAll(s)];
  if(!reduced){
    const reveal=new IntersectionObserver((entries)=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');reveal.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -6%'});
    qa('.kw-reveal').forEach(el=>reveal.observe(el));
  } else qa('.kw-reveal').forEach(el=>el.classList.add('is-visible'));
  const score=q('.kw-score-card');
  if(score){
    const live=()=>{
      if(score.classList.contains('is-live'))return;
      score.classList.add('is-live');
      qa('[data-kw-count]',score).forEach(el=>{
        const target=Number(el.dataset.kwCount||el.textContent||0); if(reduced||!Number.isFinite(target)){el.textContent=target;return;}
        const start=performance.now(), dur=1050;
        const step=(now)=>{const p=Math.min(1,(now-start)/dur),e=1-Math.pow(1-p,3);el.textContent=Math.round(target*e);if(p<1)requestAnimationFrame(step)};requestAnimationFrame(step);
      });
    };
    if(reduced) live(); else new IntersectionObserver((entries,o)=>entries.forEach(e=>{if(e.isIntersecting){live();o.disconnect()}}),{threshold:.35}).observe(score);
  }
  const rail=qa('.kw-rail a[href^="#"]');
  if(rail.length){
    const sections=rail.map(a=>q(a.getAttribute('href'))).filter(Boolean);
    const navObs=new IntersectionObserver((entries)=>{entries.forEach(e=>{if(!e.isIntersecting)return;rail.forEach(a=>a.classList.toggle('is-active',a.getAttribute('href')==='#'+e.target.id));})},{rootMargin:'-35% 0px -55%',threshold:0});
    sections.forEach(s=>navObs.observe(s));
  }
  if(!reduced){
    let raf=0;
    const onScroll=()=>{
      if(raf)return;
      raf=requestAnimationFrame(()=>{
        raf=0;
        const y=window.scrollY||0;
        const hero=q('.kwo-logo');
        if(hero){
          hero.style.setProperty('--wow-hero-y',Math.min(34,y*.055)+'px');
          hero.style.setProperty('--wow-hero-s',String(Math.max(.965,1-y*.000035)));
        }
        const ss=q('.kw-sensors');
        if(ss){
          const r=ss.getBoundingClientRect(),vh=innerHeight||800,p=Math.max(-1,Math.min(1,(vh*.5-(r.top+r.height*.5))/vh));
          const img=q('.kw-sensors__image',ss),halo=q('.kw-sensors__halo',ss);
          if(img){
            img.style.setProperty('--wow-sensor-y',(p*-24)+'px');
            img.style.setProperty('--wow-sensor-r',(p*1.2)+'deg');
          }
          if(halo)halo.style.setProperty('--wow-sensor-scale',String(1+p*.025));
        }
      });
    };
    addEventListener('scroll',onScroll,{passive:true});onScroll();
    const pulse=q('.kw-pulse-ui');
    if(pulse&&matchMedia('(pointer:fine)').matches){const host=q('.kw-pulse-v3');host?.addEventListener('pointermove',e=>{const r=pulse.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;pulse.style.setProperty('--wow-tilt-y',(x*4)+'deg');pulse.style.setProperty('--wow-tilt-x',(-y*4)+'deg')});host?.addEventListener('pointerleave',()=>{pulse.style.setProperty('--wow-tilt-y','0deg');pulse.style.setProperty('--wow-tilt-x','0deg')});}
  }
})();
</script>`;

function sectionBounds(html, cls) {
  const at = html.indexOf(`class="${cls}`);
  if (at < 0) return null;
  const start = html.lastIndexOf('<section', at);
  const endAt = html.indexOf('</section>', at);
  if (start < 0 || endAt < 0) return null;
  return { start, end: endAt + '</section>'.length };
}

function insertAfterSection(html, cls, fragment) {
  const b = sectionBounds(html, cls);
  if (!b) throw new Error(`[homepage-wow-v4] missing section ${cls}`);
  return html.slice(0, b.end) + fragment + html.slice(b.end);
}

function insertBeforeSection(html, cls, fragment) {
  const b = sectionBounds(html, cls);
  if (!b) throw new Error(`[homepage-wow-v4] missing section ${cls}`);
  return html.slice(0, b.start) + fragment + html.slice(b.start);
}

function sensorSection(c) {
  const facts = c.sensorFacts.map(([n,l])=>`<div class="kw-sensors__fact"><b>${n}</b><span>${l}</span></div>`).join('');
  return `<section class="kw-sensors" id="sensors"><div class="kw-shell kw-sensors__grid"><div class="kw-sensors__copy kw-reveal"><p class="kw-ey">${c.sensorEy}</p><h2>${c.sensorTitle}</h2><p>${c.sensorLead}</p><div class="kw-sensors__facts">${facts}</div></div><div class="kw-sensors__stage kw-reveal" data-wow-delay="1"><div class="kw-sensors__halo"></div><div class="kw-sensors__image"><img src="/assets/images/komo-case-overview.jpeg" alt="${c.sensorAlt}" loading="lazy" decoding="async" width="400" height="500"></div><span class="kw-sensors__tag kw-sensors__tag--a">KŌMØ · 01</span><span class="kw-sensors__tag kw-sensors__tag--b">MOTION · 06</span><span class="kw-sensors__tag kw-sensors__tag--c">PULSE · SESSION</span></div></div></section>`;
}

function proSection(c) {
  const contexts = c.proContexts.map(([a,b],i)=>`<div class="kw-pro-wow__context kw-reveal" data-wow-delay="${Math.min(i,3)}"><small>0${i+1}</small><strong>${a}</strong><span>${b}</span></div>`).join('');
  return `<section class="kw-pro-wow" id="demo"><div class="kw-shell"><div class="kw-pro-wow__grid"><div class="kw-reveal"><p class="kw-ey">${c.proEy}</p><h2>${c.proTitle}</h2></div><div class="kw-pro-wow__aside kw-reveal" data-wow-delay="1"><p>${c.proLead}</p><div class="kw-pro-wow__actions"><a class="kw-pro-wow__btn" href="/contact/?intent=demo">${c.demo} →</a><a class="kw-pro-wow__btn kw-pro-wow__btn--ghost" href="/partners/">${c.proLink} →</a></div></div></div><div class="kw-pro-wow__contexts">${contexts}</div></div></section>`;
}

function localizedPaths(html, file) {
  const isFr = file.includes('/fr/');
  const isEs = file.includes('/es/');
  if (isFr) return html.replaceAll('href="/contact/?intent=demo"','href="/fr/contact/?intent=demo"').replaceAll('href="/partners/"','href="/fr/partners/"');
  if (isEs) return html.replaceAll('href="/contact/?intent=demo"','href="/es/contact/?intent=demo"').replaceAll('href="/partners/"','href="/es/partners/"');
  return html;
}

for (const c of pages) {
  let html = await readFile(c.file, 'utf8');
  html = html.replace(/<style id="homepage-wow-v4-style">[\s\S]*?<\/style>/gi, '');
  html = html.replace(/<script id="homepage-wow-v4-js">[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<div class="kw-ticker"[\s\S]*?<\/div><\/div>/gi, '');
  const oldSensors = sectionBounds(html, 'kw-sensors'); if (oldSensors) html = html.slice(0, oldSensors.start) + html.slice(oldSensors.end);
  const oldPro = sectionBounds(html, 'kw-pro-wow'); if (oldPro) html = html.slice(0, oldPro.start) + html.slice(oldPro.end);
  for (const cls of ['kw-case','kw-measure','kw-score','kw-flow','kw-pulse-v3','kw-use','kw-proof']) html = html.replaceAll(`class="${cls} kw-reveal`, `class="${cls}`);

  const ticker = `<div class="kw-ticker" aria-hidden="true"><div class="kw-ticker__track"><span>${c.ticker.repeat(3)}</span><span>${c.ticker.repeat(3)}</span></div></div>`;
  const railAt = html.indexOf('<nav class="kw-rail"');
  if (railAt < 0) throw new Error(`[homepage-wow-v4] product rail missing in ${c.file}`);
  html = html.slice(0, railAt) + ticker + html.slice(railAt);
  html = insertAfterSection(html, 'kw-case', sensorSection(c));
  html = insertBeforeSection(html, 'kw-proof', proSection(c));

  html = html.replace('<div class="kw-score-orb"><div><b>84</b>', '<div class="kw-score-orb"><div><b data-kw-count="84">84</b>');
  html = html.replace(`<div class="kw-age"><div><small>`, `<div class="kw-age"><div><small>`);
  html = html.replace(/(<div class="kw-age">[\s\S]*?<\/div><b)>44(<\/b>)/, '$1 data-kw-count="44">44$2');
  html = html.replace('<div class="kw-pulse-ui__main"><small>MOTION SCORE</small><b>84</b>', '<div class="kw-pulse-ui__main"><small>MOTION SCORE</small><b data-kw-count="84">84</b>');

  html = html.replaceAll('<section class="kw-case"', '<section class="kw-case kw-reveal"');
  html = html.replaceAll('<section class="kw-measure"', '<section class="kw-measure kw-reveal"');
  html = html.replaceAll('<section class="kw-score"', '<section class="kw-score kw-reveal"');
  html = html.replaceAll('<section class="kw-flow"', '<section class="kw-flow kw-reveal"');
  html = html.replaceAll('<section class="kw-pulse-v3"', '<section class="kw-pulse-v3 kw-reveal"');
  html = html.replaceAll('<section class="kw-use"', '<section class="kw-use kw-reveal"');
  html = html.replaceAll('<section class="kw-proof"', '<section class="kw-proof kw-reveal"');

  html = html.replace('</head>', `${CSS}</head>`);
  html = html.replace('</body>', `${JS}</body>`);
  html = localizedPaths(html, c.file);
  await writeFile(c.file, html);
  console.log(`[homepage-wow-v4] upgraded ${c.file}`);
}
