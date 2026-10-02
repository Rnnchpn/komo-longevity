import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();

const pages = {
  en: {
    file: join(root, 'site', 'index.html'),
    eyebrow: 'KŌMØ WORLD · PRIVATE MEMBER MAP',
    title: 'Your private map.<br><em>A network around you.</em>',
    body: 'KŌMØ World maps the places, privileges, services and experiences selected for members — a private layer over the real world, starting with the Riviera.',
    boundary: 'World is curated rather than exhaustive: selected places, verified privileges and KŌMØ services. Health data remains in Pulse and is not exposed on the map.',
    primary: 'Enter KŌMØ World',
    secondary: 'Discover KŌMØ Pulse',
    orbitLead: 'A living map for the KŌMØ network — places, access and experiences in the real world.',
    orbitLabel: 'KŌMØ World member map principles',
    orbitTitle: 'Explore.<br><em>Access.</em><br>Belong.',
    signalOne: ['01', 'CURATED', 'Only places and experiences that matter to the KŌMØ member network.'],
    signalTwo: ['02', 'PRIVATE', 'Member privileges, selected services and invitation-only experiences.'],
    signalThree: ['03', 'REAL WORLD', 'The Riviera becomes the interface — not a fictional digital campus.']
  },
  fr: {
    file: join(root, 'site', 'fr', 'index.html'),
    eyebrow: 'KŌMØ WORLD · CARTE PRIVÉE MEMBRE',
    title: 'Votre carte privée.<br><em>Un réseau autour de vous.</em>',
    body: 'KŌMØ World cartographie les lieux, privilèges, services et expériences sélectionnés pour les membres — une couche privée sur le monde réel, en commençant par la Riviera.',
    boundary: 'World est volontairement curaté plutôt qu’exhaustif : lieux sélectionnés, privilèges vérifiés et services KŌMØ. Les données de santé restent dans Pulse et ne sont pas exposées sur la carte.',
    primary: 'Entrer dans KŌMØ World',
    secondary: 'Découvrir KŌMØ Pulse',
    orbitLead: 'Une carte vivante du réseau KŌMØ — lieux, accès et expériences dans le monde réel.',
    orbitLabel: 'Principes de la carte membre KŌMØ World',
    orbitTitle: 'Explorer.<br><em>Accéder.</em><br>Appartenir.',
    signalOne: ['01', 'CURATÉ', 'Uniquement les lieux et expériences qui comptent pour le réseau membre KŌMØ.'],
    signalTwo: ['02', 'PRIVÉ', 'Privilèges membres, services sélectionnés et expériences sur invitation.'],
    signalThree: ['03', 'MONDE RÉEL', 'La Riviera devient l’interface — pas un campus numérique fictif.']
  },
  es: {
    file: join(root, 'site', 'es', 'index.html'),
    eyebrow: 'KŌMØ WORLD · MAPA PRIVADO PARA MIEMBROS',
    title: 'Tu mapa privado.<br><em>Una red a tu alrededor.</em>',
    body: 'KŌMØ World cartografía lugares, privilegios, servicios y experiencias seleccionados para miembros — una capa privada sobre el mundo real, empezando por la Riviera.',
    boundary: 'World es curado, no exhaustivo: lugares seleccionados, privilegios verificados y servicios KŌMØ. Los datos de salud permanecen en Pulse y no se muestran en el mapa.',
    primary: 'Entrar en KŌMØ World',
    secondary: 'Descubrir KŌMØ Pulse',
    orbitLead: 'Un mapa vivo de la red KŌMØ — lugares, acceso y experiencias en el mundo real.',
    orbitLabel: 'Principios del mapa de miembros KŌMØ World',
    orbitTitle: 'Explorar.<br><em>Acceder.</em><br>Pertenecer.',
    signalOne: ['01', 'CURADO', 'Solo los lugares y experiencias relevantes para la red de miembros KŌMØ.'],
    signalTwo: ['02', 'PRIVADO', 'Privilegios de miembro, servicios seleccionados y experiencias por invitación.'],
    signalThree: ['03', 'MUNDO REAL', 'La Riviera se convierte en la interfaz — no un campus digital ficticio.']
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
