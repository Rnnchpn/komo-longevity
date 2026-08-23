import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const site=join(process.cwd(),'site');
const ORIGIN='https://komolongevity.com';

const pages={
 fr:{home:join(site,'fr','index.html'),method:'/fr/methode/',proofTitle:'Pourquoi mesurer ?',proofLead:'La mobilité est mesurable.',proofLink:'Voir les preuves et la méthode →',items:[['MARCHE','Vitesse de marche','Associée à des résultats de santé dans la littérature populationnelle.'],['MUSCLE','Force fonctionnelle','La force musculaire occupe une place centrale dans les consensus modernes sur la fonction musculaire.'],['ÉQUILIBRE','Stabilité','L’altération de l’équilibre est associée au risque de chute chez les personnes âgées.']]},
 en:{home:join(site,'index.html'),method:'/method/',proofTitle:'Why measure?',proofLead:'Mobility can be measured.',proofLink:'See the evidence and method →',items:[['GAIT','Walking speed','Associated with health outcomes in population studies.'],['MUSCLE','Functional strength','Muscle strength is central in modern consensus frameworks on muscle function.'],['BALANCE','Stability','Balance impairment is associated with fall risk in older adults.']]},
 es:{home:join(site,'es','index.html'),method:'/es/metodo/',proofTitle:'¿Por qué medir?',proofLead:'La movilidad se puede medir.',proofLink:'Ver evidencia y método →',items:[['MARCHA','Velocidad de marcha','Asociada a resultados de salud en estudios poblacionales.'],['MÚSCULO','Fuerza funcional','La fuerza muscular es central en consensos modernos sobre función muscular.'],['EQUILIBRIO','Estabilidad','El deterioro del equilibrio se asocia con riesgo de caídas en mayores.']]}
};

for(const p of Object.values(pages)){
 let h=await readFile(p.home,'utf8');
 if(!h.includes('<section class="ms-home-proof">')){
   const items=p.items.map(([ey,t,b])=>`<div class="ms-home-proof-item"><small>${ey}</small><strong>${t}</strong><p>${b}</p></div>`).join('');
   const block=`<section class="ms-home-proof"><div class="kpf-shell"><div class="ms-home-proof-grid"><div class="ms-home-proof-intro"><small>${p.proofTitle}</small><strong>${p.proofLead}</strong><a class="ms-home-proof-link" href="${p.method}">${p.proofLink}</a></div>${items}</div></div></section>`;
   h=h.replace('<section class="kpf-modes">',block+'<section class="kpf-modes">');
 }
 await writeFile(p.home,h,'utf8');
}

const descriptions={
 '/fr/methode/marche/':'Bilan de marche KŌMØ : vitesse, cadence, temporalité et symétrie selon le protocole, avec repères issus de la littérature sur la mobilité fonctionnelle.',
 '/fr/methode/tests-fonctionnels/':'Tests fonctionnels KŌMØ : Stand-Up, Two-Step et mobilité rapportée pour compléter la mesure instrumentée par des performances simples et standardisées.',
 '/fr/methode/equilibre/':'Bilan d’équilibre KŌMØ : stabilité, lecture droite-gauche, contexte de chute et suivi dans le temps, avec références scientifiques explicites.',
 '/fr/methode/controle-musculaire/':'Analyse musculaire du bilan KŌMØ : données fournies par Myodev via Myocare, puis intégrées dans Pulse avec la marche, les tests et le contexte.',
 '/fr/methode/posture/':'Bilan de posture KŌMØ : alignement du tronc et contexte rachidien, interprétés avec la fonction sans attribuer automatiquement la douleur à la posture.',
 '/fr/methode/pre-bilan-pulse/':'Pré-bilan KŌMØ Pulse : objectifs, mobilité ressentie, douleur, chutes, activité, récupération et antécédents utiles avant l’évaluation.',
 '/method/gait/':'KŌMØ gait assessment: walking speed, cadence, timing and symmetry when available, with explicit published evidence and clear methodological boundaries.',
 '/method/functional-tests/':'KŌMØ functional tests: Stand-Up, Two-Step and reported mobility complement sensor-based measures with simple standardized performance.',
 '/method/balance/':'KŌMØ balance assessment: stability, right-left reading, fall context and longitudinal follow-up with explicit scientific references.',
 '/method/muscle-control/':'KŌMØ muscle assessment uses indicators supplied by Myodev through Myocare and integrates them in Pulse with gait, tests and context.',
 '/method/posture/':'KŌMØ posture assessment describes trunk alignment and spinal context alongside function, without treating posture as an automatic cause of pain.',
 '/method/pulse-baseline/':'KŌMØ Pulse baseline collects goals, reported mobility, pain, falls, activity, recovery and relevant history before the assessment.',
 '/es/metodo/marcha/':'Evaluación de marcha KŌMØ: velocidad, cadencia, temporalidad y simetría cuando están disponibles, con referencias científicas explícitas.',
 '/es/metodo/pruebas-funcionales/':'Pruebas funcionales KŌMØ: Stand-Up, Two-Step y movilidad percibida para completar las medidas instrumentadas.',
 '/es/metodo/equilibrio/':'Evaluación del equilibrio KŌMØ: estabilidad, lectura derecha-izquierda, contexto de caídas y seguimiento longitudinal.',
 '/es/metodo/control-muscular/':'La evaluación muscular KŌMØ integra en Pulse los indicadores proporcionados por Myodev mediante Myocare.',
 '/es/metodo/postura/':'Evaluación postural KŌMØ: alineación del tronco y contexto raquídeo interpretados junto a la función, sin causalidad automática con el dolor.',
 '/es/metodo/pre-evaluacion-pulse/':'Pre-evaluación KŌMØ Pulse: objetivos, movilidad percibida, dolor, caídas, actividad, recuperación y antecedentes relevantes.'
};

for(const [path,desc] of Object.entries(descriptions)){
 const file=join(site,...path.split('/').filter(Boolean),'index.html');
 let h=await readFile(file,'utf8');
 h=h.replace(/<meta name="description" content="[^"]*">/i,`<meta name="description" content="${desc}">`)
    .replace(/<meta property="og:description" content="[^"]*">/i,`<meta property="og:description" content="${desc}">`);
 // Keep structured data aligned with the visible metadata.
 h=h.replace(/("description":)"[^"]*"/,`$1${JSON.stringify(desc)}`);
 if(!h.includes('hreflang="x-default"')){
   const fallback=path.startsWith('/fr/')?path.replace(/^\/fr\/methode\//,'/method/').replace('/marche/','/gait/').replace('/tests-fonctionnels/','/functional-tests/').replace('/equilibre/','/balance/').replace('/controle-musculaire/','/muscle-control/').replace('/posture/','/posture/').replace('/pre-bilan-pulse/','/pulse-baseline/'):
     path.startsWith('/es/')?path.replace(/^\/es\/metodo\//,'/method/').replace('/marcha/','/gait/').replace('/pruebas-funcionales/','/functional-tests/').replace('/equilibrio/','/balance/').replace('/control-muscular/','/muscle-control/').replace('/postura/','/posture/').replace('/pre-evaluacion-pulse/','/pulse-baseline/'):
     path;
   h=h.replace(/(<link rel="alternate" hreflang="es"[^>]*>)/i,`$1<link rel="alternate" hreflang="x-default" href="${ORIGIN}${fallback}">`);
 }
 await writeFile(file,h,'utf8');
}

// Localize the evidence micro-label on the main non-French Method pages.
for(const [file,label] of [[join(site,'method','index.html'),'PUBLISHED EVIDENCE'],[join(site,'es','metodo','index.html'),'EVIDENCIA PUBLICADA']]){
 let h=await readFile(file,'utf8');h=h.replaceAll('DONNÉE PUBLIÉE',label);await writeFile(file,h,'utf8');
}

for(const p of Object.values(pages)){
 const h=await readFile(p.home,'utf8');
 if(!h.includes('<section class="ms-home-proof">')) throw new Error('[method-science-polish-v1] homepage proof strip missing');
}
console.log('[method-science-polish-v1] Homepage proof strip, clean snippets and hreflang defaults applied.');