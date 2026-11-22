// 22/11/2026 — Nettoyage des couches du site public (avant-dernière passe du build).
// 1. Retire le sélecteur flottant « Écosystème / Accéder à Pulse » (v1) : l'en-tête actuel porte déjà le menu
//    et l'accès Pulse ; les deux boutons flottants se superposaient au contenu sur téléphone.
// 2. Pages Motion (fr, en, es) : décrivent la consultation réelle, générée depuis le protocole PULSE
//    (plateformes de force, dynamomètre, chrono ; plus de capteurs Myodev, de Two-Step ni de GLFS-25).
// 3. Contrôles : aucun script inline cassé, aucune feuille de style injectée deux fois, aucune trace
//    du sélecteur flottant, pages Motion conformes au protocole.
import {readFile,writeFile,readdir} from 'node:fs/promises';
import {join,dirname,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import {STEPS} from '../pulse-v14-src/motion-protocol.mjs';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const site=join(root,'site');
const N=STEPS.length;
const fail=[];

async function pages(dir,out=[]){
 for(const e of await readdir(dir,{withFileTypes:true})){
  const p=join(dir,e.name);
  if(e.isDirectory()){if(!/^pulse-v1\d$/.test(e.name))await pages(p,out)}
  else if(e.name.endsWith('.html'))out.push(p);
 }
 return out;
}

// 1. Sélecteur flottant v1
const ECO=[/\s*<link rel="stylesheet" href="\/assets\/ecosystem-public-v1\.css\?v=1">/g,/\s*<script defer src="\/assets\/ecosystem-public-v1\.js\?v=1"><\/script>/g];
let cleaned=0;
for(const p of await pages(site)){
 const h=await readFile(p,'utf8');
 const next=ECO.reduce((s,re)=>s.replace(re,''),h);
 if(next!==h){await writeFile(p,next);cleaned++}
}

// 2. Pages Motion
const COPY={
 'fr/motion/index.html':[
  ['<p class="kt-lead">Motion mesure la marche, la posture, l’équilibre, la force, la mobilité et l’activité musculaire. Le bilan associe questionnaires, tests fonctionnels et acquisition par capteurs, puis restitue les résultats dans Pulse.</p>',
   `<p class="kt-lead">Motion mesure la force, la puissance, l’équilibre et la marche avec des plateformes de force et un dynamomètre. Le bilan associe ${N} tests standardisés et un questionnaire, puis restitue les résultats dans Pulse.</p>`],
  ['<strong>6</strong><span>capteurs</span>','<strong>2</strong><span>plateformes de force</span>'],
  ['<strong>119</strong><span>paramètres musculaires analysés</span>','<strong>5</strong><span>forces mesurées au dynamomètre</span>'],
  ['<strong>3</strong><span>tests standardisés</span>',`<strong>${N}</strong><span>tests standardisés</span>`],
  ['<strong>1</strong><span>questionnaire locomoteur</span>','<strong>22</strong><span>questions sur votre quotidien</span>'],
  ['<h2 class="kt-h2">Marche, posture, force, équilibre, mobilité et activité musculaire</h2>','<h2 class="kt-h2">Force, puissance, équilibre, marche et symétrie</h2>'],
  ['<article><strong>Marche</strong><p>Paramètres recueillis au cours de la marche.</p></article>','<article><strong>Marche</strong><p>Vitesse sur 4 m, départ arrêté, meilleur de deux passages.</p></article>'],
  ['<article><strong>Équilibre</strong><p>Contrôle postural et stabilité lors des tests.</p></article>','<article><strong>Équilibre</strong><p>Oscillations debout yeux ouverts et fermés, appui sur un pied, sur plateformes de force.</p></article>'],
  ['<article><strong>Force</strong><p>Performance lors des tâches fonctionnelles de force.</p></article>','<article><strong>Force</strong><p>Hanche, genou et main au dynamomètre, côté par côté.</p></article>'],
  ['<article><strong>Mobilité</strong><p>Amplitude et qualité des mouvements observés.</p></article>','<article><strong>Puissance</strong><p>Lever de chaise, saut vertical et puissance des jambes.</p></article>'],
  ['<article><strong>Muscles</strong><p>Activité musculaire enregistrée pendant les tâches évaluées.</p></article>','<article><strong>Symétrie</strong><p>Écart entre le côté gauche et le côté droit, à chaque mesure.</p></article>'],
  ['<h2 class="kt-h2">Questionnaires, tests, capteurs, analyse et restitution</h2>','<h2 class="kt-h2">Tests, questionnaire, analyse et restitution</h2>'],
  ['<p>Recueil du contexte, des objectifs et du questionnaire GLFS-25.</p>','<p>Recueil du contexte et des objectifs, puis vérification de sécurité.</p>'],
  ['<p>Stand-Up Test, Two-Step Test, marche sur 4 mètres et acquisition par 6 capteurs.</p>','<p>Force au dynamomètre, équilibre et saut sur plateformes de force, marche sur 4 mètres et lever de chaise.</p>']
 ],
 'motion/index.html':[
  ['<p class="kt-lead">KŌMØ assesses gait, balance, strength, mobility and muscle activity. You leave with a baseline, three priorities and a clear plan.</p>',
   '<p class="kt-lead">KŌMØ measures strength, power, balance and gait with force platforms and a dynamometer. You leave with a baseline, three priorities and a clear plan.</p>'],
  ['<strong>6</strong><span>sensors</span>','<strong>2</strong><span>force platforms</span>'],
  ['<strong>119</strong><span>muscle-analysis indicators</span>','<strong>5</strong><span>strength tests with a dynamometer</span>'],
  ['<strong>3</strong><span>functional tests</span>',`<strong>${N}</strong><span>standardised tests</span>`],
  ['<strong>1</strong><span>locomotor questionnaire</span>','<strong>22</strong><span>questions about daily life</span>'],
  ['<article><strong>Gait</strong><p>How you move from place to place.</p></article>','<article><strong>Gait</strong><p>Walking speed over 4 m, standing start, best of two.</p></article>'],
  ['<article><strong>Balance</strong><p>How you stabilise yourself.</p></article>','<article><strong>Balance</strong><p>Sway with eyes open and closed, and single-leg stance, on force platforms.</p></article>'],
  ['<article><strong>Strength</strong><p>How you produce useful effort.</p></article>','<article><strong>Strength</strong><p>Hip, knee and grip measured with a dynamometer, side by side.</p></article>'],
  ['<article><strong>Mobility</strong><p>How your joints and body move.</p></article>','<article><strong>Power</strong><p>Chair rise, vertical jump and leg power.</p></article>'],
  ['<article><strong>Muscles</strong><p>How selected muscles activate during measured tasks.</p></article>','<article><strong>Symmetry</strong><p>Left-right difference on every measure.</p></article>'],
  ['<p>You share your context and complete the GLFS-25 questionnaire.</p>','<p>You share your context and goals, and we check safety.</p>'],
  ['<p>Stand-Up Test, Two-Step Test, 4-metre walk and analysis with 6 sensors.</p>','<p>Strength with a dynamometer, balance and jump on force platforms, a 4-metre walk and a chair-rise test.</p>']
 ],
 'es/motion/index.html':[
  ['<p class="kt-lead">KŌMØ evalúa marcha, equilibrio, fuerza, movilidad y actividad muscular. Sales con un punto de referencia, tres prioridades y un plan claro.</p>',
   '<p class="kt-lead">KŌMØ mide fuerza, potencia, equilibrio y marcha con plataformas de fuerza y un dinamómetro. Sales con un punto de referencia, tres prioridades y un plan claro.</p>'],
  ['<strong>6</strong><span>sensores</span>','<strong>2</strong><span>plataformas de fuerza</span>'],
  ['<strong>119</strong><span>indicadores del análisis muscular</span>','<strong>5</strong><span>fuerzas medidas con dinamómetro</span>'],
  ['<strong>3</strong><span>pruebas funcionales</span>',`<strong>${N}</strong><span>pruebas estandarizadas</span>`],
  ['<strong>1</strong><span>cuestionario locomotor</span>','<strong>22</strong><span>preguntas sobre tu día a día</span>'],
  ['<article><strong>Marcha</strong><p>Cómo te desplazas.</p></article>','<article><strong>Marcha</strong><p>Velocidad en 4 m, salida parada, mejor de dos pasadas.</p></article>'],
  ['<article><strong>Equilibrio</strong><p>Cómo te estabilizas.</p></article>','<article><strong>Equilibrio</strong><p>Oscilaciones de pie con ojos abiertos y cerrados, y apoyo sobre un pie, en plataformas de fuerza.</p></article>'],
  ['<article><strong>Fuerza</strong><p>Cómo produces un esfuerzo útil.</p></article>','<article><strong>Fuerza</strong><p>Cadera, rodilla y mano con dinamómetro, lado a lado.</p></article>'],
  ['<article><strong>Movilidad</strong><p>Cómo se mueven tus articulaciones y tu cuerpo.</p></article>','<article><strong>Potencia</strong><p>Levantarse de la silla, salto vertical y potencia de piernas.</p></article>'],
  ['<article><strong>Músculos</strong><p>Cómo se activan determinados músculos durante las tareas medidas.</p></article>','<article><strong>Simetría</strong><p>Diferencia entre izquierda y derecha en cada medida.</p></article>'],
  ['<p>Indicas tu contexto y completas el cuestionario GLFS-25.</p>','<p>Indicas tu contexto y tus objetivos, y verificamos la seguridad.</p>'],
  ['<p>Stand-Up Test, Two-Step Test, marcha de 4 metros y análisis con 6 sensores.</p>','<p>Fuerza con dinamómetro, equilibrio y salto en plataformas de fuerza, marcha de 4 metros y prueba de levantarse de la silla.</p>']
 ]
};
for(const [rel,pairs] of Object.entries(COPY)){
 const p=join(site,rel);let h=await readFile(p,'utf8');
 for(const [a,b] of pairs){
  if(h.includes(a))h=h.split(a).join(b);
  else if(!h.includes(b))fail.push(rel+' : texte introuvable « '+a.replace(/<[^>]+>/g,' ').trim().slice(0,60)+' »');
 }
 await writeFile(p,h);
 for(const bad of ['6 capteurs','6 sensors','6 sensores','GLFS-25','Two-Step Test, '])if(h.includes(bad))fail.push(rel+' contient encore « '+bad+' »');
}

// 3. Contrôles sur tout le site public
let scripts=0;
for(const p of await pages(site)){
 const rel=relative(site,p),h=await readFile(p,'utf8');
 if(/ecosystem-public-v1\.js/.test(h))fail.push(rel+' : sélecteur flottant encore chargé');
 const ids=[...h.matchAll(/<style[^>]*\sid="([^"]+)"/g)].map(m=>m[1]);
 const dup=ids.filter((x,i)=>ids.indexOf(x)!==i);
 if(dup.length)fail.push(rel+' : feuille injectée deux fois ('+[...new Set(dup)].join(', ')+')');
 for(const m of h.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)){
  const [,attrs,code]=m;
  if(!code.trim()||/json|importmap|module/.test(attrs))continue;
  scripts++;
  try{new vm.Script(code,{filename:rel})}catch(e){fail.push(rel+' : script inline invalide ('+e.message+')');break}
 }
}
if(fail.length){console.error('[site-layers] ÉCHEC\n  '+[...new Set(fail)].slice(0,20).join('\n  '));process.exit(1)}
console.log(`[site-layers] PASS · sélecteur flottant retiré de ${cleaned} pages · pages Motion alignées sur le protocole (${N} tests) · ${scripts} scripts inline valides · aucune feuille en double`);
