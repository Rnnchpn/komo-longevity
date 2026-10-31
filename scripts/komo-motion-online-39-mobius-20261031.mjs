import { access, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// Final KŌMØ Motion Online storefront release: price, direct Stripe entry,
// and a lightweight Möbius launch artwork. Does not change Pulse payment verification.
const root = process.cwd();
const site = join(root, 'site');
const stripe = 'https://buy.stripe.com/fZucN6bUTeTCd4B4EX0VO00';
const imageUrl = '/assets/images/komo-motion-online-mobius-39.svg';
await access(join(site, 'assets', 'images', 'komo-motion-online-mobius-39.svg'));

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
  html = html.replace(/(?<![0-9])49\s*(?:€|&euro;)/g, '39 €')
             .replace(/€\s*49(?![0-9])/g, '€39');
  html = html.replace(/https:\/\/app\.acuityscheduling\.com\/schedule\.php\?owner=40696577(?:&amp;|&)appointmentType=99940918/g, stripe);
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
    html = html.replace('<section class="komo-online-explainer"', launch + '\n<section class="komo-online-explainer"');
  }
  if (!html.includes('id="komo-motion-online-39-style"')) {
    html = html.replace('</head>', css + '\n</head>');
  }
  if (!html.includes('id="motion-online-39"') || !html.includes('href="' + stripe + '"') || /(?<![0-9])49\s*€|€\s*49/.test(html)) {
    throw new Error('[motion-online-39] Price/CTA verification failed: ' + path);
  }
  await writeFile(file, html, 'utf8');
  console.log('[motion-online-39] PASS ' + path);
}


// KŌMØ Motion Online editorial landing, after all commercial storefront passes.
await (async function landingPatch() {
  const { mkdir, readFile, writeFile } = await import('node:fs/promises');
  const { join } = await import('node:path');
  const siteRoot = join(process.cwd(), 'site');
  const checkoutUrl = 'https://buy.stripe.com/fZucN6bUTeTCd4B4EX0VO00';
  const imageUrl = '/assets/images/komo-motion-online-mobius-39.svg';
  const route = {
    fr: '/bilan-en-ligne/',
    en: '/en/motion-online/',
    es: '/es/motion-online/'
  };
  const copy = {
    fr: {
      htmlLang: 'fr', title: 'Bilan Motion en ligne à 39 € | KŌMØ Longevity',
      description: 'Découvrez KŌMØ Motion Online : questionnaire, tests fonctionnels simples à domicile, synthèse de mobilité dans Pulse. Bilan non médical, 39 € en paiement unique.',
      back: 'Retour au site', menu: 'Le parcours', inclusion: 'Ce qui est inclus', faq: 'Questions fréquentes',
      eyebrow: 'KŌMØ  /  LONGEVITY IN MOTION', headline: 'Votre mouvement.<br><em>Votre point de départ.</em>',
      subhead: 'Un bilan fonctionnel à réaliser chez vous, à votre rythme. Découvrez votre mobilité à travers des questionnaires et des mouvements guidés, puis identifiez des pistes concrètes pour progresser.',
      discover: 'Comprendre le bilan', price: '39 €', once: 'Paiement unique', pace: 'À votre rythme', noslot: 'Sans rendez-vous imposé',
      disclaimer: 'Évaluation fonctionnelle non médicale. Ni diagnostic, ni prescription, ni prédiction de l’espérance de vie.',
      reasonEy: 'POURQUOI KŌMØ MOTION ?', reasonTitle: 'L’essentiel se mesure aussi dans les gestes du quotidien.',
      reasonDesc: 'Se relever, s’équilibrer et bouger avec aisance participent à l’autonomie fonctionnelle. Les observer dans des conditions simples aide à établir un repère personnel, avec les limites propres à une évaluation à distance.',
      dimensions: [
        ['01','Mobilité','Observer des mouvements utiles au quotidien et les difficultés ressenties.'],
        ['02','Force fonctionnelle','Explorer la capacité à se relever et à répéter certains gestes simples.'],
        ['03','Équilibre & posture','Décrire le contrôle postural observable, sans mesure radiographique.'],
        ['04','Votre ressenti','Prendre en compte activité, sommeil, douleur et objectifs personnels.']
      ],
      includedEy: 'LE CONTENU', includedTitle: 'Un parcours structuré. Pas un simple questionnaire.',
      includedBody: 'Le bilan associe vos réponses à des épreuves fonctionnelles guidées, réalisables dans un espace dégagé avec un appareil compatible. Les résultats disponibles sont présentés avec leurs limites.',
      included: ['Questionnaires de mobilité, d’habitudes et d’objectifs', 'Tests de mouvement et d’équilibre avec consignes de sécurité', 'Synthèse descriptive dans votre environnement KŌMØ Pulse', 'Repères prioritaires et pistes de suivi adaptées aux observations'],
      safety: 'Les mesures par caméra sont expérimentales et peuvent être indisponibles selon l’appareil ou la qualité de la capture. Aucun score biologique ou pronostic de longévité validé n’est promis.',
      stepsEy: 'COMMENT ÇA MARCHE ?', stepsTitle: 'Simple, depuis chez vous.',
      steps: [
        ['01','Découvrez le parcours','Prenez connaissance du contenu et vérifiez que le bilan correspond à votre besoin.'],
        ['02','Réglez 39 € de manière sécurisée','Le règlement s’effectue sur Stripe, sur une page distincte de KŌMØ.'],
        ['03','Activez votre accès Pulse','L’accès à la séance nécessite un compte et une vérification du paiement. Il n’est pas nécessaire de réserver un créneau pour ce format autonome.'],
        ['04','Réalisez le bilan','Suivez les consignes, réalisez les tests qui vous sont possibles et consultez les observations disponibles.']
      ],
      deliverEy: 'APRÈS LE BILAN', deliverTitle: 'Comprendre aujourd’hui. Suivre demain.',
      deliverDesc: 'Vos résultats constituent un point de départ fonctionnel. Vous pourrez envisager une réévaluation ou un bilan instrumenté auprès d’une équipe KŌMØ, selon vos objectifs et les disponibilités.',
      paymentEy: 'KŌMØ MOTION ONLINE', paymentTitle: 'Commencez par mieux vous connaître.',
      paymentText: '39 € pour le bilan en ligne. Paiement unique, sans abonnement lié à cet achat.',
      payBtn: 'Poursuivre vers Stripe · 39 €',
      paymentCaution: 'L’accès au bilan dépend de la confirmation du paiement et de l’activation du compte Pulse. Si votre accès n’est pas disponible après achat, contactez contact@komolongevity.com. Il ne s’agit pas d’une consultation médicale.',
      faqTitle: 'Avant de commencer',
      faqs: [
        ['Dois-je prendre rendez-vous ?', 'Non, le format Motion Online est conçu pour être réalisé en autonomie, sans créneau de visioconférence obligatoire.'],
        ['Ai-je besoin de matériel ?', 'Un appareil compatible avec caméra, une connexion Internet et un espace dégagé suffisent pour les étapes proposées. Certains tests peuvent ne pas être réalisables dans toutes les situations.'],
        ['Est-ce un acte médical ?', 'Non. Cette évaluation fonctionnelle ne remplace pas une consultation, un diagnostic ou une prise en charge médicale. En cas de symptôme inquiétant, consultez un professionnel de santé.'],
        ['Quand mon accès est-il actif ?', 'Une vérification du paiement et de votre compte Pulse est nécessaire. L’activation automatique n’est pas garantie immédiatement. Pour toute difficulté : contact@komolongevity.com.']
      ],
      legal: 'Informations & conditions', copyright: 'KŌMØ Longevity · Longevity in Motion', home: '/'
    },
    en: {
      htmlLang:'en',title:'Online Motion Assessment · €39 | KŌMØ Longevity',
      description:'Explore the KŌMØ Motion Online functional assessment: self-guided questionnaires, simple movement tasks and a descriptive Pulse summary. Non-medical, €39 one-time payment.',
      back:'Back to website',menu:'How it works',inclusion:'Included',faq:'FAQ',
      eyebrow:'KŌMØ  /  LONGEVITY IN MOTION',headline:'Your movement.<br><em>Your starting point.</em>',
      subhead:'A self-guided functional assessment from home. Explore everyday movement through questionnaires and guided tasks, then identify practical next steps.',
      discover:'Explore the assessment',price:'€39',once:'One-time payment',pace:'At your own pace',noslot:'No scheduled appointment',
      disclaimer:'Non-medical functional assessment. No diagnosis, prescription or lifespan prediction.',
      reasonEy:'WHY KŌMØ MOTION?',reasonTitle:'Everyday movements tell part of the story.',
      reasonDesc:'Standing up, balancing and moving comfortably contribute to functional independence. Simple observations can establish a personal starting point, within the limits of a remote assessment.',
      dimensions:[
        ['01','Mobility','Explore everyday movement and perceived difficulty.'],
        ['02','Functional strength','Observe simple sit-to-stand and repetition tasks.'],
        ['03','Balance & posture','Describe visible postural control, not radiographic measures.'],
        ['04','Your perspective','Consider activity, sleep, pain and personal goals.']
      ],
      includedEy:'WHAT IS INCLUDED',includedTitle:'More than a questionnaire.',
      includedBody:'Your answers are paired with guided functional tasks in a clear space using a compatible device. Available results are explained with their limitations.',
      included:['Mobility and lifestyle questionnaires','Guided movement and balance tasks with safety instructions','Descriptive summary in KŌMØ Pulse','Priorities and potential follow-up directions'],
      safety:'Camera-based observations are experimental and may be unavailable depending on device and capture quality. No validated biological age or lifespan prediction is provided.',
      stepsEy:'HOW IT WORKS',stepsTitle:'Simple, from home.',
      steps:[
        ['01','Explore the assessment','Review what is included and whether it fits your needs.'],
        ['02','Securely pay €39','Payment takes place on a separate Stripe checkout page.'],
        ['03','Activate Pulse access','A Pulse account and payment verification are required. No live appointment slot is needed for this self-guided format.'],
        ['04','Complete your assessment','Follow the instructions, perform appropriate tasks and review available observations.']
      ],
      deliverEy:'AFTERWARDS',deliverTitle:'Understand today. Track tomorrow.',
      deliverDesc:'Use your observations as a functional baseline. Depending on your goals, you may request a follow-up or instrumented in-person assessment, subject to availability.',
      paymentEy:'KŌMØ MOTION ONLINE',paymentTitle:'Start with understanding your movement.',
      paymentText:'€39 for the online assessment. One-time payment; no subscription included.',
      payBtn:'Continue to Stripe · €39',
      paymentCaution:'Pulse access requires payment verification and account activation and may not be immediate. For assistance contact contact@komolongevity.com. This is not a medical consultation.',
      faqTitle:'Before you start',
      faqs:[
        ['Do I need to book an appointment?','No. Motion Online is designed as a self-guided assessment without a mandatory live video appointment.'],
        ['Do I need special equipment?','A compatible camera-equipped device, internet access and clear space are needed. Not all tasks are suitable for every person.'],
        ['Is this medical care?','No. It does not replace medical evaluation, diagnosis or treatment. If you have concerning symptoms, consult a healthcare professional.'],
        ['When will my account be active?','Your payment and Pulse account need verification. Immediate automatic activation is not guaranteed. Contact contact@komolongevity.com for help.']
      ],
      legal:'Information & terms',copyright:'KŌMØ Longevity · Longevity in Motion',home:'/en/'
    },
    es: {
      htmlLang:'es',title:'Evaluación Motion online · 39 € | KŌMØ Longevity',
      description:'Descubre KŌMØ Motion Online: cuestionarios, pruebas de movimiento guiadas y resumen funcional en Pulse. Evaluación no médica, pago único de 39 €.',
      back:'Volver al sitio',menu:'Cómo funciona',inclusion:'Contenido',faq:'Preguntas',
      eyebrow:'KŌMØ  /  LONGEVITY IN MOTION',headline:'Tu movimiento.<br><em>Tu punto de partida.</em>',
      subhead:'Una evaluación funcional autónoma desde casa, a tu ritmo. Explora tu movilidad con cuestionarios y movimientos guiados para identificar próximos pasos.',
      discover:'Conocer la evaluación',price:'39 €',once:'Pago único',pace:'A tu ritmo',noslot:'Sin cita obligatoria',
      disclaimer:'Evaluación funcional no médica. Sin diagnóstico, prescripción ni predicción de longevidad.',
      reasonEy:'¿POR QUÉ KŌMØ MOTION?',reasonTitle:'Los movimientos cotidianos también importan.',
      reasonDesc:'Levantarse, equilibrarse y moverse con soltura favorecen la autonomía funcional. La observación a distancia establece una referencia individual con limitaciones.',
      dimensions:[
        ['01','Movilidad','Observar gestos diarios y dificultades percibidas.'],
        ['02','Fuerza funcional','Explorar movimientos de levantarse y repeticiones sencillas.'],
        ['03','Equilibrio y postura','Describir el control postural visible, sin medición radiográfica.'],
        ['04','Tu experiencia','Considerar actividad, sueño, dolor y objetivos personales.']
      ],
      includedEy:'QUÉ INCLUYE',includedTitle:'Más que un cuestionario.',
      includedBody:'El recorrido combina respuestas con movimientos funcionales guiados mediante un dispositivo compatible. Las observaciones disponibles se explican con sus límites.',
      included:['Cuestionarios de movilidad, hábitos y objetivos','Pruebas guiadas de movimiento y equilibrio con instrucciones de seguridad','Resumen descriptivo en KŌMØ Pulse','Prioridades y posibles próximos pasos'],
      safety:'Las observaciones con cámara son experimentales y pueden no estar disponibles. No se ofrece una edad biológica o predicción de longevidad validada.',
      stepsEy:'¿CÓMO FUNCIONA?',stepsTitle:'Simple, desde casa.',
      steps:[
        ['01','Descubre el recorrido','Revisa el contenido y comprueba que se ajusta a tus necesidades.'],
        ['02','Paga 39 € de forma segura','El pago se realiza en una página independiente de Stripe.'],
        ['03','Activa tu acceso a Pulse','Se requiere una cuenta Pulse y la verificación del pago. No necesitas reservar una videollamada.'],
        ['04','Realiza la evaluación','Sigue las instrucciones, completa los movimientos posibles y consulta las observaciones.']
      ],
      deliverEy:'DESPUÉS',deliverTitle:'Comprender hoy. Seguir mañana.',
      deliverDesc:'Usa las observaciones como punto de partida. Puedes considerar una nueva evaluación o una sesión presencial con instrumentos según los objetivos y disponibilidad.',
      paymentEy:'KŌMØ MOTION ONLINE',paymentTitle:'Empieza a conocer tu movimiento.',
      paymentText:'39 € por la evaluación online. Pago único, sin suscripción.',
      payBtn:'Continuar a Stripe · 39 €',
      paymentCaution:'El acceso a Pulse requiere la verificación del pago y la activación de la cuenta; puede no ser inmediato. Ayuda: contact@komolongevity.com. No es una consulta médica.',
      faqTitle:'Antes de empezar',
      faqs:[
        ['¿Necesito una cita?','No. Motion Online está pensado para realizarse de forma autónoma, sin cita de vídeo obligatoria.'],
        ['¿Necesito equipamiento?','Un dispositivo compatible con cámara, Internet y espacio libre. Algunas pruebas no son adecuadas para todos.'],
        ['¿Es una consulta médica?','No. No sustituye valoración, diagnóstico ni tratamiento médico. Si aparecen síntomas preocupantes, consulta a un profesional de salud.'],
        ['¿Cuándo se activa el acceso?','Es necesario verificar el pago y la cuenta Pulse. No se garantiza la activación automática inmediata. Ayuda: contact@komolongevity.com.']
      ],
      legal:'Información y condiciones',copyright:'KŌMØ Longevity · Longevity in Motion',home:'/es/'
    }
  };
  const style = `
:root{color-scheme:light;--ink:#252727;--muted:#646663;--cream:#f5f2eb;--paper:#fffefa;--sand:#e9dfd3;--line:rgba(46,45,42,.14);--bronze:#a47e69}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--cream);color:var(--ink);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}
a{color:inherit}button,a{-webkit-tap-highlight-color:transparent}a:focus-visible{outline:3px solid #aa7555;outline-offset:4px}
.lp-skip{position:absolute;top:-80px;left:8px;z-index:9;background:#fff;padding:12px}.lp-skip:focus{top:8px}
.lp-container{width:min(1160px,calc(100% - 54px));margin:auto}.lp-header{position:sticky;top:0;z-index:5;background:rgba(245,242,235,.95);backdrop-filter:blur(20px);border-bottom:1px solid var(--line)}
.lp-nav{display:flex;align-items:center;justify-content:space-between;min-height:78px;gap:24px}.lp-logo{font-family:Georgia,serif;font-size:28px;letter-spacing:.13em;text-decoration:none;white-space:nowrap}
.lp-links{display:flex;align-items:center;gap:28px;font-size:12px;font-weight:600}.lp-links a{text-decoration:none}.lp-links a:hover{text-decoration:underline}
.lp-navcta{border:1px solid var(--ink);border-radius:99px;padding:13px 20px;white-space:nowrap}
.lp-hero{padding:82px 0 84px;background:#ede8df;overflow:hidden}.lp-hero-grid{display:grid;grid-template-columns:1.22fr .78fr;gap:clamp(35px,6vw,90px);align-items:center}
.lp-ey{color:#8a715f;font-size:11px;letter-spacing:.2em;font-weight:800;margin:0 0 28px}.lp-h1,.lp-heading,.lp-purchase h2{font-family:"Iowan Old Style",Baskerville,Georgia,serif;font-weight:400;letter-spacing:-.052em}
.lp-h1{font-size:clamp(56px,6.5vw,100px);line-height:.98;margin:0}.lp-h1 em{font-weight:400;color:#9a7966}
.lp-lead{font-size:clamp(16px,1.6vw,19px);color:#5b5955;line-height:1.72;max-width:620px;margin:32px 0}
.lp-pill-row{display:flex;flex-wrap:wrap;gap:10px;margin:26px 0}.lp-pill{border:1px solid #c9c0b7;border-radius:99px;padding:11px 16px;font-size:12px;font-weight:600}
.lp-primary{display:inline-flex;align-items:center;justify-content:center;gap:14px;background:var(--ink);color:white;text-decoration:none;padding:17px 26px;border-radius:99px;font-size:13px;font-weight:700;min-height:52px;transition:transform .2s,background .2s}.lp-primary:hover{background:#6c5549;transform:translateY(-2px)}
.lp-hero-note{font-size:11px;line-height:1.65;color:#6b6965;margin-top:22px;max-width:560px}
.lp-art{margin:0;max-width:390px;justify-self:center;position:relative}.lp-art img{display:block;width:100%;height:auto;box-shadow:0 24px 80px rgba(61,45,29,.16);border-radius:5px}.lp-art:after{content:"";position:absolute;z-index:-1;inset:12% -13% -8% 13%;border:1px solid #bbab99;border-radius:50%}
.lp-band{background:#252727;color:#f6f3ee}.lp-band-grid{display:flex;justify-content:space-between;align-items:center;gap:24px;padding:24px 0}.lp-band span{font-size:11px;font-weight:600;letter-spacing:.13em;text-transform:uppercase}
.lp-section{padding:100px 0}.lp-kicker{color:#a17a63;font-size:11px;font-weight:800;letter-spacing:.18em;margin:0 0 18px}.lp-heading{font-size:clamp(43px,5vw,71px);line-height:1.07;max-width:880px;margin:0 0 27px}
.lp-intro{font-size:16px;line-height:1.8;color:#62635e;max-width:790px;margin:0 0 48px}.lp-reasons{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:25px}
.lp-reason{padding:23px 0;border-top:1px solid #b7b1a8}.lp-index{font-size:11px;color:#9d7865;font-weight:800;letter-spacing:.14em}.lp-reason h3{font:400 26px/1.12 Georgia,serif;letter-spacing:-.025em;margin:24px 0 14px}.lp-reason p{color:#62635e;font-size:13px;line-height:1.68;margin:0}
.lp-included{background:#fdfbf6}.lp-included-grid{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:start}.lp-checks{list-style:none;margin:16px 0;padding:0}.lp-checks li{padding:20px 0 20px 33px;position:relative;border-bottom:1px solid var(--line);font-size:15px;line-height:1.55}.lp-checks li:before{content:"✓";position:absolute;left:0;color:#946f5d}
.lp-smallnote{font-size:12px;line-height:1.7;color:#77736d;margin:28px 0}
.lp-steps{background:#eae3d9}.lp-steps-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:15px;margin-top:44px}
.lp-step{background:#f9f6ef;border:1px solid rgba(50,45,40,.11);padding:34px;border-radius:7px;min-height:220px}
.lp-step h3{font:400 27px/1.18 Georgia,serif;margin:25px 0 13px}.lp-step p{font-size:13px;line-height:1.72;color:#67645f;margin:0}
.lp-deliver{display:grid;grid-template-columns:1fr 1fr;align-items:center;gap:80px}.lp-deliver .lp-intro{margin-bottom:0}.lp-abstract{min-height:270px;border-radius:150px 150px 14px 14px;background:radial-gradient(ellipse at 35% 45%,#e8d1be 0,transparent 47%),linear-gradient(135deg,#c1a58d,#6d6964 74%);position:relative;overflow:hidden}.lp-abstract:before{content:"";position:absolute;inset:30px 22%;border:1px solid #fff9;border-radius:50%;transform:rotate(35deg)}
.lp-purchase{background:#282727;color:#fffaf5;padding:96px 0}.lp-purchase-grid{display:grid;grid-template-columns:1.3fr .7fr;gap:60px;align-items:center}.lp-purchase h2{font-size:clamp(46px,5.6vw,78px);line-height:1.04;margin:0 0 23px}.lp-purchase p{font-size:15px;line-height:1.75;color:#d9d5d0}.lp-price-card{background:#f2eee6;color:var(--ink);padding:35px;border-radius:8px;text-align:center}.lp-price{font:400 76px/1 Georgia,serif;letter-spacing:-.05em}.lp-price-card p{color:#675e57;font-size:13px}.lp-price-card .lp-primary{width:100%;margin-top:8px}.lp-caution{font-size:11px!important;line-height:1.65!important;color:#7a736b!important;margin:20px 0 0}
.lp-faq{background:#fffefa}.lp-faq details{border-bottom:1px solid var(--line);padding:24px 0}.lp-faq summary{cursor:pointer;font-weight:650;font-size:16px;list-style-position:outside}.lp-faq details p{font-size:14px;color:#62635e;line-height:1.75;max-width:780px}
.lp-footer{background:#ede9e2;border-top:1px solid var(--line);padding:37px 0}.lp-footer-inner{display:flex;justify-content:space-between;gap:25px;align-items:center;font-size:12px;color:#69645f}.lp-footer a{text-underline-offset:4px}
@media(max-width:840px){.lp-links a:not(.lp-navcta){display:none}.lp-hero-grid{grid-template-columns:1fr 290px;gap:28px}.lp-h1{font-size:clamp(50px,7vw,78px)}.lp-reasons{grid-template-columns:repeat(2,1fr)}.lp-included-grid{gap:35px}.lp-purchase-grid{gap:30px}}
@media(max-width:660px){.lp-container{width:calc(100% - 34px)}.lp-nav{min-height:66px}.lp-logo{font-size:23px}.lp-navcta{padding:10px 13px;font-size:11px}.lp-hero{padding:53px 0}.lp-hero-grid{grid-template-columns:1fr}.lp-art{grid-row:1;width:min(62%,225px);margin:0 auto 5px}.lp-h1{font-size:clamp(47px,12vw,69px)}.lp-ey{margin-bottom:17px}.lp-lead{font-size:15px;margin:22px 0}.lp-band-grid{display:grid;grid-template-columns:1fr 1fr;row-gap:13px;padding:20px 0}.lp-band span{font-size:10px}.lp-section{padding:65px 0}.lp-heading{font-size:clamp(40px,10vw,57px)}.lp-reasons,.lp-included-grid,.lp-steps-grid,.lp-deliver,.lp-purchase-grid{grid-template-columns:1fr}.lp-reasons{gap:17px}.lp-included-grid,.lp-deliver{gap:25px}.lp-step{min-height:0;padding:27px}.lp-purchase{padding:70px 0}.lp-price-card{padding:28px 21px}.lp-footer-inner{flex-direction:column;align-items:flex-start}.lp-abstract{min-height:180px}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}.lp-primary{transition:none}.lp-primary:hover{transform:none}}
`;
  const canon = 'https://komolongevity.com';
  function render(lang) {
    const c = copy[lang];
    const here = canon + route[lang];
    const localeLinks = `<link rel="alternate" hreflang="fr" href="${canon+route.fr}"><link rel="alternate" hreflang="en" href="${canon+route.en}"><link rel="alternate" hreflang="es" href="${canon+route.es}"><link rel="alternate" hreflang="x-default" href="${canon+route.fr}">`;
    const dimensions = c.dimensions.map(([n,t,p])=>`<article class="lp-reason"><small class="lp-index">${n} / 04</small><h3>${t}</h3><p>${p}</p></article>`).join('');
    const steps = c.steps.map(([n,t,p])=>`<article class="lp-step"><small class="lp-index">${n} / 04</small><h3>${t}</h3><p>${p}</p></article>`).join('');
    const included = c.included.map(x=>`<li>${x}</li>`).join('');
    const faq = c.faqs.map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join('');
    return `<!doctype html><html lang="${c.htmlLang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f5f2eb"><title>${c.title}</title><meta name="description" content="${c.description}"><link rel="canonical" href="${here}">${localeLinks}<meta property="og:type" content="website"><meta property="og:title" content="${c.title}"><meta property="og:description" content="${c.description}"><meta property="og:url" content="${here}"><meta property="og:image" content="${canon+imageUrl}"><meta name="twitter:card" content="summary_large_image"><style>${style}</style></head>
<body><a class="lp-skip" href="#main">Skip to content</a><header class="lp-header"><nav class="lp-container lp-nav" aria-label="Navigation"><a class="lp-logo" href="${c.home}" aria-label="KŌMØ">KŌMØ</a><div class="lp-links"><a href="#pourquoi">${c.inclusion}</a><a href="#parcours">${c.menu}</a><a href="#questions">${c.faq}</a><a class="lp-navcta" href="#tarif">${c.price} · ${c.once}</a></div></nav></header>
<main id="main"><section class="lp-hero"><div class="lp-container lp-hero-grid"><div><p class="lp-ey">${c.eyebrow}</p><h1 class="lp-h1">${c.headline}</h1><p class="lp-lead">${c.subhead}</p><div class="lp-pill-row"><span class="lp-pill">${c.price}</span><span class="lp-pill">${c.pace}</span><span class="lp-pill">${c.noslot}</span></div><a class="lp-primary" href="#parcours">${c.discover} <span aria-hidden="true">↗</span></a><p class="lp-hero-note">${c.disclaimer}</p></div><figure class="lp-art"><img src="${imageUrl}" alt="KŌMØ Motion Online — Möbius" width="400" height="600" decoding="async"></figure></div></section>
<div class="lp-band"><div class="lp-container lp-band-grid"><span>KŌMØ Motion Online</span><span>${c.pace}</span><span>${c.once}</span><span>Longevity in Motion</span></div></div>
<section class="lp-section" id="pourquoi"><div class="lp-container"><p class="lp-kicker">${c.reasonEy}</p><h2 class="lp-heading">${c.reasonTitle}</h2><p class="lp-intro">${c.reasonDesc}</p><div class="lp-reasons">${dimensions}</div></div></section>
<section class="lp-section lp-included" id="inclus"><div class="lp-container lp-included-grid"><div><p class="lp-kicker">${c.includedEy}</p><h2 class="lp-heading">${c.includedTitle}</h2><p class="lp-intro">${c.includedBody}</p></div><div><ul class="lp-checks">${included}</ul><p class="lp-smallnote">${c.safety}</p></div></div></section>
<section class="lp-section lp-steps" id="parcours"><div class="lp-container"><p class="lp-kicker">${c.stepsEy}</p><h2 class="lp-heading">${c.stepsTitle}</h2><div class="lp-steps-grid">${steps}</div></div></section>
<section class="lp-section"><div class="lp-container lp-deliver"><div><p class="lp-kicker">${c.deliverEy}</p><h2 class="lp-heading">${c.deliverTitle}</h2><p class="lp-intro">${c.deliverDesc}</p></div><div class="lp-abstract" role="img" aria-label="Abstract motion motif"></div></div></section>
<section class="lp-purchase" id="tarif"><div class="lp-container lp-purchase-grid"><div><p class="lp-kicker">${c.paymentEy}</p><h2>${c.paymentTitle}</h2><p>${c.paymentText}</p></div><div class="lp-price-card"><div class="lp-price">${c.price}</div><p>${c.once}</p><a class="lp-primary" href="${checkoutUrl}" rel="noopener noreferrer" data-motion-online-checkout="stripe">${c.payBtn} <span aria-hidden="true">↗</span></a><p class="lp-caution">${c.paymentCaution}</p></div></div></section>
<section class="lp-section lp-faq" id="questions"><div class="lp-container"><p class="lp-kicker">FAQ</p><h2 class="lp-heading">${c.faqTitle}</h2>${faq}</div></section></main>
<footer class="lp-footer"><div class="lp-container lp-footer-inner"><span>${c.copyright}</span><a href="${c.home}">${c.back}</a><a href="mailto:contact@komolongevity.com">contact@komolongevity.com</a></div></footer></body></html>`;
  }
  for (const [path,lang] of [
    ['bilan-en-ligne/index.html','fr'],
    ['fr/bilan-en-ligne/index.html','fr'],
    ['en/motion-online/index.html','en'],
    ['es/motion-online/index.html','es']
  ]) {
    const full = join(siteRoot,path);
    await mkdir(join(siteRoot,path.split('/').slice(0,-1).join('/')), {recursive:true});
    await writeFile(full,render(lang),'utf8');
    console.log('[landing-39] PASS '+path);
  }
  const homepageCopy = {
    fr: {
      desc:'Bilan Motion Online à 39 € en autonomie chez soi : questionnaires, mouvements guidés et synthèse fonctionnelle Pulse. Bilans en présentiel à Paris et Cannes.',
      loc:'CHEZ VOUS · EN AUTONOMIE',duration:'À votre rythme',
      body:'Un bilan fonctionnel non médical à réaliser chez vous : questionnaires, mouvements guidés et synthèse descriptive dans Pulse, sans créneau de visioconférence obligatoire.',
      points:['Questionnaires et objectifs de mobilité','Mouvements fonctionnels à domicile, à votre rythme','Synthèse descriptive et pistes de progression'],
      label:'Découvrir le bilan en ligne',
      flow:['1 · Je découvre le bilan','2 · Je règle 39 € sur Stripe','3 · J’active mon compte Pulse','4 · Je réalise les tests à mon rythme'],
      note:'Motion Online est un bilan autonome non médical. L’accès nécessite une vérification du paiement et l’activation du compte Pulse ; l’activation immédiate n’est pas garantie.',
      launch:'Découvrez les étapes du bilan Motion Online, les tests proposés et la restitution avant de décider de commencer.',
      stepOld:'30 minutes à distance, tarif annoncé de 39 €.',
      stepNew:'Bilan autonome accessible à 39 €, sans horaire imposé.',
      processOld:'Échange de restitution sur les observations obtenues, leurs limites et les prochaines étapes.',
      processNew:'Consultez la synthèse descriptive et les pistes de suivi disponibles dans Pulse.',
      faqOld:'Les tests sont guidés par un opérateur ; la préparation de la caméra ne constitue pas une mesure automatisée validée.',
      faqNew:'Le parcours est autonome. Certaines observations par caméra sont expérimentales et ne constituent pas une mesure diagnostique validée.',
      accessOld:'La réservation commence dans Acuity. Le lien de préparation est public ; l’accès à un dossier personnel nécessite ensuite une activation et une vérification d’identité distinctes.',
      accessNew:'Après votre règlement sur Stripe, une vérification du paiement et de votre identité est nécessaire pour activer l’accès à Pulse.',
      onlineTitle:'Bilan Motion Online', oldHero:'Réserver le bilan en ligne'
    },
    en:{
      desc:'Self-guided KŌMØ Motion Online assessment, €39: questionnaires, guided movement tasks and a descriptive Pulse summary. In-person options in Paris and Cannes.',
      loc:'AT HOME · SELF-GUIDED',duration:'At your own pace',
      body:'A self-guided non-medical functional assessment with questionnaires, movement tasks and descriptive Pulse results. No mandatory video appointment.',
      points:['Mobility questionnaires and personal goals','Simple guided movements at your own pace','Descriptive feedback and possible next steps'],
      label:'Explore the online assessment',
      flow:['1 · Explore the assessment','2 · Pay €39 via Stripe','3 · Activate Pulse access','4 · Complete the guided tasks'],
      note:'Motion Online is a self-guided non-medical assessment. Payment verification and account activation are required; immediate access is not guaranteed.',
      launch:'Explore the tasks, method and expected summary before choosing whether to start.',
      stepOld:'A 30-minute remote appointment listed at €39.',
      stepNew:'A €39 self-guided assessment, with no appointment slot.',
      processOld:'Feedback on observations, limitations and potential next steps.',
      processNew:'Review available descriptive observations and follow-up directions in Pulse.',
      faqOld:'The tests are guided by an operator; preparing the camera is not a validated automated measure.',
      faqNew:'The assessment is self-guided. Camera-based observations are experimental, not validated diagnostic measures.',
      accessOld:'Bookings begin in Acuity. The preparation link is public; personal records require separate activation and identity verification.',
      accessNew:'After Stripe checkout, Pulse access requires account and payment verification.',
      onlineTitle:'Motion Online assessment',oldHero:'Book Online'
    },
    es:{
      desc:'KŌMØ Motion Online por 39 €: evaluación autónoma con cuestionarios, movimientos guiados y resumen descriptivo en Pulse. Opciones presenciales en París y Cannes.',
      loc:'EN CASA · AUTÓNOMO',duration:'A tu ritmo',
      body:'Evaluación funcional no médica desde casa con cuestionarios, movimientos guiados y resumen en Pulse. Sin videollamada obligatoria.',
      points:['Cuestionarios y objetivos de movilidad','Movimientos guiados a tu propio ritmo','Resumen descriptivo y posibles próximos pasos'],
      label:'Descubrir la evaluación online',
      flow:['1 · Descubrir la evaluación','2 · Pagar 39 € con Stripe','3 · Activar Pulse','4 · Realizar las pruebas guiadas'],
      note:'Motion Online es una evaluación autónoma no médica. El acceso requiere verificar pago y cuenta; la activación inmediata no está garantizada.',
      launch:'Descubre el contenido, las pruebas y el resumen antes de decidir comenzar.',
      stepOld:'Una cita a distancia de 30 minutos, anunciada a 39 €.',
      stepNew:'Evaluación autónoma de 39 €, sin horario de cita.',
      processOld:'Explicación de las observaciones, límites y posibles siguientes pasos.',
      processNew:'Consulta las observaciones disponibles y posibles pasos siguientes en Pulse.',
      faqOld:'Las pruebas son guiadas por un operador; preparar la cámara no equivale a una medida automática validada.',
      faqNew:'La evaluación es autónoma. Las observaciones por cámara son experimentales y no equivalen a una medición diagnóstica validada.',
      accessOld:'La reserva empieza en Acuity. La preparación es pública; el expediente personal requiere activación y verificación de identidad.',
      accessNew:'Tras pagar en Stripe, debes verificar el pago y la cuenta para acceder a Pulse.',
      onlineTitle:'Evaluación Motion Online',oldHero:'Reservar Online'
    }
  };
  for (const [path,lang] of [
    ['index.html','fr'],['fr/index.html','fr'],['en/index.html','en'],['es/index.html','es']
  ]) {
    const file = join(siteRoot,path);
    let html=await readFile(file,'utf8');
    const c=homepageCopy[lang];
    if (!html.includes('id="motion-online-39"') || !html.includes('class="ko-card ko-card--online"') || !html.includes(checkoutUrl)) {
      throw new Error('[landing-39] Missing home markers in '+path);
    }
    html=html.replaceAll(checkoutUrl,route[lang]);
    html=html.replace(/<article class="ko-card ko-card--online">[\s\S]*?<\/article>/, card => {
      let n=card.replace(/(<div class="ko-card-top">)[\s\S]*?(<\/div>)/,'$1'+c.loc+'$2');
      n=n.replace(/(<small class="ko-duration">)[\s\S]*?(<\/small>)/,'$1'+c.duration+'$2');
      n=n.replace(/(<p>)[\s\S]*?(<\/p>)/,'$1'+c.body+'$2');
      n=n.replace(/<ul>[\s\S]*?<\/ul>/,'<ul>'+c.points.map(p=>'<li>'+p+'</li>').join('')+'</ul>');
      n=n.replace(/(<a class="ko-action"[^>]*>)[\s\S]*?(<\/a>)/,'$1'+c.label+' ↗$2');
      return n;
    });
    html=html.replace(/<div class="ko-flow-grid">[\s\S]*?<\/div>/,'<div class="ko-flow-grid">'+c.flow.map(s=>'<span>'+s+'</span>').join('')+'</div>');
    html=html.replace(/<p class="ko-note">[\s\S]*?<\/p>/,'<p class="ko-note">'+c.note+'</p>');
    html=html.replace(c.stepOld,c.stepNew).replace(c.processOld,c.processNew);
    html=html.replace(c.faqOld,c.faqNew).replace(c.accessOld,c.accessNew);
    if(lang==='fr'){
      html=html.replaceAll('Réserver le bilan en ligne', 'Découvrir le bilan en ligne');
      html=html.replaceAll('Accéder au bilan en ligne · 39 €','Découvrir le bilan · 39 €');
      html=html.replaceAll('39 € · paiement unique · accès Pulse après paiement','39 € · paiement unique · découvrir avant de payer');
      html=html.replaceAll('Un parcours fonctionnel non médical accessible depuis chez vous : questionnaires, tests de mouvement et restitution dans Pulse. Commencez après votre paiement sécurisé.',c.launch);
      html=html.replaceAll('30 minutes à distance, tarif annoncé de 39 €.',c.stepNew);
    } else if(lang==='en'){
      html=html.replaceAll('Book Online', 'Explore Motion Online');
      html=html.replaceAll('Start Motion Online · €39','Explore Motion Online · €39');
      html=html.replaceAll('€39 · one-time payment · Pulse access after checkout','€39 · one-time payment · discover before paying');
      html=html.replaceAll('A non-medical functional assessment from home: questionnaires, guided movement tasks and a personal summary in Pulse. Start after secure checkout.',c.launch);
    } else {
      html=html.replaceAll('Reservar Online', 'Descubrir Motion Online');
      html=html.replaceAll('Empezar Motion Online · 39 €','Descubrir Motion Online · 39 €');
      html=html.replaceAll('39 € · pago único · acceso a Pulse tras pagar','39 € · pago único · conoce el recorrido antes de pagar');
      html=html.replaceAll('Una evaluación funcional no médica desde casa: cuestionarios, pruebas de movimiento y resumen personal en Pulse. Empieza después del pago seguro.',c.launch);
    }
    html=html.replace(/<meta name="description" content="[^"]*">/,'<meta name="description" content="'+c.desc+'">');
    html=html.replace(/<meta property="og:description" content="[^"]*">/,'<meta property="og:description" content="'+c.desc+'">');
    if(html.includes(checkoutUrl) || !html.includes('href="'+route[lang]+'"'))throw new Error('[landing-39] Homepage CTA verification failed: '+path);
    await writeFile(file,html,'utf8');
    console.log('[landing-39] HOMEPAGE PASS '+path);
  }
})();
