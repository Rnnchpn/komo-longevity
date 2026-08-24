import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const site = join(process.cwd(), 'site');
const PULSE = 'https://pulse.komolongevity.com/';
const COPY = {
  "en": {
    "beta": "EARLY ACCESS BETA",
    "status": "Available now: account creation and the KŌMØ Loco Check. Motion and Clinical pathways are activated progressively with a professional.",
    "patient": "Create my free space",
    "professional": "I am a professional",
    "method": "Understand the method",
    "methodHref": "/method/",
    "homeLead": "KŌMØ Pulse is your personal mobility space. Create your free account, complete the KŌMØ Loco Check and follow your mobility references over time. Motion and Clinical pathways are then activated with your professional.",
    "scopeTitle": "A clearly defined beta.",
    "scopeText": "During this test phase, use fictional or non-clinical information only. Real clinical records, MyoCare imports and payments remain outside the public beta.",
    "medicalTitle": "Important information",
    "medicalText": "The KŌMØ Loco Check is an educational mobility reference. It does not provide a diagnosis, medical advice or an emergency service."
  },
  "fr": {
    "beta": "VERSION BÊTA · ACCÈS ANTICIPÉ",
    "status": "Disponible maintenant : création du compte et KŌMØ Loco Check. Les parcours Motion et Clinical sont activés progressivement avec un professionnel.",
    "patient": "Créer mon espace gratuit",
    "professional": "Je suis professionnel",
    "method": "Comprendre la méthode",
    "methodHref": "/fr/methode/",
    "homeLead": "KŌMØ Pulse est votre espace personnel dédié à la mobilité. Créez gratuitement votre compte, réalisez le KŌMØ Loco Check et suivez l’évolution de vos repères dans le temps. Les parcours Motion et Clinical sont ensuite activés avec votre professionnel.",
    "scopeTitle": "Une bêta au périmètre clairement défini.",
    "scopeText": "Pendant cette phase de test, utilisez uniquement des informations fictives ou non cliniques. Les véritables dossiers cliniques, imports MyoCare et paiements restent hors de la bêta publique.",
    "medicalTitle": "Information importante",
    "medicalText": "Le KŌMØ Loco Check fournit un repère éducatif de mobilité. Il ne constitue ni un diagnostic, ni un avis médical, ni un service d’urgence."
  },
  "es": {
    "beta": "VERSIÓN BETA · ACCESO ANTICIPADO",
    "status": "Disponible ahora: creación de cuenta y KŌMØ Loco Check. Los recorridos Motion y Clinical se activan progresivamente con un profesional.",
    "patient": "Crear mi espacio gratuito",
    "professional": "Soy profesional",
    "method": "Comprender el método",
    "methodHref": "/es/metodo/",
    "homeLead": "KŌMØ Pulse es tu espacio personal de movilidad. Crea tu cuenta gratuita, realiza el KŌMØ Loco Check y sigue la evolución de tus referencias. Los recorridos Motion y Clinical se activan después con tu profesional.",
    "scopeTitle": "Una beta con un alcance claramente definido.",
    "scopeText": "Durante esta fase de prueba, utiliza únicamente información ficticia o no clínica. Los expedientes clínicos reales, las importaciones de MyoCare y los pagos quedan fuera de la beta pública.",
    "medicalTitle": "Información importante",
    "medicalText": "KŌMØ Loco Check ofrece una referencia educativa de movilidad. No constituye un diagnóstico, consejo médico ni un servicio de urgencias."
  }
};
const STYLE = "<style id=\"pulse-beta-release-v1-style\">\n.kb-status{display:grid;grid-template-columns:minmax(160px,.38fr) minmax(0,1fr) auto;gap:22px;align-items:center;margin:0 0 clamp(34px,5vw,58px);padding:16px 18px;border:1px solid rgba(22,27,42,.16);border-radius:18px;background:rgba(255,255,255,.58)}\n.kb-status__label{display:flex;align-items:center;gap:9px;color:#8a7352;font-size:8px;font-weight:850;letter-spacing:.13em;text-transform:uppercase}.kb-status__dot{width:8px;height:8px;border-radius:50%;background:#c9b99f;box-shadow:0 0 0 5px rgba(201,185,159,.18)}\n.kb-status p{margin:0;color:#4f5159;font:400 13px/1.5 \"Iowan Old Style\",Baskerville,Georgia,serif}.kb-status__link{color:#161b2a;text-decoration:none;border-bottom:1px solid currentColor;padding-bottom:2px;font-size:9px;font-weight:850;white-space:nowrap}\n.kb-hero-actions{align-items:stretch}.kb-pro{display:inline-flex;min-height:48px;align-items:center;justify-content:center;padding:0 18px;border:1px solid rgba(22,27,42,.28);border-radius:999px;color:#161b2a!important;text-decoration:none;font-size:11px;font-weight:850}.kb-pro:hover{background:#fff}\n.kb-scope{width:min(calc(100% - 40px),1160px);margin:24px auto 0;padding:22px 24px;border:1px solid rgba(22,27,42,.14);border-radius:20px;background:#f5f1e9}.kb-scope strong{display:block;margin:0 0 7px;color:#8a7352;font-size:9px;letter-spacing:.12em;text-transform:uppercase}.kb-scope p{margin:0;max-width:780px;color:#5d6068;font-size:12px;line-height:1.6}\n.kb-disclaimer{padding:26px 0;border-top:1px solid rgba(22,27,42,.12);background:#eee8dd}.kb-disclaimer__inner{width:min(calc(100% - 40px),1160px);margin:auto;display:grid;grid-template-columns:.35fr 1fr;gap:24px}.kb-disclaimer strong{color:#161b2a;font-size:9px;letter-spacing:.12em;text-transform:uppercase}.kb-disclaimer p{margin:0;color:#62646b;font-size:11px;line-height:1.6}\n@media(max-width:760px){.kb-status{grid-template-columns:1fr;gap:11px;padding:15px}.kb-status__link{justify-self:start}.kb-hero-actions{display:grid!important}.kb-pro{width:100%}.kb-scope{width:min(calc(100% - 28px),1160px);padding:18px}.kb-disclaimer__inner{width:min(calc(100% - 28px),1160px);grid-template-columns:1fr;gap:9px}}\n</style>";
const ANALYTICS = "<script id=\"komo-public-analytics\">\nwindow.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments);};\ndocument.addEventListener(\"click\",function(event){\n  var link=event.target.closest&&event.target.closest(\"a[data-kp-event]\");\n  if(!link)return;\n  window.va(\"event\",{name:link.getAttribute(\"data-kp-event\"),data:{destination:link.getAttribute(\"data-kp-destination\")||\"pulse\",language:document.documentElement.lang||\"en\"}});\n});\n</script><script defer src=\"/_vercel/insights/script.js\"></script>";

async function walk(dir) {
  const out = [];
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, item.name);
    if (item.isDirectory()) out.push.apply(out, await walk(path));
    else out.push(path);
  }
  return out;
}
function langFor(html, rel) {
  const found = html.match(/<html[^>]+lang=["']([a-z]{2})/i);
  if (found && COPY[found[1]]) return found[1];
  if (rel.startsWith('fr/')) return 'fr';
  if (rel.startsWith('es/')) return 'es';
  return 'en';
}
function betaStatus(c) {
  return '<aside class="kb-status" id="komo-beta-status" aria-label="' + c.beta + '"><span class="kb-status__label"><i class="kb-status__dot" aria-hidden="true"></i>' + c.beta + '</span><p>' + c.status + '</p><a class="kb-status__link" href="' + PULSE + '?mode=professional" data-kp-event="pulse_cta_click" data-kp-destination="professional">' + c.professional + ' →</a></aside>';
}
function heroActions(c) {
  return '<div class="kpf-actions kb-hero-actions"><a class="kpf-btn" href="' + PULSE + '?intent=signup" data-kp-event="pulse_cta_click" data-kp-destination="patient">' + c.patient + ' →</a><a class="kb-pro" href="' + PULSE + '?mode=professional" data-kp-event="pulse_cta_click" data-kp-destination="professional">' + c.professional + ' →</a><a class="kpf-link" href="' + c.methodHref + '">' + c.method + ' →</a></div>';
}
function scope(c) {
  return '<aside class="kb-scope" id="beta-scope"><strong>' + c.scopeTitle + '</strong><p>' + c.scopeText + '</p></aside>';
}
function disclaimer(c) {
  return '<section class="kb-disclaimer" aria-label="' + c.medicalTitle + '"><div class="kb-disclaimer__inner"><strong>' + c.medicalTitle + '</strong><p>' + c.medicalText + '</p></div></section>';
}
function tagPulseLinks(html) {
  return html.replace(/<a\b([^>]*?)href=(["'])(https:\/\/pulse\.komolongevity\.com\/[^"']*)\2([^>]*)>/gi, function(match, before, quote, href, after) {
    if (/data-kp-event=/i.test(match)) return match;
    const destination = /(?:mode|intent)=professional/i.test(href) ? 'professional' : 'patient';
    return '<a' + before + 'href=' + quote + href + quote + after + ' data-kp-event="pulse_cta_click" data-kp-destination="' + destination + '">';
  });
}
const files = (await walk(site)).filter(function(path) { return path.endsWith('.html'); });
for (const file of files) {
  let html = await readFile(file, 'utf8');
  const rel = relative(site, file).replaceAll('\\', '/');
  const lang = langFor(html, rel);
  const c = COPY[lang] || COPY.en;
  const isHome = rel === 'index.html' || rel === 'fr/index.html' || rel === 'es/index.html';
  const isPulsePage = rel === 'pulse/index.html' || rel === 'fr/pulse/index.html' || rel === 'es/pulse/index.html';
  if (!html.includes('pulse-beta-release-v1-style')) html = html.replace('</head>', STYLE + '</head>');
  if (isHome) {
    html = html.replace(/<p class="kpf-lead">[\s\S]*?<\/p>/i, '<p class="kpf-lead">' + c.homeLead + '</p>');
    html = html.replace('<section class="kpf-hero"><div class="kpf-shell">', '<section class="kpf-hero"><div class="kpf-shell">' + betaStatus(c));
    html = html.replace(/<div class="kpf-actions"><a class="kpf-btn"[\s\S]*?<\/a><a class="kpf-link"[\s\S]*?<\/a><\/div>/i, heroActions(c));
    html = html.replace('dans un dossier longitudinal sécurisé', 'dans un espace personnel conçu pour rendre votre trajectoire lisible');
    html = html.replace('in one secure longitudinal space', 'in a personal space designed to keep your trajectory readable');
    html = html.replace('en un espacio longitudinal seguro', 'en un espacio personal diseñado para mantener una trayectoria legible');
    html = html.replace('dans un environnement sécurisé', 'dans un espace personnel clairement organisé');
    html = html.replace('into one secure environment', 'into one clearly organized personal space');
    html = html.replace('en un entorno seguro', 'en un espacio personal claramente organizado');
  }
  if (isPulsePage && !html.includes('id="beta-scope"')) html = html.replace(/<main([^>]*)>/i, '<main$1>' + scope(c));
  if ((isHome || isPulsePage) && !html.includes('class="kb-disclaimer"')) html = html.replace('</main>', disclaimer(c) + '</main>');
  html = tagPulseLinks(html);
  if (!html.includes('id="komo-public-analytics"')) html = html.replace('</body>', ANALYTICS + '</body>');
  await writeFile(file, html, 'utf8');
}
console.log('[pulse-beta-release-v1] beta scope, patient/professional entries and privacy-safe acquisition analytics applied.');
