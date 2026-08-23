import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const site = join(process.cwd(), 'site');

const CSS = `<style id="homepage-minimal-patient-v1-style">
.khm{background:#f5f1e9;color:#121410}.khm-shell{width:min(calc(100% - 40px),1160px);margin:auto}.khm-hero{padding:clamp(64px,9vw,118px) 0 clamp(58px,8vw,92px)}.khm-ey{margin:0 0 18px;color:#617166;font:850 9px/1.2 Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;letter-spacing:.16em;text-transform:uppercase}.khm-brand{margin:0;font:850 clamp(82px,13.5vw,170px)/.78 Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;letter-spacing:-.078em;text-transform:uppercase}.khm-brand span{display:block;margin-top:clamp(26px,3.6vw,44px);color:#617166;font:400 clamp(40px,5.2vw,68px)/.92 'Iowan Old Style',Baskerville,Georgia,serif;letter-spacing:-.045em;text-transform:none}.khm-intro{display:grid;grid-template-columns:1fr .92fr;gap:clamp(42px,8vw,104px);align-items:end;margin-top:clamp(48px,6vw,72px);padding-top:26px;border-top:1px solid #121410}.khm-intro h1{margin:0;font:400 clamp(48px,6vw,76px)/.93 'Iowan Old Style',Baskerville,Georgia,serif;letter-spacing:-.055em}.khm-intro h1 em,.khm-title em{font-style:normal;color:#617166}.khm-copy{margin:0;color:#343934;font:400 18px/1.62 'Iowan Old Style',Baskerville,Georgia,serif}.khm-actions{display:flex;gap:16px;align-items:center;flex-wrap:wrap;margin-top:24px}.khm-btn{display:inline-flex;min-height:48px;align-items:center;justify-content:center;padding:0 18px;border-radius:999px;background:#121410;color:#fff!important;text-decoration:none;font-size:11px;font-weight:850}.khm-link{display:inline-flex;padding-bottom:3px;border-bottom:1px solid currentColor;text-decoration:none;font-size:10px;font-weight:850}.khm-section{padding:clamp(66px,8vw,96px) 0;border-top:1px solid rgba(18,20,16,.13)}.khm-white{background:#fdfcf8}.khm-head{display:grid;grid-template-columns:.88fr 1.12fr;gap:clamp(40px,8vw,104px);align-items:end;margin-bottom:36px}.khm-title{margin:0;font:400 clamp(42px,5.2vw,66px)/.95 'Iowan Old Style',Baskerville,Georgia,serif;letter-spacing:-.05em}.khm-head p{margin:0;max-width:560px;color:#707670;font:400 16px/1.68 'Iowan Old Style',Baskerville,Georgia,serif}.khm-flow{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid #121410;border-bottom:1px solid rgba(18,20,16,.13)}.khm-step{min-height:154px;padding:18px 22px 20px 0;border-right:1px solid rgba(18,20,16,.13)}.khm-step:not(:first-child){padding-left:22px}.khm-step:last-child{border-right:0}.khm-step small,.khm-domain small{display:block;color:#617166;font-size:8px;font-weight:850;letter-spacing:.12em;text-transform:uppercase}.khm-step h3{margin:30px 0 7px;font:400 27px/1 'Iowan Old Style',Baskerville,Georgia,serif;letter-spacing:-.035em}.khm-step p{margin:0;color:#707670;font-size:11px;line-height:1.55}.khm-domains{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid #121410}.khm-domain{min-height:150px;padding:20px 22px 20px 0;border-right:1px solid rgba(18,20,16,.13);border-bottom:1px solid rgba(18,20,16,.13)}.khm-domain:not(:first-child){padding-left:22px}.khm-domain:last-child{border-right:0}.khm-domain h3{margin:40px 0 0;font:400 29px/1 'Iowan Old Style',Baskerville,Georgia,serif;letter-spacing:-.035em}.khm-next{padding:clamp(74px,9vw,112px) 0}.khm-next-grid{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid #121410;border-bottom:1px solid #121410}.khm-card{min-height:260px;padding:clamp(28px,4vw,46px);text-decoration:none;display:flex;flex-direction:column;justify-content:space-between}.khm-card+.khm-card{border-left:1px solid rgba(18,20,16,.13)}.khm-card small{color:#617166;font-size:8px;font-weight:850;letter-spacing:.12em;text-transform:uppercase}.khm-card h2{margin:54px 0 10px;font:400 clamp(38px,4.5vw,56px)/.95 'Iowan Old Style',Baskerville,Georgia,serif;letter-spacing:-.045em}.khm-card p{margin:0;max-width:430px;color:#707670;font-size:12px;line-height:1.62}.khm-card b{display:block;margin-top:30px;font-size:10px}.khm-network{margin:22px 0 0;text-align:center;color:#707670;font-size:10px}.khm-network a{color:#121410;font-weight:850;text-decoration:none;border-bottom:1px solid currentColor;padding-bottom:2px}@media(max-width:900px){.khm-intro,.khm-head{grid-template-columns:1fr}.khm-flow,.khm-domains{grid-template-columns:1fr 1fr}.khm-step:nth-child(2),.khm-domain:nth-child(2){border-right:0}.khm-step:nth-child(3),.khm-domain:nth-child(3){padding-left:0}.khm-next-grid{grid-template-columns:1fr}.khm-card+.khm-card{border-left:0;border-top:1px solid rgba(18,20,16,.13)}}@media(max-width:620px){.khm-shell{width:min(calc(100% - 28px),1160px)}.khm-hero{padding:42px 0 50px}.khm-ey{margin-bottom:15px;font-size:8px}.khm-brand{font-size:clamp(55px,18.2vw,70px);line-height:.82;max-width:100%}.khm-brand span{margin-top:18px;font-size:36px}.khm-intro{margin-top:34px;padding-top:19px;gap:17px}.khm-intro h1{font-size:40px;line-height:.95}.khm-copy{font-size:16px;line-height:1.55}.khm-actions{display:grid;gap:13px;margin-top:20px}.khm-btn{width:100%;min-height:50px}.khm-link{justify-self:start}.khm-section{padding:54px 0}.khm-head{gap:16px;margin-bottom:25px}.khm-title{font-size:40px}.khm-head p{font-size:15px;line-height:1.58}.khm-flow,.khm-domains{grid-template-columns:1fr}.khm-step,.khm-step:not(:first-child),.khm-step:nth-child(3),.khm-domain,.khm-domain:not(:first-child),.khm-domain:nth-child(3){min-height:0;padding:16px 0;border-right:0}.khm-step h3{margin:20px 0 5px;font-size:25px}.khm-domain{display:grid;grid-template-columns:34px 1fr;align-items:center}.khm-domain h3{margin:0;font-size:27px}.khm-next{padding:58px 0}.khm-card{min-height:210px;padding:25px 0}.khm-card h2{margin:38px 0 9px;font-size:41px}.khm-network{text-align:left;margin-top:18px}}@media(max-width:380px){.khm-brand{font-size:52px}.khm-brand span{font-size:33px}.khm-intro h1,.khm-title{font-size:37px}}
</style>`;

const C = {
  fr: {
    file: join(site,'fr','index.html'),
    title: 'KŌMØ Longevity | Bilan de mobilité & suivi',
    desc: 'KŌMØ propose un bilan de mobilité mobile et connecté, puis un suivi de votre trajectoire dans Pulse.',
    ey: 'LONGÉVITÉ LOCOMOTRICE',
    h1: 'Comprendre votre mobilité.<br><em>Préserver la suite.</em>',
    lead: 'Un bilan mobile et connecté pour mesurer votre mobilité, comprendre votre profil et suivre votre trajectoire dans Pulse.',
    cta1: 'Découvrir le bilan →', cta2: 'Entrer dans Pulse ↗',
    assessment:'/fr/bilan/', pulse:'/fr/pulse/', method:'/fr/methode/', network:'/fr/network/',
    flowTitle:'Simple, du début au suivi.', flowLead:'KŌMØ organise l’expérience en quatre temps. Le détail de chaque étape se trouve dans Votre bilan et la Méthode.',
    steps:[['01','Préparer','Quelques minutes dans Pulse avant votre rendez-vous.'],['02','Mesurer','Une évaluation courte et standardisée sur place.'],['03','Comprendre','Un profil clair et quelques priorités.'],['04','Suivre','Vos résultats restent réunis dans Pulse.']],
    domainsTitle:'Quatre dimensions.<br><em>Un seul profil.</em>', domainsLead:'La mobilité ne se résume pas à un chiffre. KŌMØ rassemble quatre dimensions complémentaires.',
    domains:['Mobilité','Performance','Équilibre','Contrôle musculaire'],
    next1Ey:'VOTRE BILAN', next1:'Savoir exactement<br>à quoi vous attendre.', next1p:'Avant, pendant et après : découvrez le parcours complet, sans jargon.', next1b:'Découvrir votre bilan →',
    next2Ey:'KŌMØ PULSE', next2:'Votre mobilité,<br>dans le temps.', next2p:'Préparer votre évaluation, retrouver vos résultats et suivre votre trajectoire.', next2b:'Découvrir Pulse →',
    networkText:'Vous cherchez un lieu ou un praticien équipé ?', networkCta:'Voir le Réseau KŌMØ ↗'
  },
  en: {
    file: join(site,'index.html'),
    title: 'KŌMØ Longevity | Mobility assessment & follow-up',
    desc: 'KŌMØ offers a mobile, connected mobility assessment and longitudinal follow-up in Pulse.',
    ey: 'LOCOMOTOR LONGEVITY',
    h1: 'Understand your mobility.<br><em>Preserve what comes next.</em>',
    lead: 'A mobile, connected assessment to measure your mobility, understand your profile and follow your trajectory in Pulse.',
    cta1: 'Discover the assessment →', cta2: 'Enter Pulse ↗',
    assessment:'/assessment/', pulse:'/pulse/', method:'/method/', network:'/network/',
    flowTitle:'Simple, from baseline to follow-up.', flowLead:'KŌMØ organizes the experience in four steps. The detail lives in Your Assessment and Method.',
    steps:[['01','Prepare','A few minutes in Pulse before your appointment.'],['02','Measure','A short, standardized assessment on site.'],['03','Understand','A clear profile and a few priorities.'],['04','Follow','Your results stay together in Pulse.']],
    domainsTitle:'Four dimensions.<br><em>One profile.</em>', domainsLead:'Mobility is not a single number. KŌMØ brings four complementary dimensions together.',
    domains:['Mobility','Performance','Balance','Muscle control'],
    next1Ey:'YOUR ASSESSMENT', next1:'Know exactly<br>what to expect.', next1p:'Before, during and after: discover the full journey without jargon.', next1b:'Discover your assessment →',
    next2Ey:'KŌMØ PULSE', next2:'Your mobility,<br>over time.', next2p:'Prepare your assessment, access your results and follow your trajectory.', next2b:'Discover Pulse →',
    networkText:'Looking for a KŌMØ-equipped place or practitioner?', networkCta:'Explore KŌMØ Network ↗'
  },
  es: {
    file: join(site,'es','index.html'),
    title: 'KŌMØ Longevity | Evaluación de movilidad y seguimiento',
    desc: 'KŌMØ ofrece una evaluación de movilidad móvil y conectada, con seguimiento longitudinal en Pulse.',
    ey: 'LONGEVIDAD LOCOMOTORA',
    h1: 'Comprender tu movilidad.<br><em>Preservar lo que viene.</em>',
    lead: 'Una evaluación móvil y conectada para medir tu movilidad, comprender tu perfil y seguir tu trayectoria en Pulse.',
    cta1: 'Descubrir la evaluación →', cta2: 'Entrar en Pulse ↗',
    assessment:'/es/evaluacion/', pulse:'/es/pulse/', method:'/es/metodo/', network:'/es/network/',
    flowTitle:'Simple, desde el inicio al seguimiento.', flowLead:'KŌMØ organiza la experiencia en cuatro pasos. El detalle está en Tu evaluación y Método.',
    steps:[['01','Preparar','Unos minutos en Pulse antes de la cita.'],['02','Medir','Una evaluación breve y estandarizada.'],['03','Comprender','Un perfil claro y pocas prioridades.'],['04','Seguir','Tus resultados permanecen reunidos en Pulse.']],
    domainsTitle:'Cuatro dimensiones.<br><em>Un solo perfil.</em>', domainsLead:'La movilidad no es un único número. KŌMØ reúne cuatro dimensiones complementarias.',
    domains:['Movilidad','Rendimiento','Equilibrio','Control muscular'],
    next1Ey:'TU EVALUACIÓN', next1:'Saber exactamente<br>qué esperar.', next1p:'Antes, durante y después: descubre el recorrido completo sin jerga.', next1b:'Descubrir tu evaluación →',
    next2Ey:'KŌMØ PULSE', next2:'Tu movilidad,<br>a lo largo del tiempo.', next2p:'Preparar la evaluación, consultar tus resultados y seguir tu trayectoria.', next2b:'Descubrir Pulse →',
    networkText:'¿Buscas un centro o profesional equipado con KŌMØ?', networkCta:'Ver la Red KŌMØ ↗'
  }
};

function main(c){
  const steps=c.steps.map(([n,t,p])=>`<article class="khm-step"><small>${n}</small><h3>${t}</h3><p>${p}</p></article>`).join('');
  const domains=c.domains.map((d,i)=>`<article class="khm-domain"><small>0${i+1}</small><h3>${d}</h3></article>`).join('');
  return `<main class="khm"><section class="khm-hero"><div class="khm-shell"><p class="khm-ey">${c.ey}</p><p class="khm-brand">KŌMØ<span>Longevity</span></p><div class="khm-intro"><h1>${c.h1}</h1><div><p class="khm-copy">${c.lead}</p><div class="khm-actions"><a class="khm-btn" href="${c.assessment}">${c.cta1}</a><a class="khm-link" href="${c.pulse}">${c.cta2}</a></div></div></div></div></section><section class="khm-section khm-white"><div class="khm-shell"><div class="khm-head"><h2 class="khm-title">${c.flowTitle}</h2><p>${c.flowLead}</p></div><div class="khm-flow">${steps}</div></div></section><section class="khm-section"><div class="khm-shell"><div class="khm-head"><h2 class="khm-title">${c.domainsTitle}</h2><p>${c.domainsLead}</p></div><div class="khm-domains">${domains}</div><div class="khm-actions" style="margin-top:24px"><a class="khm-link" href="${c.method}">${c.method.includes('metodo')?'Découvrir la méthode'.replace('Découvrir','Descubrir'):c.method==='/method/'?'Discover the method':'Découvrir la méthode'} ↗</a></div></div></section><section class="khm-next khm-white"><div class="khm-shell"><div class="khm-next-grid"><a class="khm-card" href="${c.assessment}"><div><small>${c.next1Ey}</small><h2>${c.next1}</h2><p>${c.next1p}</p></div><b>${c.next1b}</b></a><a class="khm-card" href="${c.pulse}"><div><small>${c.next2Ey}</small><h2>${c.next2}</h2><p>${c.next2p}</p></div><b>${c.next2b}</b></a></div><p class="khm-network">${c.networkText} <a href="${c.network}">${c.networkCta}</a></p></div></section></main>`;
}

for (const c of Object.values(C)) {
  let html = await readFile(c.file,'utf8');
  html = html.replace(/<title>[^<]*<\/title>/i,`<title>${c.title}</title>`)
    .replace(/<meta name="description" content="[^"]*">/i,`<meta name="description" content="${c.desc}">`)
    .replace(/<meta property="og:title" content="[^"]*">/i,`<meta property="og:title" content="${c.title}">`)
    .replace(/<meta property="og:description" content="[^"]*">/i,`<meta property="og:description" content="${c.desc}">`);
  html = html.replace('</head>',`${CSS}</head>`);
  html = html.replace(/<main>[\s\S]*?<\/main>/i, main(c));
  if(!html.includes('class="khm-brand"')) throw new Error(`minimal homepage injection failed for ${c.file}`);
  await writeFile(c.file,html,'utf8');
}
console.log('[homepage-minimal-patient-v1] minimal patient homepages generated for FR/EN/ES.');
