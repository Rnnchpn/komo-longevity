import { access, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const site=join(process.cwd(),'site');

const locales={
  fr:{
    home:'index.html',motion:'fr/motion/index.html',motionPath:'/fr/motion/',clinical:'/fr/clinical/',contact:'/fr/contact/?intent=motion',
    heroLead:'Le bilan KŌMØ associe questionnaires, tests fonctionnels et analyse instrumentée pour objectiver la marche, l’équilibre, la force, la mobilité et le contrôle musculaire. Vous repartez avec une lecture claire de vos priorités et de la suite adaptée.',
    primary:'Réserver mon bilan',secondary:'Voir ce que nous mesurons',
    proof:[['6','capteurs'],['119','marqueurs musculaires'],['GLFS-25','questionnaire fonctionnel'],['3','tests fonctionnels'],['Motion Score','repère KŌMØ'],['Pulse','résultats & suivi']],
    measureEy:'LE BILAN KŌMØ',measureTitle:'Ce que nous observons pendant votre bilan',
    measureLead:'Nous croisons ce que vous ressentez avec ce que nous pouvons mesurer. L’objectif n’est pas d’accumuler des données, mais d’identifier les éléments utiles pour comprendre votre fonction et définir des priorités.',
    domains:[
      ['Marche','Rythme, régularité, symétrie et qualité du déplacement.'],
      ['Équilibre','Stabilité et contrôle postural dans les situations évaluées.'],
      ['Force fonctionnelle','Capacité à produire un effort utile, notamment aux membres inférieurs.'],
      ['Mobilité','Amplitude et qualité de certains mouvements fonctionnels.'],
      ['Contrôle musculaire','Activation et organisation musculaire pendant les tâches mesurées.'],
      ['Capacité fonctionnelle','Ce que votre corps permet réellement dans les tâches du quotidien.']
    ],
    protocolEy:'QUESTIONNAIRES + TESTS',protocolTitle:'Votre ressenti compte autant que la mesure',
    protocolLead:'Le pré-bilan et les tests replacent les données instrumentées dans votre contexte. Ils permettent de comparer ce que vous ressentez, ce que vous réalisez et ce que les capteurs observent.',
    protocols:[
      ['GLFS-25','Questionnaire fonctionnel sur les difficultés liées à la locomotion.'],
      ['Stand-Up Test','Capacité à se relever selon un protocole standardisé.'],
      ['Two-Step Test','Capacité locomotrice évaluée sur deux pas.'],
      ['Marche 4 m','Vitesse et qualité de marche sur une distance courte.']
    ],
    flowTitle:'Une session conçue pour être utile, pas technique',
    flow:[
      ['01','Pré-bilan','Objectifs, contexte et questionnaires.'],
      ['02','Mesure','Tests fonctionnels et acquisition par capteurs.'],
      ['03','Restitution','Résultats expliqués simplement et replacés dans leur contexte.'],
      ['04','Suite','Priorités, programme ou orientation selon le besoin.']
    ],
    receiveEy:'VOTRE RESTITUTION',receiveTitle:'Vous ne repartez pas avec des données brutes',
    receiveLead:'La valeur du bilan se trouve dans l’interprétation et la continuité. Les résultats sont organisés pour vous aider à comprendre ce qui mérite votre attention maintenant et ce qui pourra être réévalué plus tard.',
    receive:[
      ['Motion Score','Un repère synthétique KŌMØ pour suivre votre profil fonctionnel.'],
      ['Motion Age','Un repère KŌMØ complémentaire présenté avec ses limites.'],
      ['Priorités','Les points principaux à travailler ou à surveiller.'],
      ['Plan','Des prochaines actions compréhensibles et adaptées au contexte.'],
      ['Pulse','Votre restitution, vos résultats et votre suivi dans un même espace.'],
      ['Réévaluation','Un prochain point pour comparer l’évolution dans le temps.']
    ],
    offersEy:'CHOISIR VOTRE ACCOMPAGNEMENT',offersTitle:'Le bilan est le point de départ',
    offersLead:'Motion permet d’évaluer la fonction. Clinical intervient lorsqu’une consultation médicale est indiquée. Signature organise un accompagnement privé plus large.',
    offers:[
      ['01','ÉVALUATION FONCTIONNELLE','KŌMØ Motion','Questionnaires, tests fonctionnels, analyse instrumentée et restitution personnalisée.','À partir de 300 €','Réserver Motion','motion'],
      ['02','PARCOURS MÉDICAL','KŌMØ Clinical','Consultation et interprétation médicale lorsque votre situation le justifie.','À partir de 500 €','Découvrir Clinical','clinical'],
      ['03','PROGRAMME PRIVÉ','KŌMØ Signature','Un accompagnement coordonné, sur mesure et adapté au lieu de votre choix.','Sur proposition','Découvrir Signature','signature']
    ],
    note:'Motion Score et Motion Age sont des repères propriétaires KŌMØ et ne constituent pas, à eux seuls, un diagnostic médical.',
    motionHero:'Comprendre comment vous bougez et savoir quoi améliorer',
    motionLead:'KŌMØ Motion associe questionnaires, tests fonctionnels et analyse instrumentée pour explorer votre marche, votre équilibre, votre force, votre mobilité et votre contrôle musculaire. La session se termine par une restitution individuelle et des priorités claires.'
  },
  en:{
    home:'en/index.html',motion:'motion/index.html',motionPath:'/motion/',clinical:'/clinical/',contact:'/contact/?intent=motion',
    heroLead:'The KŌMØ assessment combines questionnaires, functional tests and instrumented analysis to objectify gait, balance, strength, mobility and muscle control. You leave with a clear understanding of your priorities and the appropriate next step.',
    primary:'Book my assessment',secondary:'See what we measure',
    proof:[['6','sensors'],['119','muscle markers'],['GLFS-25','functional questionnaire'],['3','functional tests'],['Motion Score','KŌMØ reference'],['Pulse','results & follow-up']],
    measureEy:'THE KŌMØ ASSESSMENT',measureTitle:'What we observe during your assessment',
    measureLead:'We combine what you feel with what can be measured. The goal is not to collect data for its own sake, but to identify useful information about function and priorities.',
    domains:[
      ['Gait','Rhythm, regularity, symmetry and movement quality.'],['Balance','Stability and postural control in the assessed tasks.'],['Functional strength','Ability to produce useful effort, particularly in the lower limbs.'],['Mobility','Range and quality of selected functional movements.'],['Muscle control','Muscle activation and organisation during measured tasks.'],['Functional capacity','What your body can actually do in everyday tasks.']
    ],
    protocolEy:'QUESTIONNAIRES + TESTS',protocolTitle:'What you feel matters alongside what we measure',
    protocolLead:'The pre-assessment and functional tests place instrumented data in context and compare perception, performance and sensor observations.',
    protocols:[['GLFS-25','Functional questionnaire related to locomotor difficulty.'],['Stand-Up Test','Ability to stand according to a standardised protocol.'],['Two-Step Test','Locomotor capacity assessed over two steps.'],['4 m walk','Walking speed and quality over a short distance.']],
    flowTitle:'A session designed to be useful, not technical',
    flow:[['01','Pre-assessment','Goals, context and questionnaires.'],['02','Measurement','Functional tests and sensor acquisition.'],['03','Debrief','Results explained clearly and put into context.'],['04','Next step','Priorities, programme or referral according to need.']],
    receiveEy:'YOUR DEBRIEF',receiveTitle:'You do not leave with raw data',
    receiveLead:'The value of the assessment lies in interpretation and continuity. Results are organised so you can understand what deserves attention now and what can be reassessed later.',
    receive:[['Motion Score','A KŌMØ reference for tracking your functional profile.'],['Motion Age','A complementary KŌMØ reference presented with its limitations.'],['Priorities','The main areas to work on or monitor.'],['Plan','Clear next actions adapted to your context.'],['Pulse','Results, debrief and follow-up in one space.'],['Reassessment','A future checkpoint to compare change over time.']],
    offersEy:'CHOOSE YOUR SUPPORT',offersTitle:'The assessment is the starting point',offersLead:'Motion assesses function. Clinical is used when medical consultation is indicated. Signature organises a broader private programme.',
    offers:[['01','FUNCTIONAL ASSESSMENT','KŌMØ Motion','Questionnaires, functional tests, instrumented analysis and a personalised debrief.','From €300','Book Motion','motion'],['02','MEDICAL PATHWAY','KŌMØ Clinical','Medical consultation and interpretation when your situation requires it.','From €500','Explore Clinical','clinical'],['03','PRIVATE PROGRAMME','KŌMØ Signature','Coordinated, tailored support in the setting that suits you.','On proposal','Explore Signature','signature']],
    note:'Motion Score and Motion Age are proprietary KŌMØ references and do not constitute a medical diagnosis on their own.',
    motionHero:'Understand how you move and what to improve',motionLead:'KŌMØ Motion combines questionnaires, functional tests and instrumented analysis to explore gait, balance, strength, mobility and muscle control. The session ends with an individual debrief and clear priorities.'
  },
  es:{
    home:'es/index.html',motion:'es/motion/index.html',motionPath:'/es/motion/',clinical:'/es/clinical/',contact:'/es/contact/?intent=motion',
    heroLead:'El balance KŌMØ combina cuestionarios, pruebas funcionales y análisis instrumentado para objetivar marcha, equilibrio, fuerza, movilidad y control muscular. Sales con una lectura clara de tus prioridades y del siguiente paso adecuado.',
    primary:'Reservar mi evaluación',secondary:'Ver qué medimos',
    proof:[['6','sensores'],['119','marcadores musculares'],['GLFS-25','cuestionario funcional'],['3','pruebas funcionales'],['Motion Score','referencia KŌMØ'],['Pulse','resultados y seguimiento']],
    measureEy:'LA EVALUACIÓN KŌMØ',measureTitle:'Qué observamos durante tu evaluación',
    measureLead:'Combinamos lo que sientes con lo que podemos medir. El objetivo no es acumular datos, sino identificar información útil para entender tu función y establecer prioridades.',
    domains:[['Marcha','Ritmo, regularidad, simetría y calidad del desplazamiento.'],['Equilibrio','Estabilidad y control postural durante las tareas evaluadas.'],['Fuerza funcional','Capacidad de producir un esfuerzo útil, especialmente en miembros inferiores.'],['Movilidad','Amplitud y calidad de movimientos funcionales seleccionados.'],['Control muscular','Activación y organización muscular durante las tareas medidas.'],['Capacidad funcional','Lo que tu cuerpo permite realmente en tareas cotidianas.']],
    protocolEy:'CUESTIONARIOS + PRUEBAS',protocolTitle:'Lo que sientes importa junto con lo que medimos',
    protocolLead:'El pre-balance y las pruebas sitúan los datos instrumentados en contexto y comparan percepción, rendimiento y observaciones de los sensores.',
    protocols:[['GLFS-25','Cuestionario funcional relacionado con dificultades locomotoras.'],['Stand-Up Test','Capacidad para levantarse según un protocolo estandarizado.'],['Two-Step Test','Capacidad locomotora evaluada en dos pasos.'],['Marcha 4 m','Velocidad y calidad de marcha en una distancia corta.']],
    flowTitle:'Una sesión diseñada para ser útil, no técnica',
    flow:[['01','Pre-balance','Objetivos, contexto y cuestionarios.'],['02','Medición','Pruebas funcionales y adquisición con sensores.'],['03','Restitución','Resultados explicados claramente y puestos en contexto.'],['04','Siguiente paso','Prioridades, programa u orientación según necesidad.']],
    receiveEy:'TU RESTITUCIÓN',receiveTitle:'No sales con datos brutos',receiveLead:'El valor está en la interpretación y la continuidad. Los resultados se organizan para entender qué merece atención ahora y qué podrá reevaluarse más adelante.',
    receive:[['Motion Score','Referencia KŌMØ para seguir tu perfil funcional.'],['Motion Age','Referencia KŌMØ complementaria presentada con sus límites.'],['Prioridades','Principales puntos a trabajar o vigilar.'],['Plan','Próximas acciones claras y adaptadas al contexto.'],['Pulse','Resultados, restitución y seguimiento en un mismo espacio.'],['Reevaluación','Un futuro punto de control para comparar la evolución.']],
    offersEy:'ELEGIR ACOMPAÑAMIENTO',offersTitle:'La evaluación es el punto de partida',offersLead:'Motion evalúa la función. Clinical interviene cuando está indicada una consulta médica. Signature organiza un acompañamiento privado más amplio.',
    offers:[['01','EVALUACIÓN FUNCIONAL','KŌMØ Motion','Cuestionarios, pruebas funcionales, análisis instrumentado y restitución personalizada.','Desde 300 €','Reservar Motion','motion'],['02','RECORRIDO MÉDICO','KŌMØ Clinical','Consulta e interpretación médica cuando la situación lo requiere.','Desde 500 €','Descubrir Clinical','clinical'],['03','PROGRAMA PRIVADO','KŌMØ Signature','Acompañamiento coordinado y a medida en el lugar que prefieras.','Bajo propuesta','Descubrir Signature','signature']],
    note:'Motion Score y Motion Age son referencias propietarias KŌMØ y no constituyen por sí solas un diagnóstico médico.',
    motionHero:'Comprender cómo te mueves y saber qué mejorar',motionLead:'KŌMØ Motion combina cuestionarios, pruebas funcionales y análisis instrumentado para explorar marcha, equilibrio, fuerza, movilidad y control muscular. La sesión termina con una restitución individual y prioridades claras.'
  }
};

const css=`
<style id="komo-motion-conversion-v1-style">
.km-proofrail{display:grid;grid-template-columns:repeat(6,1fr);background:#101713;color:#f7f5ef;border-bottom:1px solid rgba(255,255,255,.07)}
.km-proofrail article{min-height:112px;padding:24px 20px;border-right:1px solid rgba(255,255,255,.08)}.km-proofrail article:last-child{border-right:0}
.km-proofrail strong{display:block;font:400 clamp(25px,2.7vw,37px)/1 "Iowan Old Style",Baskerville,Georgia,serif;letter-spacing:-.035em}.km-proofrail span{display:block;margin-top:9px;color:rgba(247,245,239,.58);font-size:9px;line-height:1.4;text-transform:uppercase;letter-spacing:.08em}
.km-measure{padding:clamp(72px,8.5vw,110px) 0;background:#f7f5ef}.km-measure-head{display:grid;grid-template-columns:.9fr 1.1fr;gap:clamp(36px,7vw,90px);align-items:end}.km-measure-head .kt-copy{margin:0;max-width:620px}
.km-domains{display:grid;grid-template-columns:repeat(3,1fr);margin-top:42px;border-top:1px solid rgba(20,30,24,.14);border-bottom:1px solid rgba(20,30,24,.14)}.km-domain{min-height:190px;padding:24px 25px 25px 0;border-right:1px solid rgba(20,30,24,.11);border-bottom:1px solid rgba(20,30,24,.09)}.km-domain:nth-child(3n){border-right:0}.km-domain:nth-child(n+4){border-bottom:0}.km-domain b{display:block;color:#718176;font-size:9px;letter-spacing:.12em;text-transform:uppercase}.km-domain h3{margin:31px 0 11px;font:400 28px/1 "Iowan Old Style",Baskerville,Georgia,serif;letter-spacing:-.035em}.km-domain p{margin:0;max-width:34ch;color:#667067;font-size:11px;line-height:1.58}
.km-protocol{padding:clamp(72px,8.5vw,110px) 0;background:#dfe8e2}.km-protocol-grid{display:grid;grid-template-columns:.78fr 1.22fr;gap:clamp(42px,8vw,100px);align-items:start}.km-protocol-list{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid rgba(20,30,24,.15)}.km-protocol-card{padding:23px 20px 24px 0;border-bottom:1px solid rgba(20,30,24,.12)}.km-protocol-card:nth-child(odd){border-right:1px solid rgba(20,30,24,.11);padding-right:24px}.km-protocol-card:nth-child(even){padding-left:24px}.km-protocol-card strong{display:block;font:400 26px/1 "Iowan Old Style",Baskerville,Georgia,serif}.km-protocol-card p{margin:10px 0 0;color:#5e6a61;font-size:11px;line-height:1.55}
.km-flow{padding:clamp(72px,8.5vw,105px) 0;background:#121a17;color:#f7f5ef}.km-flow .kt-h2{color:#f7f5ef}.km-flow-grid{display:grid;grid-template-columns:repeat(4,1fr);margin-top:40px;border-top:1px solid rgba(255,255,255,.13);border-bottom:1px solid rgba(255,255,255,.13)}.km-flow-step{min-height:205px;padding:22px 20px;border-right:1px solid rgba(255,255,255,.1)}.km-flow-step:last-child{border-right:0}.km-flow-step b{font-size:9px;color:#9db2a4}.km-flow-step h3{margin:38px 0 11px;font:400 25px/1 "Iowan Old Style",Baskerville,Georgia,serif}.km-flow-step p{margin:0;color:rgba(247,245,239,.61);font-size:11px;line-height:1.55}
.km-offers{padding:clamp(72px,8.5vw,110px) 0;background:#f4f1ea}.km-offer-head{display:grid;grid-template-columns:1fr .75fr;gap:50px;align-items:end}.km-offer-head .kt-copy{margin:0}.km-offer-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:42px}.km-offer{display:flex;flex-direction:column;min-height:380px;padding:28px;border-radius:20px;border:1px solid rgba(23,33,27,.12);background:#fff;transition:transform .28s ease,box-shadow .28s ease,border-color .28s ease}.km-offer:hover{transform:translateY(-5px);box-shadow:0 24px 60px rgba(25,36,30,.08);border-color:rgba(72,104,84,.27)}.km-offer--clinical{background:#1a2821;color:#f7f5ef}.km-offer--clinical p{color:rgba(247,245,239,.65)!important}.km-offer--signature{background:#e7e0d4}.km-offer-top{display:flex;justify-content:space-between;gap:12px;color:#758078;font-size:9px;letter-spacing:.12em;text-transform:uppercase}.km-offer--clinical .km-offer-top{color:#a9bcae}.km-offer h3{margin:50px 0 14px;font:400 clamp(32px,3vw,42px)/1 "Iowan Old Style",Baskerville,Georgia,serif;letter-spacing:-.04em}.km-offer p{margin:0;color:#626b64;font-size:12px;line-height:1.62}.km-offer-foot{display:flex;justify-content:space-between;gap:18px;align-items:end;margin-top:auto;padding-top:32px}.km-offer-foot strong{font-size:12px}.km-offer-foot a{font-size:11px;font-weight:750;text-decoration:none}
.km-receive{padding:clamp(72px,8.5vw,110px) 0;background:#e8ece8}.km-receive-grid{display:grid;grid-template-columns:.75fr 1.25fr;gap:clamp(42px,8vw,100px);align-items:start}.km-receive-cards{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.km-receive-card{padding:22px;border:1px solid rgba(23,33,27,.11);border-radius:16px;background:rgba(255,255,255,.62)}.km-receive-card strong{display:block;font:400 23px/1 "Iowan Old Style",Baskerville,Georgia,serif}.km-receive-card p{margin:9px 0 0;color:#626c64;font-size:10px;line-height:1.52}.km-note{margin-top:26px;padding:14px 16px;border-left:2px solid #728779;background:rgba(255,255,255,.48);color:#5b655e;font-size:10px;line-height:1.55}
.km-motion-hero{padding:clamp(82px,9vw,126px) 0 58px;background:radial-gradient(circle at 86% 10%,rgba(126,159,137,.24),transparent 30%),linear-gradient(145deg,#f6f3ec,#e4ebe5)}.km-motion-hero .kt-lead{max-width:760px}
.km-motion-dashboard{padding:clamp(64px,8vw,100px) 0;background:#121a17;color:#f7f5ef}.km-dashboard-grid{display:grid;grid-template-columns:.78fr 1.22fr;gap:70px;align-items:start}.km-dashboard-intro .kt-h2{color:#f7f5ef}.km-dashboard-intro .kt-copy{color:rgba(247,245,239,.65)}.km-dashboard-panel{display:grid;grid-template-columns:repeat(2,1fr);border:1px solid rgba(255,255,255,.1);border-radius:22px;overflow:hidden;background:#17211d}.km-dashboard-panel article{min-height:145px;padding:22px;border-right:1px solid rgba(255,255,255,.08);border-bottom:1px solid rgba(255,255,255,.08)}.km-dashboard-panel article:nth-child(2n){border-right:0}.km-dashboard-panel article:nth-last-child(-n+2){border-bottom:0}.km-dashboard-panel strong{display:block;font:400 29px/1 "Iowan Old Style",Baskerville,Georgia,serif}.km-dashboard-panel span{display:block;margin-top:10px;color:rgba(247,245,239,.56);font-size:10px;line-height:1.45}
@media(max-width:950px){.km-proofrail{grid-template-columns:repeat(3,1fr)}.km-proofrail article:nth-child(3){border-right:0}.km-measure-head,.km-protocol-grid,.km-offer-head,.km-receive-grid,.km-dashboard-grid{grid-template-columns:1fr}.km-offer-grid{grid-template-columns:1fr}.km-flow-grid{grid-template-columns:1fr 1fr}.km-flow-step:nth-child(2){border-right:0}}
@media(max-width:620px){.km-proofrail{grid-template-columns:repeat(2,1fr)}.km-proofrail article{min-height:95px;padding:18px 14px}.km-proofrail article:nth-child(3){border-right:1px solid rgba(255,255,255,.08)}.km-proofrail article:nth-child(2n){border-right:0}.km-proofrail strong{font-size:24px}.km-domains{grid-template-columns:1fr}.km-domain,.km-domain:nth-child(3n),.km-domain:nth-child(n+4){min-height:0;padding:19px 0;border-right:0;border-bottom:1px solid rgba(20,30,24,.1)}.km-domain:last-child{border-bottom:0}.km-domain h3{margin-top:18px}.km-protocol-list,.km-flow-grid,.km-receive-cards,.km-dashboard-panel{grid-template-columns:1fr}.km-protocol-card:nth-child(odd),.km-protocol-card:nth-child(even){padding:19px 0;border-right:0}.km-flow-step,.km-flow-step:nth-child(2){min-height:0;border-right:0;border-bottom:1px solid rgba(255,255,255,.1)}.km-flow-step:last-child{border-bottom:0}.km-flow-step h3{margin-top:20px}.km-offer{min-height:320px}.km-offer h3{margin-top:35px}.km-dashboard-panel article,.km-dashboard-panel article:nth-child(2n),.km-dashboard-panel article:nth-last-child(-n+2){min-height:110px;border-right:0;border-bottom:1px solid rgba(255,255,255,.08)}.km-dashboard-panel article:last-child{border-bottom:0}}
</style>`;

async function exists(fp){try{await access(fp);return true}catch{return false}}

function injectStyle(html){if(!html.includes('komo-motion-conversion-v1-style'))html=html.replace('</head>',css+'\n</head>');return html}
function href(c,key){if(key==='motion')return c.motionPath;if(key==='clinical')return c.clinical;return c===locales.fr?'/fr/signature/':c===locales.es?'/es/signature/':'/signature/'}

function proofRail(c){return `<section class="km-proofrail">${c.proof.map(([a,b])=>`<article><strong>${a}</strong><span>${b}</span></article>`).join('')}</section>`}
function measureSection(c){
 const d=c.domains.map(([t,p],i)=>`<article class="km-domain"><b>0${i+1}</b><h3>${t}</h3><p>${p}</p></article>`).join('');
 return `<section class="km-measure" id="what-we-measure"><div class="kt-shell"><div class="km-measure-head"><div><p class="kt-ey">${c.measureEy}</p><h2 class="kt-h2">${c.measureTitle}</h2></div><p class="kt-copy">${c.measureLead}</p></div><div class="km-domains">${d}</div></div></section>`;
}
function protocolSection(c){
 const p=c.protocols.map(([t,x])=>`<article class="km-protocol-card"><strong>${t}</strong><p>${x}</p></article>`).join('');
 return `<section class="km-protocol"><div class="kt-shell km-protocol-grid"><div><p class="kt-ey">${c.protocolEy}</p><h2 class="kt-h2">${c.protocolTitle}</h2><p class="kt-copy">${c.protocolLead}</p></div><div class="km-protocol-list">${p}</div></div></section>`;
}
function flowSection(c){
 const s=c.flow.map(([n,t,p])=>`<article class="km-flow-step"><b>${n}</b><h3>${t}</h3><p>${p}</p></article>`).join('');
 return `<section class="km-flow"><div class="kt-shell"><p class="kt-ey">${c.measureEy}</p><h2 class="kt-h2">${c.flowTitle}</h2><div class="km-flow-grid">${s}</div></div></section>`;
}
function offerSection(c){
 const cards=c.offers.map(([n,e,t,p,price,cta,key],i)=>`<article class="km-offer ${i===1?'km-offer--clinical':i===2?'km-offer--signature':''}"><div class="km-offer-top"><span>${n}</span><span>${e}</span></div><h3>${t}</h3><p>${p}</p><div class="km-offer-foot"><strong>${price}</strong><a href="${href(c,key)}">${cta} →</a></div></article>`).join('');
 return `<section class="km-offers" id="komo-offers"><div class="kt-shell"><div class="km-offer-head"><div><p class="kt-ey">${c.offersEy}</p><h2 class="kt-h2">${c.offersTitle}</h2></div><p class="kt-copy">${c.offersLead}</p></div><div class="km-offer-grid">${cards}</div></div></section>`;
}
function receiveSection(c){
 const cards=c.receive.map(([t,p])=>`<article class="km-receive-card"><strong>${t}</strong><p>${p}</p></article>`).join('');
 return `<section class="km-receive"><div class="kt-shell km-receive-grid"><div><p class="kt-ey">${c.receiveEy}</p><h2 class="kt-h2">${c.receiveTitle}</h2><p class="kt-copy">${c.receiveLead}</p><p class="km-note">${c.note}</p></div><div class="km-receive-cards">${cards}</div></div></section>`;
}

function patchHero(html,c){
 html=html.replace(/<p class="kt-lead">[\s\S]*?<\/p><div class="kt-btns"><a class="kt-btn kt-btn--dark" href="[^"]*">[^<]*<\/a><a class="kt-btn kt-btn--light" href="[^"]*">[^<]*<\/a><\/div><\/div><\/div><\/section>/,
   `<p class="kt-lead">${c.heroLead}</p><div class="kt-btns"><a class="kt-btn kt-btn--dark" href="${c.contact}">${c.primary}</a><a class="kt-btn kt-btn--light" href="#what-we-measure">${c.secondary}</a></div></div></div></section>`);
 return html;
}

async function patchHome(c){
 const fp=join(site,c.home);if(!(await exists(fp)))return;
 let html=await readFile(fp,'utf8');html=injectStyle(html);html=patchHero(html,c);
 const oldProofStart='<section class="kt-z-underhero">';
 const oldOfferStart='<section class="kt-z-section" id="komo-offers">';
 const methodStart='<section class="kt-z-section kt-z-section--sand">';
 const ps=html.indexOf(oldProofStart),os=html.indexOf(oldOfferStart),ms=html.indexOf(methodStart);
 if(ps>=0&&os>ps){
   html=html.slice(0,ps)+proofRail(c)+html.slice(os);
 }
 const os2=html.indexOf(oldOfferStart),ms2=html.indexOf(methodStart,os2);
 if(os2>=0&&ms2>os2){
   const replacement=measureSection(c)+protocolSection(c)+flowSection(c)+offerSection(c)+receiveSection(c);
   html=html.slice(0,os2)+replacement+html.slice(ms2);
 }
 await writeFile(fp,html,'utf8');
}

function motionMain(c){
 const dashboard=c.proof.map(([a,b])=>`<article><strong>${a}</strong><span>${b}</span></article>`).join('');
 return `<main id="main" class="kt-home">
<section class="km-motion-hero"><div class="kt-shell"><p class="kt-ey">KŌMØ MOTION</p><h1 class="kt-title">${c.motionHero}</h1><p class="kt-lead">${c.motionLead}</p><div class="kt-btns"><a class="kt-btn kt-btn--dark" href="${c.contact}">${c.primary}</a><a class="kt-btn kt-btn--light" href="#what-we-measure">${c.secondary}</a></div></div></section>
${proofRail(c)}
${measureSection(c)}
${protocolSection(c)}
<section class="km-dashboard"><div class="kt-shell km-dashboard-grid"><div class="km-dashboard-intro"><p class="kt-ey">${c.receiveEy}</p><h2 class="kt-h2">${c.receiveTitle}</h2><p class="kt-copy">${c.receiveLead}</p><p class="km-note">${c.note}</p></div><div class="km-dashboard-panel">${dashboard}</div></div></section>
${flowSection(c)}
${receiveSection(c)}
<section class="km-offers"><div class="kt-shell"><div class="km-offer-head"><div><p class="kt-ey">${c.offersEy}</p><h2 class="kt-h2">${c.offersTitle}</h2></div><p class="kt-copy">${c.offersLead}</p></div><div class="kt-btns"><a class="kt-btn kt-btn--dark" href="${c.contact}">${c.primary}</a><a class="kt-btn kt-btn--light" href="${c.clinical}">${c===locales.fr?'Découvrir Clinical':c===locales.es?'Descubrir Clinical':'Explore Clinical'}</a></div></div></section>
</main>`;
}

async function patchMotion(c){
 const fp=join(site,c.motion);if(!(await exists(fp)))return;
 let html=await readFile(fp,'utf8');html=injectStyle(html);
 html=/<main(?:\s[^>]*)?>[\s\S]*?<\/main>/.test(html)?html.replace(/<main(?:\s[^>]*)?>[\s\S]*?<\/main>/,motionMain(c)):html;
 await writeFile(fp,html,'utf8');
}

for(const c of Object.values(locales)){await patchHome(c);await patchMotion(c);}
console.log('[komo-motion-conversion-v1] PASS · photo-free offer cards, measurement proof, protocols, debrief and Motion conversion flow applied.');
