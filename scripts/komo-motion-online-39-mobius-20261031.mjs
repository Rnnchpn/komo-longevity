import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// Final KŌMØ Motion Online storefront release: price, direct Stripe entry,
// and the approved Möbius launch artwork. Does not change Pulse payment verification.
const root = process.cwd();
const site = join(root, 'site');
const stripe = 'https://buy.stripe.com/fZucN6bUTeTCd4B4EX0VO00';
const imageUrl = '/assets/images/komo-motion-online-mobius-39.webp';
const imageParts = [0, 1, 2, 3].map(i => join(root, 'src', 'assets', 'motion-online-mobius', 'part' + i + '.b64'));
const imageSource = (await Promise.all(imageParts.map(path => readFile(path, 'utf8')))).join('').replace(/\\s+/g, '');
const asset = Buffer.from(imageSource, 'base64');
if (asset.length < 10000 || asset.toString('ascii', 0, 4) !== 'RIFF') {
  throw new Error('[motion-online-39] Missing/corrupt Möbius image');
}
await mkdir(join(site, 'assets', 'images'), { recursive: true });
await writeFile(join(site, 'assets', 'images', 'komo-motion-online-mobius-39.webp'), asset);

const copy = {
  fr: {
    eyebrow: 'KŌMØ · LANCEMENT MOTION ONLINE',
    title: 'Votre bilan Motion. <em>Où vous voulez.</em>',
    body: 'Un parcours fonctionnel non médical accessible depuis chez vous : questionnaires, tests de mouvement et restitution dans Pulse. Commencez après votre paiement sécurisé.',
    cta: 'Accéder au bilan en ligne · 39 €',
    note: '39 € · paiement unique · accès Pulse après paiement',
    alt: 'Affiche KŌMØ Longevity in Motion Online, anneau de Möbius bronze, lancement à 39 euros'
  },
  en: {
    eyebrow: 'KŌMØ · MOTION ONLINE LAUNCH',
    title: 'Understand your movement. <em>Wherever you are.</em>',
    body: 'A non-medical functional assessment from home: questionnaires, guided movement tasks and a personal summary in Pulse. Start after secure checkout.',
    cta: 'Start Motion Online · €39',
    note: '€39 · one-time payment · Pulse access after checkout',
    alt: 'KŌMØ Longevity in Motion Online launch poster with bronze Möbius ring and 39 euro offer'
  },
  es: {
    eyebrow: 'KŌMØ · LANZAMIENTO MOTION ONLINE',
    title: 'Conoce tu movimiento. <em>Desde cualquier lugar.</em>',
    body: 'Una evaluación funcional no médica desde casa: cuestionarios, pruebas de movimiento y resumen personal en Pulse. Empieza después del pago seguro.',
    cta: 'Empezar Motion Online · 39 €',
    note: '39 € · pago único · acceso a Pulse tras pagar',
    alt: 'Cartel KŌMØ Longevity in Motion Online con anillo de Möbius bronce y oferta de 39 euros'
  }
};
const css = `<style id="komo-motion-online-39-style">
.k39-launch{background:#ece7df;color:#29231f;padding:clamp(46px,6vw,86px) 0;border-top:1px solid rgba(63,50,42,.1);border-bottom:1px solid rgba(63,50,42,.1)}
.k39-shell{width:min(1100px,calc(100% - 40px));margin:auto;display:grid;grid-template-columns:minmax(240px,.78fr) minmax(0,1fr);gap:clamp(30px,7vw,100px);align-items:center}
.k39-visual{display:block;width:min(100%,375px);justify-self:center;overflow:hidden;border-radius:5px;box-shadow:0 20px 50px rgba(46,29,20,.16);line-height:0;transition:transform .28s ease,box-shadow .28s ease;outline-offset:6px}
.k39-visual:hover,.k39-visual:focus-visible{transform:translateY(-4px);box-shadow:0 28px 60px rgba(46,29,20,.23)}
.k39-visual img{width:100%;height:auto;display:block;aspect-ratio:2/3;object-fit:cover}
.k39-ey{font-size:11px;letter-spacing:.18em;font-weight:700;color:#877263;margin:0 0 22px}
.k39-copy h2{font:400 clamp(38px,4.7vw,70px)/1.02 Georgia,'Times New Roman',serif;letter-spacing:-.052em;margin:0;max-width:650px}
.k39-copy h2 em{color:#9b7966;font-weight:400}
.k39-body{font-size:clamp(15px,1.5vw,18px);line-height:1.7;max-width:520px;color:#5e5751;margin:25px 0 26px}
.k39-action{display:inline-flex;align-items:center;justify-content:center;min-height:52px;padding:13px 25px;border-radius:999px;background:#28211e;color:#fff!important;text-decoration:none;font-size:13px;font-weight:700;transition:background .2s ease,transform .2s ease}
.k39-action:hover,.k39-action:focus-visible{background:#775b4d;transform:translateY(-2px)}
.k39-note{display:block;color:#766c64;margin-top:14px;font-size:11px;line-height:1.6}
@media(max-width:760px){.k39-shell{grid-template-columns:1fr;gap:30px}.k39-launch{padding:48px 0 54px}.k39-visual{width:min(100%,335px)}.k39-copy{text-align:center}.k39-copy h2{font-size:clamp(35px,9vw,50px)}.k39-body{margin:19px auto 22px}.k39-ey{margin-bottom:12px}}
@media(prefers-reduced-motion:reduce){.k39-visual,.k39-action{transition:none}.k39-visual:hover,.k39-action:hover{transform:none}}
</style>`;

for (const [path, lang] of [['index.html','fr'],['fr/index.html','fr'],['en/index.html','en'],['es/index.html','es']]) {
  const file = join(site, path);
  let html = await readFile(file, 'utf8');
  if (!html.includes('class="ko-services"') || !html.includes('id="motion-online-explained"')) {
    throw new Error('[motion-online-39] Expected storefront/explainer missing: ' + path);
  }
  // Update price in the commercial home only, including title, card, schema and
  // explainer. In-person prices and all account/medical pages are untouched.
  html = html.replace(/(?<![0-9])49\\s*(?:€|&euro;)/g, '39 €')
             .replace(/€\\s*49(?![0-9])/g, '€39');
  html = html.replace(/https:\/\/app\\.acuityscheduling\\.com\/schedule\\.php\\?owner=40696577(?:&amp;|&)appointmentType=99940918/g, stripe);
  // A paid asynchronous flow must not claim Acuity is the online checkout.
  if (lang === 'fr') {
    html = html.replaceAll('Réservation via Acuity, suivi dans Pulse.', 'Paiement sécurisé via Stripe et accès au parcours Pulse.')
               .replaceAll('2 · Je reçois la confirmation Acuity', '2 · Je reçois la confirmation Stripe');
  } else if (lang === 'en') {
    html = html.replaceAll('Book with Acuity and prepare in Pulse.', 'Secure checkout with Stripe, then continue in Pulse.')
               .replaceAll('2 · Receive Acuity confirmation', '2 · Receive Stripe confirmation');
  } else {
    html = html.replaceAll('Reserva con Acuity y prepárate en Pulse.', 'Pago seguro con Stripe y acceso al recorrido Pulse.')
               .replaceAll('2 · Recibo la confirmación Acuity', '2 · Recibo la confirmación de Stripe');
  }
  const c = copy[lang];
  const launch = `<section class="k39-launch" id="motion-online-39" aria-labelledby="k39-title"><div class="k39-shell"><a class="k39-visual" href="${stripe}" aria-label="${c.cta}" data-motion-online-checkout="stripe"><img src="${imageUrl}" width="400" height="600" loading="lazy" decoding="async" alt="${c.alt}"></a><div class="k39-copy"><p class="k39-ey">${c.eyebrow}</p><h2 id="k39-title">${c.title}</h2><p class="k39-body">${c.body}</p><a class="k39-action" href="${stripe}" data-motion-online-checkout="stripe">${c.cta} →</a><small class="k39-note">${c.note}</small></div></div></section>`;
  if (!html.includes('id="motion-online-39"')) {
    html = html.replace('<section class="komo-online-explainer"', launch + '\\n<section class="komo-online-explainer"');
  }
  if (!html.includes('id="komo-motion-online-39-style"')) {
    html = html.replace('</head>', css + '\\n</head>');
  }
  if (!html.includes('id="motion-online-39"') || !html.includes('href="' + stripe + '"') || /(?<![0-9])49\\s*€|€\\s*49/.test(html)) {
    throw new Error('[motion-online-39] Price/CTA verification failed: ' + path);
  }
  await writeFile(file, html, 'utf8');
  console.log('[motion-online-39] PASS ' + path);
}
