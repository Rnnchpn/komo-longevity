import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();

const pages = {
  en: {
    file: join(root, 'site', 'index.html'),
    eyebrow: 'KŌMØ WORLD · VIRTUAL REHABILITATION & NETWORK',
    title: 'Virtual rehabilitation.<br><em>A network in motion.</em>',
    body: 'KŌMØ World extends the movement journey into an interactive space: guided exercises, shared programmes and a living network that helps people keep moving between sessions.',
    boundary: 'When it is part of a rehabilitation pathway, the experience follows the programme defined with the responsible professional. It supports care; it does not replace it.',
    primary: 'Enter KŌMØ World',
    secondary: 'Discover KŌMØ Pulse',
    orbitLead: 'KŌMØ World brings the next chapter of the movement journey into a shared, guided space.',
    orbitLabel: 'KŌMØ World network principles',
    orbitTitle: 'Move.<br><em>Connect.</em><br>Continue.',
    signalOne: ['01', 'GUIDED', 'Exercises and programmes designed to make the next step clear.'],
    signalTwo: ['02', 'CONNECTED', 'A social layer for continuity, motivation and shared progress.'],
    signalThree: ['03', 'RESPONSIBLE', 'A digital extension that stays anchored to the right human framework.']
  },
  fr: {
    file: join(root, 'site', 'fr', 'index.html'),
    eyebrow: 'KŌMØ WORLD · RÉÉDUCATION VIRTUELLE & RÉSEAU',
    title: 'Rééducation virtuelle.<br><em>Un réseau en mouvement.</em>',
    body: 'KŌMØ World prolonge le parcours du mouvement dans un espace interactif : exercices guidés, programmes partagés et réseau vivant pour continuer à avancer entre deux séances.',
    boundary: 'Lorsqu’il s’inscrit dans un parcours de rééducation, l’expérience suit le programme défini avec le professionnel responsable. Elle accompagne le soin ; elle ne le remplace pas.',
    primary: 'Entrer dans KŌMØ World',
    secondary: 'Découvrir KŌMØ Pulse',
    orbitLead: 'KŌMØ World ouvre le prochain chapitre du parcours du mouvement dans un espace partagé et guidé.',
    orbitLabel: 'Principes du réseau KŌMØ World',
    orbitTitle: 'Bouger.<br><em>Relier.</em><br>Continuer.',
    signalOne: ['01', 'GUIDÉ', 'Des exercices et des programmes pour rendre la prochaine étape évidente.'],
    signalTwo: ['02', 'CONNECTÉ', 'Une dimension réseau pour la continuité, la motivation et le progrès partagé.'],
    signalThree: ['03', 'RESPONSABLE', 'Une extension numérique ancrée dans le bon cadre humain et professionnel.']
  },
  es: {
    file: join(root, 'site', 'es', 'index.html'),
    eyebrow: 'KŌMØ WORLD · REHABILITACIÓN VIRTUAL Y RED',
    title: 'Rehabilitación virtual.<br><em>Una red en movimiento.</em>',
    body: 'KŌMØ World amplía el recorrido del movimiento en un espacio interactivo: ejercicios guiados, programas compartidos y una red viva para seguir avanzando entre sesiones.',
    boundary: 'Cuando forma parte de un proceso de rehabilitación, la experiencia sigue el programa definido con el profesional responsable. Acompaña la atención; no la sustituye.',
    primary: 'Entrar en KŌMØ World',
    secondary: 'Descubrir KŌMØ Pulse',
    orbitLead: 'KŌMØ World abre el siguiente capítulo del recorrido del movimiento en un espacio compartido y guiado.',
    orbitLabel: 'Principios de la red KŌMØ World',
    orbitTitle: 'Moverse.<br><em>Conectar.</em><br>Continuar.',
    signalOne: ['01', 'GUIADO', 'Ejercicios y programas que hacen más claro el siguiente paso.'],
    signalTwo: ['02', 'CONECTADO', 'Una dimensión de red para la continuidad, la motivación y el progreso compartido.'],
    signalThree: ['03', 'RESPONSABLE', 'Una extensión digital que permanece anclada al marco humano adecuado.']
  }
};

const style = `
<style id="komo-world-public-home-v1">
  .komo-world-home{position:relative;overflow:hidden;padding:clamp(68px,9vw,136px) 0;color:#f4f2e9;background:#0a3035}
  .komo-world-home:before{content:'';position:absolute;inset:-25% -8% auto 34%;height:145%;border:1px solid rgba(214,232,218,.18);border-radius:50%;transform:rotate(-16deg);pointer-events:none}
  .komo-world-home:after{content:'';position:absolute;right:-8%;bottom:-35%;width:min(48vw,620px);aspect-ratio:1;border:1px solid rgba(230,202,145,.32);border-radius:50%;box-shadow:0 0 0 42px rgba(230,202,145,.06),0 0 0 86px rgba(230,202,145,.035);pointer-events:none}
  .komo-world-home .rvc-shell,.komo-world-home .shell{position:relative;z-index:1}
  .komo-world-home-grid{display:grid;grid-template-columns:minmax(0,1.02fr) minmax(300px,.98fr);gap:clamp(2.2rem,7vw,8rem);align-items:center}
  .komo-world-home-copy{max-width:710px}
  .komo-world-home .rvc-ey,.komo-world-home .eyebrow{color:#c7d9c6}
  .komo-world-home h2,.komo-world-home .rvc-title{max-width:720px;margin:0;color:#fff;font:500 clamp(2.8rem,6.7vw,6.7rem)/.91 var(--display);letter-spacing:-.07em}
  .komo-world-home h2 em,.komo-world-home .rvc-title em{color:#e4c990;font-style:italic}
  .komo-world-home-lead{max-width:610px;margin:1.55rem 0 0!important;color:rgba(244,242,233,.78)!important;font-size:clamp(1.02rem,1.45vw,1.2rem)!important;line-height:1.6!important}
  .komo-world-home-boundary{max-width:560px;margin:1.15rem 0 0;padding-left:1rem;border-left:1px solid rgba(244,242,233,.34);color:rgba(244,242,233,.57);font-size:.82rem;line-height:1.55}
  .komo-world-home-actions{display:flex;flex-wrap:wrap;gap:.7rem;margin-top:2rem}
  .komo-world-home .rvc-btn{border-color:#e3c98f;background:#e3c98f;color:#10383a!important}
  .komo-world-home .rvc-btn:hover{border-color:#f0dcae;background:#f0dcae;color:#10383a!important}
  .komo-world-home .rvc-link{color:#fff}
  .komo-world-home .rvc-link:hover{color:#e4c990}
  .komo-world-home-orbit{position:relative;min-height:470px;display:grid;place-items:center}
  .komo-world-home-orbit:before{content:'';position:absolute;width:min(31vw,360px);aspect-ratio:1;border:1px solid rgba(199,217,198,.47);border-radius:50%;transform:rotate(27deg) scaleY(.48)}
  .komo-world-home-orbit:after{content:'';position:absolute;width:min(43vw,500px);aspect-ratio:1;border:1px solid rgba(199,217,198,.2);border-radius:50%;transform:rotate(-25deg) scaleY(.48)}
  .komo-world-home-orbit-card{position:relative;width:min(100%,410px);padding:1.35rem;border:1px solid rgba(244,242,233,.3);border-radius:30px;background:linear-gradient(145deg,rgba(26,91,91,.88),rgba(5,43,48,.93));box-shadow:0 28px 70px rgba(0,0,0,.2);backdrop-filter:blur(9px)}
  .komo-world-home-orbit-card:before{content:'KŌMØ WORLD';display:block;margin-bottom:2.3rem;color:rgba(244,242,233,.63);font:500 .62rem/1 var(--mono);letter-spacing:.14em}
  .komo-world-home-orbit-card strong{display:block;color:#fff;font:500 clamp(2.4rem,4.7vw,4.3rem)/.9 var(--display);letter-spacing:-.06em}
  .komo-world-home-orbit-card strong em{color:#e4c990;font-style:italic}
  .komo-world-home-orbit-card p{max-width:270px;margin:1.2rem 0 0;color:rgba(244,242,233,.72);font-size:.88rem;line-height:1.5}
  .komo-world-home-signal-list{display:grid;gap:.75rem;margin:1.45rem 0 0;padding:0;list-style:none}
  .komo-world-home-signal{display:grid;grid-template-columns:2.1rem 5.4rem 1fr;gap:.65rem;align-items:start;padding-top:.75rem;border-top:1px solid rgba(244,242,233,.18)}
  .komo-world-home-signal span{color:#e4c990;font:500 .62rem/1.2 var(--mono);letter-spacing:.08em}
  .komo-world-home-signal strong{color:#fff;font:500 .64rem/1.2 var(--mono);letter-spacing:.12em}
  .komo-world-home-signal p{margin:0;color:rgba(244,242,233,.64);font-size:.74rem;line-height:1.4}
  @media(max-width:900px){.komo-world-home-grid{grid-template-columns:1fr}.komo-world-home-orbit{min-height:390px;margin-top:-1rem}.komo-world-home-orbit-card{max-width:470px}.komo-world-home:before{left:10%;height:100%}}
  @media(max-width:600px){.komo-world-home h2{font-size:clamp(2.8rem,14vw,4.8rem)}.komo-world-home-orbit{min-height:360px}.komo-world-home-orbit:before{width:65vw}.komo-world-home-orbit:after{width:93vw}.komo-world-home-signal{grid-template-columns:1.8rem 4.8rem 1fr}.komo-world-home-signal p{font-size:.7rem}}
</style>`;

function renderSection(c) {
  const signals = [c.signalOne, c.signalTwo, c.signalThree];
  return `
    <section class="komo-world-home" id="komo-world-public-home-v1" aria-labelledby="komo-world-public-home-title">
      <div class="rvc-shell komo-world-home-grid">
        <div class="komo-world-home-copy reveal">
          <p class="rvc-ey">${c.eyebrow}</p>
          <h2 class="rvc-title" id="komo-world-public-home-title">${c.title}</h2>
          <p class="rvc-copy komo-world-home-lead">${c.body}</p>
          <p class="komo-world-home-boundary">${c.boundary}</p>
          <div class="komo-world-home-actions">
            <a class="rvc-btn" href="/world/">${c.primary} <span aria-hidden="true">↗</span></a>
            <a class="rvc-link" href="/pulse/">${c.secondary} <span aria-hidden="true">→</span></a>
          </div>
        </div>
        <div class="komo-world-home-orbit reveal" aria-label="${c.orbitLabel}">
          <div class="komo-world-home-orbit-card">
            <strong>${c.orbitTitle}</strong>
            <p>${c.orbitLead}</p>
            <ul class="komo-world-home-signal-list">
              ${signals.map(([number, label, text]) => `<li class="komo-world-home-signal"><span>${number}</span><strong>${label}</strong><p>${text}</p></li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    </section>`;
}

function addWorldLink(nav, indent = '') {
  if (/href="\/world\/"/.test(nav)) return nav;
  return nav.replace('</nav>', `<a href="/world/">World</a>${indent}</nav>`);
}

function injectNav(html) {
  let found = false;
  html = html.replace(/(<nav\s+class="kp-nav"[\s\S]*?<\/nav>)/, (nav) => {
    found = true;
    return addWorldLink(nav);
  });
  html = html.replace(/(<details\s+class="kp-menu"[\s\S]*?<nav(?:\s[^>]*)?>[\s\S]*?<\/nav>)/, (menuNav) => addWorldLink(menuNav));
  html = html.replace(/(<nav\s+class="primary-nav"[\s\S]*?<\/nav>)/, (nav) => {
    found = true;
    return addWorldLink(nav, '\n        ');
  });
  if (!found) throw new Error('[world-public-home] public navigation missing');
  return html;
}

async function patchHome(locale, config) {
  let html = await readFile(config.file, 'utf8');
  html = html.replace(/\s*<style id="komo-world-public-home-v1">[\s\S]*?<\/style>/, '');
  html = html.replace(/\s*<section class="komo-world-home" id="komo-world-public-home-v1"[\s\S]*?<\/section>/g, '');
  html = injectNav(html);
  const markers = ['<section class="rvc-final"', '<section class="partner-offer section"', '</main>'];
  const markerIndex = markers.map((marker) => html.indexOf(marker)).find((index) => index >= 0);
  if (markerIndex === undefined) throw new Error(`[world-public-home] insertion marker missing for ${locale}`);
  html = `${html.slice(0, markerIndex)}${renderSection(config)}\n\n${html.slice(markerIndex)}`;
  html = html.replace('</head>', `${style}\n</head>`);
  await writeFile(config.file, html);
}

for (const [locale, config] of Object.entries(pages)) await patchHome(locale, config);

for (const [locale, config] of Object.entries(pages)) {
  const html = await readFile(config.file, 'utf8');
  const sectionCount = (html.match(/<section class="komo-world-home" id="komo-world-public-home-v1"/g) || []).length;
  const worldLinkCount = (html.match(/href="\/world\/"/g) || []).length;
  if (sectionCount !== 1) throw new Error(`[world-public-home] expected one World section in ${locale}, found ${sectionCount}`);
  if (worldLinkCount < 2) throw new Error(`[world-public-home] expected nav + CTA World links in ${locale}, found ${worldLinkCount}`);
  if (!html.includes('<style id="komo-world-public-home-v1">') || !html.includes('KŌMØ WORLD')) throw new Error(`[world-public-home] incomplete output for ${locale}`);
}

console.log('[world-public-home] PASS · KŌMØ World is linked from the public home and primary navigation in EN/FR/ES');
