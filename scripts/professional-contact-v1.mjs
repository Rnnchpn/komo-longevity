import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const site = join(root, 'site');
const assetVersion = '20260831-pro-v2';

const copies = {
  en: {
    path: join(site, 'contact', 'index.html'),
    title: 'KŌMØ for Professionals — Partner enquiry',
    description: 'Tell KŌMØ about your clinic, longevity centre, fitness club, hotel, corporate or multi-site project. Explore KŌMØ Case, Pulse, pilots and partner deployment.',
    eyebrow: 'KŌMØ RIVIERA · PROFESSIONAL ENQUIRY',
    badge: 'PARTNER ACCESS',
    heroTitle: 'Request a KŌMØ demo<br><em>for your setting.</em>',
    heroLead: 'For medical centres, longevity clinics, premium hotels, fitness, performance and private partners. Tell us where and how you want to deploy; we will prepare the relevant live demonstration and integration proposal.',
    heroCta: 'Request a demo →',
    proof: ['KŌMØ Case · six Myodev sensors · Pulse', 'Cannes → Antibes → Nice → Monaco → Saint-Tropez', 'Demo · pilot · purchase · multi-site deployment'],
    introEyebrow: 'KŌMØ PRO · PARTNER ONBOARDING',
    introTitle: 'Your site. Your activity.<br><em>One clear next step.</em>',
    introLead: 'This short professional enquiry gives us the information needed to prepare a relevant demonstration or partnership proposal.',
    aside: [
      ['01 · Qualification', 'We review your establishment, city, activity and intended format.'],
      ['02 · Demonstration', 'A live KŌMØ Case / Pulse session shows the measurement pathway in your setting.'],
      ['03 · Integration', 'Pilot, acquisition or multi-site deployment: the model follows your team and venue.']
    ],
    directLabel: 'Direct professional contact',
    formTitle: 'Build your KŌMØ project',
    formLead: 'A guided professional enquiry. No patient health data.',
    time: '≈ 4 MIN',
    sections: ['Contact', 'Establishment', 'Partnership', 'Final details'],
    stepLead: ['Who should we speak with?', 'Where will KŌMØ be deployed, and what is the main activity?', 'Which partnership format do you want to explore, including a live demo?', 'Give us the context needed to prepare the next conversation.'],
    fields: {
      firstName: 'First name *', lastName: 'Last name *', email: 'Professional email *', phone: 'Phone / WhatsApp', role: 'Role / title', organisation: 'Establishment / organisation *', website: 'Website', city: 'City *', country: 'Country *', organisationType: 'Main activity *', sites: 'Number of sites', assessments: 'Expected assessments / month', timeline: 'Deployment horizon', preferredContact: 'Preferred contact', message: 'Tell us what you want to build *'
    },
    placeholders: { message: 'Example: equip a longevity centre, run a founding pilot in a hotel, deploy across several clinics, add a locomotor assessment to an existing pathway…' },
    organisationTypes: [['medical', 'Medical / longevity centre'], ['physician', 'Physician / private practice'], ['fitness', 'Fitness / performance club'], ['hospitality', 'Hotel / spa / resort / retreat'], ['corporate', 'Company / insurer / mutual'], ['sport', 'Sports organisation / team'], ['concierge', 'Private concierge / villa / yacht'], ['distributor', 'Distributor / network'], ['other', 'Other']],
    sites: [['1', '1 site'], ['2-5', '2–5 sites'], ['6-20', '6–20 sites'], ['20+', '20+ sites'], ['na', 'Not defined yet']],
    assessments: [['<10', '< 10 / month'], ['10-30', '10–30 / month'], ['31-100', '31–100 / month'], ['100+', '100+ / month'], ['unknown', 'To define']],
    timeline: [['now', 'Now / < 1 month'], ['1-3', '1–3 months'], ['3-6', '3–6 months'], ['6-12', '6–12 months'], ['explore', 'Exploring']],
    contact: [['email', 'Email'], ['phone', 'Phone'], ['whatsapp', 'WhatsApp'], ['video', 'Video call']],
    interestsTitle: 'Partnership type *',
    interests: [['demo', 'Request a private KŌMØ demo'], ['case_purchase', 'KŌMØ Case — purchase / installation'], ['pilot', 'Founding pilot / operated session'], ['multisite', 'Multi-site deployment'], ['hospitality', 'Hospitality / hotel / retreat'], ['corporate', 'Corporate / workplace health'], ['sport', 'Sport / performance'], ['distribution', 'Distribution / network partnership'], ['other', 'Other partnership']],
    consent: 'I agree that KŌMØ may use the information entered here to review and respond to this professional enquiry. *',
    safety: 'Do not submit patient names, medical records, health results or other sensitive health information through this public form.',
    next: 'Continue →', back: '← Back', submit: 'Send my enquiry →',
    status: 'Your request will be sent to contact@komolongevity.com.',
    successTitle: 'Your enquiry has been sent.',
    successText: 'The KŌMØ team will come back to you to qualify the most relevant model for your organisation.'
  },
  fr: {
    path: join(site, 'fr', 'contact', 'index.html'),
    title: 'KŌMØ Professionnels — Demande de partenariat',
    description: 'Présentez votre projet KŌMØ : médecin, clinique, centre de longévité, fitness premium, hôtel, entreprise ou réseau multi-sites. Case, Pulse, pilote et déploiement partenaire.',
    eyebrow: 'KŌMØ RIVIERA · DEMANDE PROFESSIONNELLE',
    badge: 'ACCÈS PARTENAIRES',
    heroTitle: 'Demandez une démo KŌMØ<br><em>pour votre établissement.</em>',
    heroLead: 'Centres médicaux et de longévité, hôtels premium, fitness, performance et partenaires privés : décrivez où et comment vous souhaitez déployer KŌMØ. Nous préparerons la démonstration et le modèle d’intégration pertinents.',
    heroCta: 'Demander une démo →',
    proof: ['KŌMØ Case · six capteurs Myodev · Pulse', 'Cannes → Antibes → Nice → Monaco → Saint-Tropez', 'Démo · pilote · acquisition · multi-sites'],
    introEyebrow: 'KŌMØ PRO · ONBOARDING PARTENAIRE',
    introTitle: 'Votre établissement.<br><em>Votre activité. La bonne suite.</em>',
    introLead: 'Cette demande professionnelle courte nous donne les éléments utiles pour préparer une démonstration ou une proposition de partenariat adaptée.',
    aside: [
      ['01 · Qualification', 'Nous examinons votre établissement, sa ville, son activité et le format envisagé.'],
      ['02 · Démonstration', 'Une session KŌMØ Case / Pulse en conditions réelles montre le parcours de mesure dans votre environnement.'],
      ['03 · Intégration', 'Pilote, acquisition ou multi-sites : le modèle s’adapte à votre équipe et à votre lieu.']
    ],
    directLabel: 'Contact professionnel direct',
    formTitle: 'Construisons votre projet KŌMØ',
    formLead: 'Une demande professionnelle guidée. Aucune donnée patient.',
    time: '≈ 4 MIN',
    sections: ['Contact', 'Établissement', 'Partenariat', 'Finalisation'],
    stepLead: ['Avec qui devons-nous échanger ?', 'Où KŌMØ serait-il déployé, et quelle est votre activité principale ?', 'Quel type de partenariat souhaitez-vous explorer, y compris une démo en conditions réelles ?', 'Donnez-nous le contexte utile pour préparer le prochain échange.'],
    fields: {
      firstName: 'Prénom *', lastName: 'Nom *', email: 'E-mail professionnel *', phone: 'Téléphone / WhatsApp', role: 'Fonction / titre', organisation: 'Établissement / structure *', website: 'Site internet', city: 'Ville *', country: 'Pays *', organisationType: 'Activité principale *', sites: 'Nombre de sites', assessments: 'Bilans envisagés / mois', timeline: 'Horizon de déploiement', preferredContact: 'Contact préféré', message: 'Décrivez ce que vous souhaitez construire *'
    },
    placeholders: { message: 'Exemple : équiper un centre de longévité, organiser un pilote dans un hôtel, déployer dans plusieurs cliniques, ajouter un bilan locomoteur à un parcours existant…' },
    organisationTypes: [['medical', 'Centre médical / longévité'], ['physician', 'Médecin / cabinet libéral'], ['fitness', 'Club fitness / performance'], ['hospitality', 'Hôtel / spa / resort / retreat'], ['corporate', 'Entreprise / mutuelle / assurance'], ['sport', 'Organisation / équipe sportive'], ['concierge', 'Conciergerie privée / villa / yacht'], ['distributor', 'Distributeur / réseau'], ['other', 'Autre']],
    sites: [['1', '1 site'], ['2-5', '2–5 sites'], ['6-20', '6–20 sites'], ['20+', '20+ sites'], ['na', 'À définir']],
    assessments: [['<10', '< 10 / mois'], ['10-30', '10–30 / mois'], ['31-100', '31–100 / mois'], ['100+', '100+ / mois'], ['unknown', 'À définir']],
    timeline: [['now', 'Maintenant / < 1 mois'], ['1-3', '1–3 mois'], ['3-6', '3–6 mois'], ['6-12', '6–12 mois'], ['explore', 'Exploration']],
    contact: [['email', 'E-mail'], ['phone', 'Téléphone'], ['whatsapp', 'WhatsApp'], ['video', 'Visioconférence']],
    interestsTitle: 'Type de partenariat *',
    interests: [['demo', 'Demander une démonstration KŌMØ privée'], ['case_purchase', 'KŌMØ Case — achat / installation'], ['pilot', 'Pilote fondateur / journée opérée'], ['multisite', 'Déploiement multi-sites'], ['hospitality', 'Hôtellerie / hôtel / retreat'], ['corporate', 'Entreprise / santé au travail'], ['sport', 'Sport / performance'], ['distribution', 'Distribution / partenariat réseau'], ['other', 'Autre partenariat']],
    consent: 'J’accepte que KŌMØ utilise les informations saisies ici afin d’étudier et de répondre à cette demande professionnelle. *',
    safety: 'Ne transmettez aucun nom de patient, dossier médical, résultat de santé ou autre donnée de santé sensible via ce formulaire public.',
    next: 'Continuer →', back: '← Retour', submit: 'Envoyer ma demande →',
    status: 'Votre demande sera adressée à contact@komolongevity.com.',
    successTitle: 'Votre demande a bien été transmise.',
    successText: 'L’équipe KŌMØ reviendra vers vous pour qualifier le modèle le plus adapté à votre structure.'
  },
  es: {
    path: join(site, 'es', 'contact', 'index.html'),
    title: 'KŌMØ Profesionales — Solicitud de colaboración',
    description: 'Cuéntanos tu proyecto KŌMØ: clínica, centro de longevidad, fitness premium, hotel, empresa o red multi-sede. Case, Pulse, piloto y despliegue profesional.',
    eyebrow: 'KŌMØ RIVIERA · SOLICITUD PROFESIONAL',
    badge: 'ACCESO PARTNERS',
    heroTitle: 'Solicita una demo KŌMØ<br><em>para tu establecimiento.</em>',
    heroLead: 'Centros médicos y de longevidad, hoteles premium, fitness, rendimiento y partners privados: cuéntanos dónde y cómo quieres desplegar KŌMØ. Prepararemos la demostración y el modelo de implantación pertinentes.',
    heroCta: 'Solicitar una demo →',
    proof: ['KŌMØ Case · seis sensores Myodev · Pulse', 'Cannes → Antibes → Nice → Monaco → Saint-Tropez', 'Demo · piloto · compra · multi-sede'],
    introEyebrow: 'KŌMØ PRO · ONBOARDING PARTNER',
    introTitle: 'Tu establecimiento.<br><em>Tu actividad. El siguiente paso.</em>',
    introLead: 'Esta breve solicitud profesional nos da los elementos necesarios para preparar una demostración o una propuesta de partnership adecuada.',
    aside: [
      ['01 · Cualificación', 'Revisamos tu establecimiento, ciudad, actividad y formato previsto.'],
      ['02 · Demostración', 'Una sesión KŌMØ Case / Pulse en condiciones reales muestra el recorrido de medición en tu entorno.'],
      ['03 · Implantación', 'Piloto, compra o multi-sede: el modelo se adapta a tu equipo y lugar.']
    ],
    directLabel: 'Contacto profesional directo',
    formTitle: 'Construyamos tu proyecto KŌMØ',
    formLead: 'Solicitud profesional guiada. Sin datos de pacientes.',
    time: '≈ 4 MIN',
    sections: ['Contacto', 'Establecimiento', 'Partnership', 'Finalizar'],
    stepLead: ['¿Con quién debemos hablar?', '¿Dónde se desplegaría KŌMØ y cuál es tu actividad principal?', '¿Qué tipo de partnership quieres explorar, incluida una demo en condiciones reales?', 'Danos el contexto útil para preparar la siguiente conversación.'],
    fields: {
      firstName: 'Nombre *', lastName: 'Apellidos *', email: 'E-mail profesional *', phone: 'Teléfono / WhatsApp', role: 'Cargo / función', organisation: 'Establecimiento / organización *', website: 'Sitio web', city: 'Ciudad *', country: 'País *', organisationType: 'Actividad principal *', sites: 'Número de sedes', assessments: 'Evaluaciones previstas / mes', timeline: 'Horizonte de despliegue', preferredContact: 'Contacto preferido', message: 'Cuéntanos qué quieres construir *'
    },
    placeholders: { message: 'Ejemplo: equipar un centro de longevidad, lanzar un piloto en un hotel, desplegar en varias clínicas, añadir una evaluación locomotora a un recorrido existente…' },
    organisationTypes: [['medical', 'Centro médico / longevidad'], ['physician', 'Médico / consulta privada'], ['fitness', 'Club fitness / rendimiento'], ['hospitality', 'Hotel / spa / resort / retreat'], ['corporate', 'Empresa / aseguradora / mutua'], ['sport', 'Organización / equipo deportivo'], ['concierge', 'Concierge privado / villa / yacht'], ['distributor', 'Distribuidor / red'], ['other', 'Otro']],
    sites: [['1', '1 sede'], ['2-5', '2–5 sedes'], ['6-20', '6–20 sedes'], ['20+', '20+ sedes'], ['na', 'Por definir']],
    assessments: [['<10', '< 10 / mes'], ['10-30', '10–30 / mes'], ['31-100', '31–100 / mes'], ['100+', '100+ / mes'], ['unknown', 'Por definir']],
    timeline: [['now', 'Ahora / < 1 mes'], ['1-3', '1–3 meses'], ['3-6', '3–6 meses'], ['6-12', '6–12 meses'], ['explore', 'Exploración']],
    contact: [['email', 'E-mail'], ['phone', 'Teléfono'], ['whatsapp', 'WhatsApp'], ['video', 'Videollamada']],
    interestsTitle: 'Tipo de partnership *',
    interests: [['demo', 'Solicitar una demo KŌMØ privada'], ['case_purchase', 'KŌMØ Case — compra / instalación'], ['pilot', 'Piloto fundador / sesión operada'], ['multisite', 'Despliegue multi-sede'], ['hospitality', 'Hospitality / hotel / retreat'], ['corporate', 'Empresa / salud laboral'], ['sport', 'Deporte / rendimiento'], ['distribution', 'Distribución / colaboración de red'], ['other', 'Otra colaboración']],
    consent: 'Acepto que KŌMØ utilice la información introducida aquí para estudiar y responder a esta solicitud profesional. *',
    safety: 'No envíes nombres de pacientes, historiales médicos, resultados de salud ni otros datos sanitarios sensibles mediante este formulario público.',
    next: 'Continuar →', back: '← Atrás', submit: 'Enviar mi solicitud →',
    status: 'Tu solicitud se enviará a contact@komolongevity.com.',
    successTitle: 'Tu solicitud ha sido enviada.',
    successText: 'El equipo KŌMØ se pondrá en contacto contigo para definir el modelo más adecuado para tu organización.'
  }
};

const esc = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

function hero(c) {
  return `<section class="professional-hero"><div class="shell"><div class="professional-hero-topline"><p class="eyebrow">${esc(c.eyebrow)}</p><span class="professional-hero-badge">${esc(c.badge)}</span></div><div class="professional-hero-word" aria-label="KŌMØ PRO">KŌMØ <span>PRO</span></div><div class="professional-hero-grid"><h1>${c.heroTitle}</h1><div><p class="professional-hero-lead">${esc(c.heroLead)}</p><div class="professional-hero-actions"><a class="professional-hero-action" href="#contact-form">${esc(c.heroCta)}</a><a class="professional-hero-mail" href="mailto:contact@komolongevity.com">contact@komolongevity.com</a></div></div></div><ol class="professional-hero-proof" aria-label="KŌMØ professional deployment">${c.proof.map((item) => `<li>${esc(item)}</li>`).join('')}</ol></div></section>`;
}

function field(label, name, attrs = '') {
  return `<div class="professional-field"><label for="pro-${name}">${esc(label)}</label><input id="pro-${name}" name="${name}" ${attrs}></div>`;
}

function radioCards(label, name, options, { required = false, className = '' } = {}) {
  return `<div class="professional-field"><label>${esc(label)}</label><div class="professional-choice-grid ${className}">${options.map(([value, text], index) => `<label class="professional-choice"><input type="radio" name="${esc(name)}" value="${esc(value)}" ${required && index === 0 ? 'required' : ''}><span>${esc(text)}</span></label>`).join('')}</div></div>`;
}

function segments(label, name, options, { required = false } = {}) {
  return `<div class="professional-segment-wrap"><div class="professional-segment-label">${esc(label)}</div><div class="professional-segment-grid">${options.map(([value, text], index) => `<label class="professional-segment"><input type="radio" name="${esc(name)}" value="${esc(value)}" ${required && index === 0 ? 'required' : ''}><span>${esc(text)}</span></label>`).join('')}</div></div>`;
}

function stepHeading(number, title, lead) {
  return `<div class="professional-form-section-title"><span>0${number}</span><strong>${esc(title)}</strong></div><p class="professional-step-kicker">${esc(lead)}</p>`;
}

function contactSection(locale, c) {
  const interestChoices = c.interests.map(([value, label], index) => `<label class="professional-choice"><input type="radio" name="interest" value="${esc(value)}" ${index === 0 ? 'required' : ''}><span>${esc(label)}</span></label>`).join('');
  const progress = c.sections.map((title, index) => `<button type="button" data-pro-progress="${index}"><small>0${index + 1}</small><strong>${esc(title)}</strong></button>`).join('');

  return `<section class="professional-enquiry" id="contact-form"><div class="shell"><div class="professional-enquiry-intro reveal"><div><p class="eyebrow">${esc(c.introEyebrow)}</p><h2>${c.introTitle}</h2></div><p>${esc(c.introLead)}</p></div><div class="professional-enquiry-grid"><aside class="professional-enquiry-aside reveal">${c.aside.map(([title, body]) => `<div class="professional-enquiry-aside-card"><strong>${esc(title)}</strong><p>${esc(body)}</p></div>`).join('')}<a class="professional-enquiry-mail" href="mailto:contact@komolongevity.com"><span>${esc(c.directLabel)}</span><strong>contact@komolongevity.com</strong></a></aside><div class="professional-form-panel reveal"><header><div><h3>${esc(c.formTitle)}</h3><p>${esc(c.formLead)}</p></div><span class="professional-form-time">${esc(c.time)}</span></header><nav class="professional-progress" aria-label="Professional enquiry progress">${progress}</nav><form data-professional-contact data-locale="${locale}" novalidate><div class="professional-honeypot" aria-hidden="true"><label>Company URL<input name="companyUrl" tabindex="-1" autocomplete="off"></label></div><input type="hidden" name="source"><input type="hidden" name="utmSource"><input type="hidden" name="utmMedium"><input type="hidden" name="utmCampaign"><p class="professional-form-status professional-form-status--global" data-professional-status aria-live="polite"></p>

<section class="professional-form-section" data-pro-step="0">${stepHeading(1, c.sections[0], c.stepLead[0])}<div class="professional-field-grid">${field(c.fields.firstName, 'firstName', 'autocomplete="given-name" required')}${field(c.fields.lastName, 'lastName', 'autocomplete="family-name" required')}${field(c.fields.email, 'email', 'type="email" autocomplete="email" required')}${field(c.fields.phone, 'phone', 'type="tel" autocomplete="tel"')}${field(c.fields.role, 'role', 'autocomplete="organization-title"')}<div>${segments(c.fields.preferredContact, 'preferredContact', c.contact)}</div></div><div class="professional-step-actions"><span></span><button class="professional-next" type="button" data-pro-next>${esc(c.next)}</button></div></section>

<section class="professional-form-section" data-pro-step="1" hidden>${stepHeading(2, c.sections[1], c.stepLead[1])}<div class="professional-field-grid">${field(c.fields.organisation, 'organisation', 'autocomplete="organization" required')}${field(c.fields.website, 'website', 'type="url" inputmode="url" placeholder="https://"')}${field(c.fields.city, 'city', 'autocomplete="address-level2" required')}${field(c.fields.country, 'country', 'autocomplete="country-name" required')}</div><div style="margin-top:1rem">${radioCards(c.fields.organisationType, 'organisationType', c.organisationTypes, { required: true, className: 'professional-choice-grid--organisation' })}</div><div style="margin-top:1rem">${segments(c.fields.sites, 'sites', c.sites)}</div><div class="professional-step-actions"><button class="professional-back" type="button" data-pro-back>${esc(c.back)}</button><button class="professional-next" type="button" data-pro-next>${esc(c.next)}</button></div></section>

<section class="professional-form-section" data-pro-step="2" hidden>${stepHeading(3, c.sections[2], c.stepLead[2])}<div class="professional-field"><label>${esc(c.interestsTitle)}</label><div class="professional-choice-grid">${interestChoices}</div></div><div class="professional-field-grid" style="margin-top:1rem"><div>${segments(c.fields.assessments, 'assessments', c.assessments)}</div><div>${segments(c.fields.timeline, 'timeline', c.timeline)}</div></div><div class="professional-step-actions"><button class="professional-back" type="button" data-pro-back>${esc(c.back)}</button><button class="professional-next" type="button" data-pro-next>${esc(c.next)}</button></div></section>

<section class="professional-form-section" data-pro-step="3" hidden>${stepHeading(4, c.sections[3], c.stepLead[3])}<div class="professional-field-grid professional-field-grid--single"><div class="professional-field"><label for="pro-message">${esc(c.fields.message)}</label><textarea id="pro-message" name="message" placeholder="${esc(c.placeholders.message)}" required></textarea></div></div><label class="professional-consent"><input type="checkbox" name="consent" required><span>${esc(c.consent)}</span></label><p class="professional-form-safety">${esc(c.safety)}</p><div class="professional-step-actions professional-step-actions--end"><button class="professional-back" type="button" data-pro-back>${esc(c.back)}</button><div class="professional-form-actions"><button class="button" type="submit">${esc(c.submit)}</button><p class="professional-submit-note">${esc(c.status)}</p></div></div></section>
</form><div class="professional-form-success" data-professional-success hidden tabindex="-1"><h3>${esc(c.successTitle)}</h3><p>${esc(c.successText)}</p></div></div></div></div></section>`;
}

function replaceRequired(html, regex, replacement, label) {
  if (!regex.test(html)) throw new Error(`[professional-contact] ${label} marker not found`);
  return html.replace(regex, replacement);
}

for (const [locale, c] of Object.entries(copies)) {
  let html = await readFile(c.path, 'utf8');
  html = replaceRequired(html, /<section class="page-hero">[\s\S]*?<\/section>/, hero(c), `${locale} hero`);
  html = replaceRequired(html, /<section class="section" id="contact-form">[\s\S]*?<\/section>/, contactSection(locale, c), `${locale} contact form`);
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(c.title)}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(c.description)}">`);
  html = html.replace(/\/assets\/css\/professional-contact\.css\?v=[^"']+/g, `/assets/css/professional-contact.css?v=${assetVersion}`);
  html = html.replace(/\/assets\/js\/professional-contact\.js\?v=[^"']+/g, `/assets/js/professional-contact.js?v=${assetVersion}`);
  if (!html.includes('professional-contact.css')) html = html.replace('</head>', `<link rel="stylesheet" href="/assets/css/professional-contact.css?v=${assetVersion}">\n</head>`);
  if (!html.includes('professional-contact.js')) html = html.replace('</body>', `<script src="/assets/js/professional-contact.js?v=${assetVersion}" defer></script>\n</body>`);
  await writeFile(c.path, html, 'utf8');
  console.log(`[professional-contact] ${locale} /contact/ upgraded to PRO v2`);
}
